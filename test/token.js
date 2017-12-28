const expectedExceptionPromise = require("../utils/expectedException.js");
const BlockportTokenAbi = artifacts.require('./BlockportToken.sol')

let settings = require('../tokenSettings.json');

contract('BlockportToken', function(accounts) {

    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const user4 = accounts[4];
    const user5 = accounts[5];

    describe("Initial settings", function() {

        it ('should be possible to create a new Blockport ("BPT") token', async() => { 
            BlockportToken = await BlockportTokenAbi.new(settings.maxTokenSupply);
            assert.isNotNull(BlockportToken);
        })

        it ('should have the correct token settings', async() => { 
            var name = await BlockportToken.name();
            assert.strictEqual(name, settings.name);
            var symbol = await BlockportToken.symbol();
            assert.strictEqual(symbol, settings.symbol);
            var decimals = await BlockportToken.decimals();
            assert.strictEqual(decimals.toNumber(), settings.decimals);            
            var cap = await BlockportToken.cap();
            assert.strictEqual(cap.toNumber(), settings.maxTokenSupply);
            
            var paused = await BlockportToken.paused();
            assert.strictEqual(true, paused);
        })

        it ('should be in paused and non-transfer mode', async() => { 
            
            var paused = await BlockportToken.paused();
            assert.strictEqual(true, paused);
        })
    })
    
    describe("State transfers", function() {

        it ('should NOT be possible to pause if it is already paused', async() => { 
            expectedExceptionPromise(() => BlockportToken.pause());

            var paused = await BlockportToken.paused();
            assert.strictEqual(true, paused);
        })
        
        it ('should NOT be possible for anyone besides the owner to unpause', async() => { 
            expectedExceptionPromise(() => BlockportToken.unpause({from : user1}));
        })

        it ('should be possible to unpause if it is in paused', async() => { 
            var tx = await BlockportToken.unpause();

            assert.strictEqual("Unpause", tx.logs[0].event)
            var paused = await BlockportToken.paused();
            assert.strictEqual(false, paused);
        })

        it ('should NOT be possible for anyone besides the owner to pause', async() => { 
            expectedExceptionPromise(() => BlockportToken.pause({from : user1}));
        })

        it ('should be possible to pause again if it un-paused', async() => { 
            var tx = await BlockportToken.pause();

            assert.strictEqual("Pause", tx.logs[0].event)
            var paused = await BlockportToken.paused();
            assert.strictEqual(true, paused);
        })
    })

    describe("Funding", function() {

        it ('should NOT be possible to purchase in non-funding mode', async() => { 
            expectedExceptionPromise(() => BlockportToken.purchase({from : user1, value : 1000}));
        })

        it ('should NOT be possible for anyone besides the owner to mint new tokens', async() => { 
            expectedExceptionPromise(() => BlockportToken.mint(user1, 1000, {from : user1}));
        })
    })
})