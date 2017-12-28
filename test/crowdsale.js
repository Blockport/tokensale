const expectedExceptionPromise = require("../utils/expectedException.js");
const BlockportTokenAbi = artifacts.require('./BlockportToken.sol')
const BlockportCrowdsaleAbi = artifacts.require('./BlockportCrowdsale.sol')

let settings = require('../tokenSettings.json');

contract('BlockportCrowdsale', function(accounts) {
    
    // Setting a few accounts to test with 
    var admin = accounts[0];
    var refundVault = accounts[0];

    var user1 = accounts[3];
    var user2 = accounts[4];
    var user3 = accounts[5];
    
// - Create 2x 20% extra BPT (40%) based on total sold BPT (effectively its 2x 14,3% percent)
// - The extra BPT mentioned above is created after all tokensales are finished (end of crowdsale)
// - Contract should send these amounts to 2 different multisig contracts. (MultiSig Team + Shop)
// - The BPT amount in the pre-sale should be taken into account when creating the additional allocations of 20% and 20% because they are based on TOTAL sold BPT.

    describe("Deployment", function() {

        it ('should be possible to create a new Crowdsale contract', async() => { 

            BlockportToken = await BlockportTokenAbi.new(settings.maxTokenSupply);
            assert.isNotNull(BlockportToken);

            BlockportCrowdsale = await BlockportCrowdsaleAbi.new(settings.crowdsaleCap, settings.crowdsaleGoal, settings.crowdsaleStartTimestamp, settings.crowdsaleEndTimestamp, settings.crowdsaleRatio, settings.companyFundWallet, BlockportToken.address, settings.companyTokenVault, settings.companyTokenVault);
            assert.isNotNull(BlockportCrowdsale);
        })
    })
    
    describe("Initial settings", function() {

        it ('should start on 1st of March 2018 starting (first block after) 15:00 CET', async() => { 
            var startTime = await BlockportCrowdsale.startTime();
            assert.strictEqual(startTime.toNumber(), settings.crowdsaleStartTimestamp);
        })

        it ('should end on 31st of March 2018 starting (first block after) 15:00 CET', async() => { 
            var endTime = await BlockportCrowdsale.endTime();
            assert.strictEqual(endTime.toNumber(), settings.crowdsaleEndTimestamp);
        })
        
        it ('should have a softcap of ' + settings.crowdsaleGoal / (1e18) + ' ETH (' + settings.crowdsaleGoal + ' wei) around €250.000 (depending on the rates)', async() => { 
            var goal = await BlockportCrowdsale.goal();
            assert.strictEqual(goal.toNumber(), settings.crowdsaleGoal);
        })

        it ('should have a hardcap of ' + settings.crowdsaleCap / (1e18) + ' ETH (' + settings.crowdsaleCap + ' wei) around €9.000.000 (depending on the rates)', async() => { 
            var cap = await BlockportCrowdsale.cap();
            assert.strictEqual(cap.toNumber(), settings.crowdsaleCap);
        })
    })
    
    describe("State changes", function() {

        it ('should be possible to update start & end times', async() => { 
            var startTime = await BlockportCrowdsale.startTime();
            var endTime = await BlockportCrowdsale.endTime();

            var newStartTime = 1514991600;
            var newEndTime = 1516201200;
            var tx = await BlockportCrowdsale.setCrowdsaleDates(newStartTime, newEndTime);
            
            assert.strictEqual('InitialDateChange', tx.logs[0].event);
            assert.strictEqual(newStartTime, tx.logs[0].args.startTime.toNumber());
            assert.strictEqual(newEndTime, tx.logs[0].args.endTime.toNumber());
            
            var updatedStartTime = await BlockportCrowdsale.startTime();
            assert.strictEqual(updatedStartTime.toNumber(), newStartTime);
            var updatedEndTime = await BlockportCrowdsale.endTime();
            assert.strictEqual(updatedEndTime.toNumber(), newEndTime);
        })

        it ('should NOT be possible to update start & end times in the past or if crowdsale is running already', async() => { 
            expectedExceptionPromise(() => BlockportCrowdsale.setCrowdsaleDates(1483282800, 1488380400));
            expectedExceptionPromise(() => BlockportCrowdsale.setCrowdsaleDates(1483282800, 1488380400));
        })

        it ('should NOT be possible to update start & end times by anyone else but the owner', async() => { 
            
            var currentStartTime = await BlockportCrowdsale.startTime();
            var currentEndTime = await BlockportCrowdsale.endTime();

            expectedExceptionPromise(() => BlockportCrowdsale.setCrowdsaleDates(settings.crowdsaleStartTimestamp, settings.crowdsaleEndTimestamp, {from: user1}));
            
            var updatedStartTime = await BlockportCrowdsale.startTime();
            assert.strictEqual(updatedStartTime.toNumber(), currentStartTime.toNumber()); // old values
            var updatedEndTime = await BlockportCrowdsale.endTime();
            assert.strictEqual(updatedEndTime.toNumber(), currentEndTime.toNumber()); // old values

            var tx = await BlockportCrowdsale.setCrowdsaleDates(settings.crowdsaleStartTimestamp, settings.crowdsaleEndTimestamp, {from: admin});
            assert.strictEqual('InitialDateChange', tx.logs[0].event);
            assert.strictEqual(settings.crowdsaleStartTimestamp, tx.logs[0].args.startTime.toNumber());
            assert.strictEqual(settings.crowdsaleEndTimestamp, tx.logs[0].args.endTime.toNumber());
        })
        
        it ('should be possible to pause the crowdsale to disable purchases', async() => { 
            var pausedState = await BlockportCrowdsale.paused();
            assert.strictEqual(false, pausedState);

            var tx = await BlockportCrowdsale.pause();
            assert.strictEqual('Pause', tx.logs[0].event);
            
            pausedState = await BlockportCrowdsale.paused();
            assert.strictEqual(true, pausedState);
        })
        
        it ('should be possible to unpause the crowdsale to re-enable purchases', async() => { 
            var pausedState = await BlockportCrowdsale.paused();
            assert.strictEqual(true, pausedState);

            var tx = await BlockportCrowdsale.unpause();
            assert.strictEqual('Unpause', tx.logs[0].event);
            
            pausedState = await BlockportCrowdsale.paused();
            assert.strictEqual(false, pausedState);
        })
        
        it ('should be possible to update the rate prior to the crowdsale', async() => { 
            var currentRate = await BlockportCrowdsale.rate();

            var newRate = 1500;
            var newCap = settings.crowdsaleCap;
            var tx = await BlockportCrowdsale.setRate(newRate, newCap);
            
            assert.strictEqual('InitialRateChange', tx.logs[0].event);
            assert.strictEqual(newRate, tx.logs[0].args.rate.toNumber());
            
            var updatedRate = await BlockportCrowdsale.rate();
            assert.strictEqual(newRate, updatedRate.toNumber());
        })
        
        it ('should NOT be possible to update the rate by anyone else but the owner', async() => { 
            
            var newRate = 1500;
            var newCap = settings.crowdsaleCap;
            var currentRate = await BlockportCrowdsale.rate();
            expectedExceptionPromise(() => BlockportCrowdsale.setRate(newRate, newCap, {from: user1}));
            var reRate = await BlockportCrowdsale.rate();
            assert.strictEqual(currentRate.toNumber(), reRate.toNumber());
        })
        
        it ('should be possible to transfer token ownership to this contract address', async() => { 
            
            var tx = await BlockportToken.transferOwnership(BlockportCrowdsale.address);
            var newOwner = await BlockportToken.owner();
            assert.strictEqual('OwnershipTransferred', tx.logs[0].event);
            assert.strictEqual(newOwner, BlockportCrowdsale.address);
        })
        
        it ('should be possible to reset token ownership to the contract creator', async() => { 
            
            var tx = await BlockportCrowdsale.resetTokenOwnership();
            assert.strictEqual('OwnershipTransferred', tx.logs[0].event);
            var newOwner = await BlockportToken.owner();
            assert.strictEqual(newOwner, admin);
        })
    })
    
    describe("Funding", function() { 
        
        it ('should be possible to purchase tokens during crowdsale', async() => { 
            
            var amount = 10000000; // 1 ETH
            var today = new Date();
            var newStart = new Date(today.getTime() + 1000).getTime(); 
            var newEnd = new Date(today.getTime() + 600000).getTime(); 
            // console.log("Date: " + today.getTime());
            // console.log("Date: " + newStart);
            // console.log("Date: " + newEnd);

            var tx = await BlockportCrowdsale.setCrowdsaleDates(newStart, newEnd); 
            assert.strictEqual('InitialDateChange', tx.logs[0].event);

            var pausedState = await BlockportCrowdsale.paused();
            var raised = await BlockportCrowdsale.weiRaised();
            var cap = await BlockportCrowdsale.cap();
            var startTime = await BlockportCrowdsale.startTime();
            var endTime = await BlockportCrowdsale.endTime();

            await resolveAfterSeconds(3);

            assert.isNotTrue(pausedState);
            assert.strictEqual(0, raised.toNumber());
            assert.isBelow(raised.toNumber(), cap.toNumber());
            assert.isBelow(startTime.toNumber(), Date.now());
            assert.isBelow(Date.now(), endTime.toNumber());
            assert.isBelow(amount, cap.toNumber());
            
            // Update Token ownership to Crowdsale contract
            var tokenOwner = await BlockportToken.transferOwnership(BlockportCrowdsale.address);
            var newOwner = await BlockportToken.owner();
            assert.strictEqual(newOwner, BlockportCrowdsale.address);

            // Can't change ownership again
            expectedExceptionPromise(() => BlockportToken.transferOwnership(BlockportCrowdsale.address));

            console.log("       Assertions passed..");

            // var tokenOwner = await BlockportToken.transferOwnership(BlockportCrowdsale.address);
            
            //console.log("Sending purchase..")
            //var purchase1 = await BlockportCrowdsale.sendTransaction({ value: amount, from: user2 });
            //var purchase1 = await BlockportCrowdsale.buyTokens(user2, {from: user2, value: amount}); // (10000000000000000000 wei) 10 ETH
            // console.log(purchase1);
            // assert.strictEqual(true, purchase1);
        })
    })

    describe("Finalization", function() { 
        console.log("Finilize on Crowdsale.")
        // close crowdsale

        // goal not met => refund

        // finalize => allocate company tokens
    })
})

function resolveAfterSeconds(x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x);
      }, x*1000);
    });
  }