var Whitelist = artifacts.require("./Whitelist.sol");
var SafeMath = artifacts.require("./zeppelin/math/SafeMath.sol");
var RefundVault = artifacts.require("./zeppelin/crowdsale/RefundVault.sol");
var BlockportToken = artifacts.require("./BlockportToken.sol");
var BlockportPresale = artifacts.require("./BlockportPresale.sol");
var BlockportCrowdsale = artifacts.require("./BlockportCrowdsale.sol");

let settings = require('../tokenSettings.json');

module.exports = function(deployer, network, accounts) {
    
    // Account & Wallet configuration
    var admin = accounts[0];
    var refundVault = accounts[0]; // TODO: Separate refund wallet?

    // Deploying..
    deployer.deploy(SafeMath);
    deployer.link(SafeMath, BlockportPresale, BlockportCrowdsale);
    deployer.deploy(RefundVault, refundVault);
    deployer.link(RefundVault, BlockportCrowdsale);

    var presaleRate = new web3.BigNumber(settings.presaleRatio);
    var crowdsaleRate = new web3.BigNumber(settings.crowdsaleRatio);
    deployer.deploy(BlockportToken, settings.maxTokenSupply).then(function() {
        return deployer.deploy(BlockportPresale, settings.presaleCap, settings.presaleStartTimestamp, settings.presaleEndTimestamp, presaleRate, settings.companyFundWallet, BlockportToken.address);
    }).then(function() { 
        return deployer.deploy(BlockportCrowdsale, settings.crowdsaleCap, settings.crowdsaleGoal, settings.crowdsaleStartTimestamp, settings.crowdsaleEndTimestamp, crowdsaleRate, settings.companyFundWallet, BlockportToken.address, settings.companyTokenVault, settings.companyTokenVault);
    });      
};