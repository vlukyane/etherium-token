// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSwap is Ownable {
    IERC20 public token;
    uint256 public baseRate; // Base rate for initial price calculation
    uint256 public minRate; // Minimum allowed rate
    uint256 public maxRate; // Maximum allowed rate
    uint256 public constant PRECISION = 10000; // Precision for rate calculations

    event SwapExecuted(address indexed user, uint256 ethAmount, uint256 tokenAmount);
    event RateUpdated(uint256 newRate);
    event TokensDeposited(uint256 amount);
    event TokensWithdrawn(uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
        // Initial rate: 1 SMPL = 0.01 ETH (100 tokens per ETH)
        baseRate = 100;
        minRate = 50; // 0.02 ETH per token
        maxRate = 200; // 0.005 ETH per token
    }

    // Calculate current swap rate based on contract's token balance
    function getCurrentRate() public view returns (uint256) {
        uint256 tokenBalance = token.balanceOf(address(this));
        uint256 ethBalance = address(this).balance;
        
        if (ethBalance == 0) return baseRate;
        
        // Calculate rate based on ETH/token ratio
        uint256 calculatedRate = (ethBalance * PRECISION) / tokenBalance;
        
        // Ensure rate is within bounds
        if (calculatedRate < minRate) return minRate;
        if (calculatedRate > maxRate) return maxRate;
        
        return calculatedRate;
    }

    function setRateBounds(uint256 _minRate, uint256 _maxRate) external onlyOwner {
        require(_minRate < _maxRate, "Min rate must be less than max rate");
        minRate = _minRate;
        maxRate = _maxRate;
    }

    function swapTokensForEth(uint256 _tokenAmount) external {
        require(_tokenAmount > 0, "Amount must be greater than 0");
        require(token.balanceOf(msg.sender) >= _tokenAmount, "Insufficient token balance");
        require(token.allowance(msg.sender, address(this)) >= _tokenAmount, "Insufficient allowance");

        uint256 currentRate = getCurrentRate();
        uint256 ethAmount = (_tokenAmount * currentRate) / PRECISION;
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
        
        uint256 currentRate = getCurrentRate();
        uint256 tokenAmount = (msg.value * PRECISION) / currentRate;
        require(token.balanceOf(address(this)) >= tokenAmount, "Insufficient token balance");

        // Transfer tokens to user
        token.transfer(msg.sender, tokenAmount);

        emit SwapExecuted(msg.sender, msg.value, tokenAmount);
    }

    // Function to deposit tokens to contract (for owner)
    function depositTokens(uint256 _amount) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        emit TokensDeposited(_amount);
    }

    // Function to withdraw tokens (for owner)
    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(token.balanceOf(address(this)) >= _amount, "Insufficient token balance");
        require(token.transfer(owner(), _amount), "Token transfer failed");
        emit TokensWithdrawn(_amount);
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