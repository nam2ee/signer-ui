// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol, address initialOwner) 
        ERC20(name, symbol) 
        Ownable(initialOwner)
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

contract TokenFactory {
    event TokenCreated(address tokenAddress, string name, string symbol, address owner);

    function createToken(string memory name, string memory symbol) public returns (address) {
        CustomToken newToken = new CustomToken(name, symbol, msg.sender);
        emit TokenCreated(address(newToken), name, symbol, msg.sender);
        return address(newToken);
    }
}