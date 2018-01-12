pragma solidity ^0.4.13;

import './BlockportToken.sol';
import './CrowdsaleWhitelist.sol';
import './zeppelin/lifecycle/Pausable.sol';
import './zeppelin/crowdsale/CappedCrowdsale.sol';
import './zeppelin/crowdsale/FinalizableCrowdsale.sol';


/// @title Blockport Token - Token code for our Blockport.nl Project
/// @author Jan Bolhuis, Wesley van Heije
//  Version 3, January 2018
//  Based on Openzeppelin framework
//
//  The Crowdsale will start after the presale which had a cap of 6.400.000 BPT Tokens
//  Minimum presale investment in Ether will be set at the start; calculated on a weekly avarage for an amount of ~ 1000 Euro
//  Unsold presale tokens will be burnt. Implemented by using MintedToken.
//  There is no bonus in the Crowdsale.
//  The total supply of tokens (pre-sale + crowdsale) will be 49,600,000 BPT
//  Minimum crowdsale investment will be 0.1 ether
//  Mac cap for the crowdsale is 43,200,000 BPT
// 
//  
contract BlockportCrowdsale is CappedCrowdsale, FinalizableCrowdsale, CrowdsaleWhitelist, Pausable {
    using SafeMath for uint256;

    address public tokenAddress;
    address public teamVault;
    address public companyVault;
    uint256 public minimalInvestmentInWei = 0.1 ether;
    uint256 public maxInvestmentInWei = 50 ether;
    
    mapping (address => uint256) internal invested;

    BlockportToken public bpToken;

    // Events for this contract
    event InitialRateChange(uint256 rate, uint256 cap);
    event InitialDateChange(uint256 startTime, uint256 endTime);

    // Initialise contract with parapametrs
    //@notice Function to initialise the token with configurable parameters. 
    //@param ` _cap - max number ot tokens available for the presale
    //@param ` _goal - goal can be set, below this value the Crowdsale becomes refundable
    //@param ' _startTime - this is the place to adapt the presale period
    //@param ` _endTime - this is the place to adapt the presale period
    //@param ` rate - initial presale rate.
    //@param ` _wallet - Multisig wallet the investments are being send to during presale
    //@param ` _tokenAddress - Token to be used, created outside the prsale contract  
    //@param ` _teamVault - Ether send to this contract will be stored  at this multisig wallet
    function BlockportCrowdsale(uint256 _cap, uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, address _tokenAddress, address _teamVault, address _companyVault) 
        CappedCrowdsale(_cap)
        Crowdsale(_startTime, _endTime, _rate, _wallet) public {
            require(_tokenAddress != address(0));
            require(_teamVault != address(0));
            require(_companyVault != address(0));
            
            tokenAddress = _tokenAddress;
            token = createTokenContract();
            teamVault = _teamVault;
            companyVault = _companyVault;
    }

    //@notice Function to cast the Capped (&mintable) token provided with the constructor to a blockporttoken that is mintabletoken.
    // This is a workaround to surpass an issue that Mintabletoken functions are not accessible in this contract.
    // We did not want to change the Openzeppelin code and we did not have the time for an extensive drill down.
    function createTokenContract() internal returns (MintableToken) {
        bpToken = BlockportToken(tokenAddress);
        return BlockportToken(tokenAddress);
    }

    // low level token purchase function
    function buyTokens(address beneficiary) public payable {
        invested[beneficiary] += msg.value;
        super.buyTokens(beneficiary);
    }

    // overriding Crowdsale#validPurchase to add extra cap logic
    // @return true if investors can buy at the moment
    function validPurchase() internal returns (bool) {
        bool moreThanMinimalInvestment = msg.value >= minimalInvestmentInWei;
        bool whitelisted = addressIsWhitelisted(msg.sender);
        bool lessThanMaxInvestment = invested[msg.sender] <= maxInvestmentInWei;

        return super.validPurchase() && moreThanMinimalInvestment && lessThanMaxInvestment && !paused && whitelisted;
    }

    //@notice Function overidden function will finanalise the Crowdsale
    // Additional tokens are allocated to the team and to the company, adding 40% in total to tokens already sold. 
    // After calling this function the blockporttoken gan be tranfered / traded by the holders of this token.
    function finalization() internal {
        uint256 totalSupply = token.totalSupply();
        uint256 twentyPercentAllocation = totalSupply.div(5);

        // mint tokens for the foundation
        token.mint(teamVault, twentyPercentAllocation);
        token.mint(companyVault, twentyPercentAllocation);

        token.finishMinting();              // No more tokens can be added from now
        bpToken.unpause();                  // ERC20 transfer functions will work after this so trading can start.
        super.finalization();               // finalise up in the tree
        
        bpToken.transferOwnership(owner);   // transfer token Ownership back to original owner
    }

    //@notice Function sets the token conversion rate in this contract
    //@param ` __rateInWei - Price of 1 Blockport token in Wei. 
    //@param ` __capInWei - Price of 1 Blockport token in Wei. 
    function setRate(uint256 _rateInWei, uint256 _capInWei) public onlyOwner returns (bool) { 
        require(startTime > block.timestamp);
        require(_rateInWei > 0);
        require(_capInWei > 0);

        rate = _rateInWei;
        cap = _capInWei;

        InitialRateChange(rate, cap);
        return true;
    }

    //@notice Function sets start and end date/time for this Crowdsale. Can be called multiple times
    //@param ' _startTime - this is the place to adapt the presale period
    //@param ` _endTime - this is the place to adapt the presale period
    function setCrowdsaleDates(uint256 _startTime, uint256 _endTime) public onlyOwner returns (bool) { 
        require(startTime > block.timestamp); // current startTime in the future
        require(_startTime >= now);
        require(_endTime >= _startTime);

        startTime = _startTime;
        endTime = _endTime;

        InitialDateChange(startTime, endTime);
        return true;
    }
}