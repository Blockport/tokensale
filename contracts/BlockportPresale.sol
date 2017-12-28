pragma solidity ^0.4.13;

import './BlockportToken.sol';
import './Whitelist.sol';
import './zeppelin/lifecycle/Pausable.sol';
import './zeppelin/crowdsale/CappedCrowdsale.sol';

/// @title Blockport Token - Token code for our Blockport.nl Project
/// @author Jan Bolhuis, Wesley van Heije
//  Version 3, december 2017
//  Based on Openzeppelin with an aye on the Pillarproject code.
//
//  There will be a presale cap of 6.400.000 BPT Tokens
//  Minimum presale investment in Ether will be set at the start; calculated on a weekly avarage for an amount of ~ 1000 Euro
//  Unsold presale tokens will be burnt
//  Presale rate has a 33% bonus to the crowdsale to compensate the extra risk. This is implemented by setting the rate on the presale and Crowdsale contacts.
//  The total supply of tokens (pre-sale + crowdsale) will be 49,600,000 BPT
//  Minimum crowdsale investment will be 0.1 ether
//  Mac cap for the crowdsale is 43,200,000 BPT
//

contract BlockportPresale is CappedCrowdsale, Whitelist, Pausable {

    address public tokenAddress;
    uint256 public minimalInvestmentInWei = 1.7 ether;       // Is to be set when setting the rate

    BlockportToken public bpToken;

    event InitialRateChange(uint256 rate, uint256 cap, uint256 minimalInvestment);

    // Initialise contract with parapametrs
    //@notice Function to initialise the token with configurable parameters. 
    //@param ` _cap - max number ot tokens available for the presale
    //@param ' _startTime - this is the place to adapt the presale period
    //@param ` _endTime - this is the place to adapt the presale period
    //@param ` rate - initial presale rate.
    //@param ` _wallet - Multisig wallet the investments are being send to during presale
    //@param ` _tokenAddress - Token to be used, created outside the prsale contract  
    function BlockportPresale(uint256 _cap, uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, address _tokenAddress) 
        CappedCrowdsale(_cap) 
        Crowdsale(_startTime, _endTime, _rate, _wallet) public {
            tokenAddress = _tokenAddress;
            token = createTokenContract();
        }

    //@notice Function to cast the Capped (&mintable) token provided with the constructor to a blockporttoken that is mintabletoken.
    // This is a workaround to surpass an issue that Mintabletoken functions are not accessible in this contract.
    // We did not want to change the Openzeppelin code and we did not have the time for an extensive drill down.
    function createTokenContract() internal returns (MintableToken) {
        bpToken = BlockportToken(tokenAddress);
        return BlockportToken(tokenAddress);
    }

    // overriding Crowdsale#validPurchase to add extra cap logic
    // @return true if investors can buy at the moment
    function validPurchase() internal returns (bool) {
        bool minimalInvested = msg.value >= minimalInvestmentInWei;
        bool whitelisted = addressIsWhitelisted(msg.sender);

        return super.validPurchase() && minimalInvested && !paused && whitelisted;
    }

    //@notice Function sets the token conversion rate in this contract
    //@param ` __rateInWei - Price of 1 Blockport token in Wei. 
    //@param ` __capInWei - Cap of the Presale in Wei. 
    //@param ` __minimalInvestmentInWei - Minimal investment in Wei. 
    function setRate(uint256 _rateInWei, uint256 _capInWei, uint256 _minimalInvestmentInWei) public onlyOwner returns (bool) { 
        require(startTime >= block.timestamp); // can't update anymore if sale already started
        require(_rateInWei > 0);
        require(_capInWei > 0);
        require(_minimalInvestmentInWei > 0);

        rate = _rateInWei;
        cap = _capInWei;
        minimalInvestmentInWei = _minimalInvestmentInWei;

        InitialRateChange(rate, cap, minimalInvestmentInWei);
        return true;
    }

    //@notice Function sets the token owner to contract owner
    function resetTokenOwnership() onlyOwner public { 
        bpToken.transferOwnership(owner);
    }
}