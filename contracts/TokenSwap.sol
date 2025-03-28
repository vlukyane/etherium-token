// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSwap is Ownable {
    IERC20 public token;
    uint256 public swapRate; // 1 ETH = swapRate tokens

    event SwapExecuted(address indexed user, uint256 ethAmount, uint256 tokenAmount);

    constructor(address _token) {
        token = IERC20(_token);
        swapRate = 100; // 1 ETH = 100 tokens
    }

    function setSwapRate(uint256 _newRate) external onlyOwner {
        swapRate = _newRate;
    }

    function swapTokensForEth(uint256 _tokenAmount) external {
        require(_tokenAmount > 0, "Amount must be greater than 0");
        require(token.balanceOf(msg.sender) >= _tokenAmount, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= _tokenAmount, "Insufficient allowance");

        uint256 ethAmount = _tokenAmount / swapRate;
        require(address(this).balance >= ethAmount, "Insufficient ETH balance");

        // Transfer tokens from user to contract
        token.transferFrom(msg.sender, address(this), _tokenAmount);

        // Transfer ETH to user
        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit SwapExecuted(msg.sender, ethAmount, _tokenAmount);
    }

    function swapEthForTokens() external payable {
        require(msg.value > 0, "ETH amount must be greater than 0");
        
        uint256 tokenAmount = msg.value * swapRate;
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient token balance");

        // Transfer tokens to user
        token.transfer(msg.sender, tokenAmount);

        emit SwapExecuted(msg.sender, msg.value, tokenAmount);
    }

    // Function to withdraw tokens (for owner)
    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(token.balanceOf(address(this)) >= _amount, "Insufficient token balance");
        token.transfer(owner(), _amount);
    }

    // Function to withdraw ETH (for owner)
    function withdrawEth(uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient ETH balance");
        (bool success, ) = owner().call{value: _amount}("");
        require(success, "ETH transfer failed");
    }

    // Function to deposit ETH to contract
    function depositEth() external payable onlyOwner {}
} 