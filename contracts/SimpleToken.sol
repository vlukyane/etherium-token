// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SimpleToken is ERC20, Ownable, Pausable {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Mint 1000 tokens to the contract creator
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    // Function to mint new tokens (only owner can call)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Function to burn tokens
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    // Function to pause token transfers (only owner can call)
    function pause() public onlyOwner {
        _pause();
    }

    // Function to unpause token transfers (only owner can call)
    function unpause() public onlyOwner {
        _unpause();
    }

    // Override transfer function to respect pause state
    function transfer(address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }

    // Override transferFrom function to respect pause state
    function transferFrom(address from, address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
} 