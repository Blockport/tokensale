const expectedExceptionPromise = require("../utils/expectedException.js");
const WhitelistAbi = artifacts.require('./Whitelist.sol')

contract('Whitelist', function(accounts) {
    const acc = accounts;
    const admin = acc[0];
    const user1 = acc[1];
    const user2 = acc[2];
    const user3 = acc[3];
    const user4 = acc[4];
    const user5 = acc[5];
    
    beforeEach(async () => {
        Whitelist = await WhitelistAbi.new({ from: admin });

        assert.isNotNull(Whitelist);
    })
    
    it ('should be possible to add a single address to the whitelist', async() => { 
        var tx = await Whitelist.addToWhitelist([user1]);        
        assert.strictEqual(user1, tx.logs[0].args.member);
        assert.strictEqual('Added', tx.logs[0].args.operation);
    })

    it ('should be possible to add a single address to the whitelist and check if it is whitelisted', async() => { 
        var whitelisted = await Whitelist.addressIsWhitelisted(user1);
        assert.isFalse(whitelisted);

        var tx = await Whitelist.addToWhitelist([user1]);
        assert.strictEqual(user1, tx.logs[0].args.member);
        assert.strictEqual('Added', tx.logs[0].args.operation);
        console.log("Gas: " + tx.receipt.gasUsed);

        var whitelisted = await Whitelist.addressIsWhitelisted(user1);
        assert.isTrue(whitelisted);
        
        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(1, totalCount.toNumber());
        assert.strictEqual(1, tx.logs[0].args.totalAddresses.toNumber());
    })
    
    it ('should be possible to add multiple addresses to the whitelist', async() => { 
        var tx = await Whitelist.addToWhitelist([user1, user2, user3]);
        assert.strictEqual(user1, tx.logs[0].args.member);
        assert.strictEqual(user2, tx.logs[1].args.member);
        assert.strictEqual(user3, tx.logs[2].args.member);

        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(3, totalCount.toNumber());
        assert.strictEqual(3, tx.logs[2].args.totalAddresses.toNumber());
    })
    
    it ('should be possible to add 10 addresses to the whitelist', async() => { 
        var tx = await Whitelist.addToWhitelist([user1, user2, user3, user4, user5, user1, user2, user3, user4, user5]);

        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(10, totalCount.toNumber());

        //console.log(tx.receipt.gasUsed); // 261701
        /* 
            Gas Used = 261.701;
            Gas Price = 10 gwei
            Transaction fee (ETH) = 0.0002617
            Transaction fee (Fiat) = $0.19235
        */
    })
    
    it ('should be possible to add 50 addresses to the whitelist', async() => { 
        var tx = await Whitelist.addToWhitelist([
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5,
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5,
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5,
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5,
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5]);

        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(50, totalCount.toNumber());

        //console.log(tx.receipt.gasUsed); 
        /* 
            Gas Used = 859.227;
            Gas Price = 10 gwei
            Transaction fee (ETH) = 0.0008592
            Transaction fee (Fiat) = $0.63151
        */
    })
    
    it ('should not be possible to add addresses by anyone other than the owner', async() => { 
        expectedExceptionPromise(() => Whitelist.addToWhitelist([user1, user2], {from : user1}));
    })
    
    it ('should be possible to add multiple addresses to the whitelist and remove one', async() => { 
        var tx = await Whitelist.addToWhitelist([user1, user2, user3]);
        assert.strictEqual(user1, tx.logs[0].args.member);
        assert.strictEqual(user2, tx.logs[1].args.member);
        assert.strictEqual(user3, tx.logs[2].args.member);

        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(3, totalCount.toNumber());
        assert.strictEqual(3, tx.logs[2].args.totalAddresses.toNumber());

        var tx = await Whitelist.removeFromWhitelist([user1]);
        assert.strictEqual(user1, tx.logs[0].args.member);
        console.log("Gas: " + tx.receipt.gasUsed);

        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(2, totalCount.toNumber());

        var whitelisted = await Whitelist.addressIsWhitelisted(user1);
        assert.isFalse(whitelisted);
    })

    it ('should be possible to add multiple addresses to the whitelist and remove multiple', async() => { 
        var tx = await Whitelist.addToWhitelist([user1, user2, user3]);
        assert.strictEqual(user1, tx.logs[0].args.member);
        assert.strictEqual(user2, tx.logs[1].args.member);
        assert.strictEqual(user3, tx.logs[2].args.member);

        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(3, totalCount.toNumber());
        assert.strictEqual(3, tx.logs[2].args.totalAddresses.toNumber());

        var tx = await Whitelist.removeFromWhitelist([user1, user2]);
        assert.strictEqual(user1, tx.logs[0].args.member);
        assert.strictEqual(user2, tx.logs[1].args.member);

        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(1, totalCount.toNumber());
        
        var whitelisted = await Whitelist.addressIsWhitelisted(user3);
        assert.isTrue(whitelisted);
    })
    
    
    it ('should be possible to add 10 addresses to the whitelist and remove them again', async() => { 
        var users = [user1, user2, user3, user4, user5, user1, user2, user3, user4, user5];
        var tx = await Whitelist.addToWhitelist(users);

        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(users.length, totalCount.toNumber());

        var tx = await Whitelist.removeFromWhitelist(users); // Gas Used = 85.855
        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(0, totalCount.toNumber());
    })
    
    it ('should be possible to add 50 addresses to the whitelist and remove them again', async() => { 
        var users = [
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5,
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5,
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5,
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5,
            user1, user2, user3, user4, user5, user1, user2, user3, user4, user5]
        var tx = await Whitelist.addToWhitelist(users);

        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(users.length, totalCount.toNumber());

        var tx = await Whitelist.removeFromWhitelist(users); // Gas Used = 679.355
        var totalCount = await Whitelist.getAddressCount(); 
        assert.strictEqual(0, totalCount.toNumber());
    })
    
    it ('should be possible for an address itself to verify it is whitelisted', async() => { 
        
        expectedExceptionPromise(() => Whitelist.isWhitelisted({from : user1}));

        var tx = await Whitelist.addToWhitelist([user1]);        
        assert.strictEqual(user1, tx.logs[0].args.member);
        assert.strictEqual('Added', tx.logs[0].args.operation);

        var whitelisted = await Whitelist.isWhitelisted({from : user1});
        assert.isTrue(whitelisted);
    })
})
