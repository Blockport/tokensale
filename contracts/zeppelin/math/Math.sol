pragma solidity ^0.4.13;

/**
 * @title Math
 * @dev Assorted math operations
 */

library Math {
  function max64(uint64 a, uint64 b) internal  returns (uint64) {
    return a >= b ? a : b;
  }

  function min64(uint64 a, uint64 b) internal  returns (uint64) {
    return a < b ? a : b;
  }

  function max256(uint256 a, uint256 b) internal  returns (uint256) {
    return a >= b ? a : b;
  }

  function min256(uint256 a, uint256 b) internal  returns (uint256) {
    return a < b ? a : b;
  }
}
