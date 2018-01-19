var SafeMath = artifacts.require("./zeppelin/math/SafeMath.sol");
var BlockportToken = artifacts.require("./BlockportToken.sol");
var BlockportCrowdsale = artifacts.require("./BlockportCrowdsale.sol");

let settings = require('../tokenSettings.json');

module.exports = function(deployer, network, accounts) {

    // Account & Wallet configuration
    var admin = accounts[0];
    var refundVault = accounts[0];
    var crowdsaleRate = new web3.BigNumber(settings.crowdsaleRatio);
    
    // Deploying..
    deployer.link(SafeMath, BlockportCrowdsale);
    deployer.deploy(BlockportCrowdsale, settings.crowdsaleCap, settings.crowdsaleStartTimestamp, settings.crowdsaleEndTimestamp, crowdsaleRate, settings.companyFundWallet, BlockportToken.address, settings.companyTokenVault, settings.companyTokenVault);
}