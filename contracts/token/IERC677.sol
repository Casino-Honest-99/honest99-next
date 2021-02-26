// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


interface IERC677 {
    function transferAndCall(address to, uint value, bytes memory data) public virtual returns (bool success);
}