pragma solidity ^0.4.13;

import './zeppelin/ownership/Ownable.sol';

contract Whitelist is Ownable {
    
    mapping(address => bool) allowedAddresses;
    uint count = 0;
    
    modifier whitelisted() {
        require(allowedAddresses[msg.sender] == true);
        _;
    }

    function addToWhitelist(address[] _addresses) public onlyOwner {
        for (uint i = 0; i < _addresses.length; i++) {
            allowedAddresses[_addresses[i]] = true;
            count++;
            WhitelistUpdated(block.timestamp, "Added", _addresses[i], count);
        }        
    }

    function removeFromWhitelist(address[] _addresses) public onlyOwner {
        for (uint i = 0; i < _addresses.length; i++) {
            allowedAddresses[_addresses[i]] = false;
            count--;
            WhitelistUpdated(block.timestamp, "Removed", _addresses[i], count);
        }         
    }
    
    function isWhitelisted() public whitelisted constant returns (bool) {
        return true;
    }

    function addressIsWhitelisted(address _address) public constant returns (bool) {
        return allowedAddresses[_address];
    }

    function getAddressCount() public constant returns (uint) {
        return count;
    }

    event WhitelistUpdated(uint timestamp, string operation, address indexed member, uint totalAddresses);
}