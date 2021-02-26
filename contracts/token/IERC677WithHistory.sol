// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


interface IERC677WithHistory {
    function balanceAt(address account, uint64 timestamp) external view returns (uint192);
    function clearAccountHistory() external;
}