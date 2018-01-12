const expectedExceptionPromise = require("../utils/expectedException.js");
const CrowdsaleWhitelistAbi = artifacts.require('./CrowdsaleWhitelist.sol')

contract('CrowdsaleWhitelist', function(accounts) {
    const acc = accounts;
    const admin = acc[0];
    const user1 = acc[1];
    const user2 = acc[2];
    const user3 = acc[3];
    const user4 = acc[4];
    const user5 = acc[5];
    const user6 = acc[6];
    const user7 = acc[7];
    const user8 = acc[8];
    const user9 = acc[9];
    const user10 = acc[0];
    
    beforeEach(async () => {
        CrowdsaleWhitelist = await CrowdsaleWhitelistAbi.new({ from: admin });

        assert.isNotNull(CrowdsaleWhitelist);
    })
    
    it ('should be possible to add a single address to the whitelist', async() => { 
        var tx = await CrowdsaleWhitelist.addToWhitelist([user1]);
        assert.strictEqual("WhitelistUpdated", tx.logs[0].event);
        assert.strictEqual('Added', tx.logs[0].args.operation);
    })

    it ('should be possible to add a single address to the whitelist and check if it is whitelisted', async() => { 
        var whitelisted = await CrowdsaleWhitelist.addressIsWhitelisted(user1);
        assert.isFalse(whitelisted);

        var tx = await CrowdsaleWhitelist.addToWhitelist([user1]);
        assert.strictEqual('Added', tx.logs[0].args.operation);
        console.log("1 address: " + tx.receipt.gasUsed);

        var whitelisted = await CrowdsaleWhitelist.addressIsWhitelisted(user1);
        assert.isTrue(whitelisted);
        
        var totalCount = await CrowdsaleWhitelist.getAddressCount(); 
        assert.strictEqual(1, totalCount.toNumber());
        assert.strictEqual(1, tx.logs[0].args.totalAddresses.toNumber());
    })
    
    it ('should be possible to add multiple addresses to the whitelist', async() => { 
        var tx = await CrowdsaleWhitelist.addToWhitelist([user1, user2, user3]);
        assert.strictEqual("WhitelistUpdated", tx.logs[0].event);
        assert.strictEqual('Added', tx.logs[0].args.operation);
        console.log("3 addresses: " + tx.receipt.gasUsed); 

        var totalCount = await CrowdsaleWhitelist.getAddressCount(); 
        assert.strictEqual(3, totalCount.toNumber());
        assert.strictEqual(3, tx.logs[0].args.totalAddresses.toNumber());
    })
    
    it ('should be possible to add 10 addresses to the whitelist', async() => { 
        var tx = await CrowdsaleWhitelist.addToWhitelist([user1, user2, user3, user4, user5, user6, user7, user8, user9, user10]);
        assert.strictEqual("WhitelistUpdated", tx.logs[0].event);

        var totalCount = await CrowdsaleWhitelist.getAddressCount(); 
        assert.strictEqual(10, totalCount.toNumber());

        console.log("10 addresses: " + tx.receipt.gasUsed); 
    })
    
    it ('should not be possible to add addresses by anyone other than the owner', async() => { 
        expectedExceptionPromise(() => CrowdsaleWhitelist.addToWhitelist([user1, user2], {from : user1}));
    })
    
    it ('should be possible to add multiple addresses to the whitelist and remove one', async() => { 
        var tx = await CrowdsaleWhitelist.addToWhitelist([user1, user2, user3]);
        assert.strictEqual("WhitelistUpdated", tx.logs[0].event);

        var totalCount = await CrowdsaleWhitelist.getAddressCount(); 
        assert.strictEqual(3, totalCount.toNumber());
        assert.strictEqual(3, tx.logs[0].args.totalAddresses.toNumber());

        var tx = await CrowdsaleWhitelist.removeFromWhitelist([user1]);
        assert.strictEqual("WhitelistUpdated", tx.logs[0].event);
        console.log("Gas: " + tx.receipt.gasUsed);

        var totalCount = await CrowdsaleWhitelist.getAddressCount(); 
        assert.strictEqual(2, totalCount.toNumber());

        var whitelisted = await CrowdsaleWhitelist.addressIsWhitelisted(user1);
        assert.isFalse(whitelisted);
    })

    it ('should be possible to add multiple addresses to the whitelist and remove multiple', async() => { 
        var tx = await CrowdsaleWhitelist.addToWhitelist([user1, user2, user3]);
        assert.strictEqual("WhitelistUpdated", tx.logs[0].event);

        var totalCount = await CrowdsaleWhitelist.getAddressCount(); 
        assert.strictEqual(3, totalCount.toNumber());
        assert.strictEqual(3, tx.logs[0].args.totalAddresses.toNumber());

        var tx = await CrowdsaleWhitelist.removeFromWhitelist([user1, user2]);
        assert.strictEqual("WhitelistUpdated", tx.logs[0].event);

        var totalCount = await CrowdsaleWhitelist.getAddressCount(); 
        assert.strictEqual(1, totalCount.toNumber());
        
        var whitelisted = await CrowdsaleWhitelist.addressIsWhitelisted(user3);
        assert.isTrue(whitelisted);
    })    
    
    it ('should be possible to add 10 addresses to the whitelist and remove them again', async() => { 
        var users = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10];
        var tx = await CrowdsaleWhitelist.addToWhitelist(users);

        var totalCount = await CrowdsaleWhitelist.getAddressCount(); 
        assert.strictEqual(users.length, totalCount.toNumber());

        var tx = await CrowdsaleWhitelist.removeFromWhitelist(users); // Gas Used = 85.855
        var totalCount = await CrowdsaleWhitelist.getAddressCount(); 
        assert.strictEqual(0, totalCount.toNumber());
    })
    
    it ('should be possible for an address itself to verify it is whitelisted', async() => { 
        
        expectedExceptionPromise(() => CrowdsaleWhitelist.isWhitelisted({from : user1}));

        var tx = await CrowdsaleWhitelist.addToWhitelist([user1]);
        assert.strictEqual("WhitelistUpdated", tx.logs[0].event);

        var whitelisted = await CrowdsaleWhitelist.isWhitelisted({from : user1});
        assert.isTrue(whitelisted);
    })
})
