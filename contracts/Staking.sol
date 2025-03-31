// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable {
    IERC20 public immutable token;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 apy;
        bool isActive;
        bool rewardsClaimed;
    }
    
    mapping(address => Stake[]) public stakes;
    mapping(address => uint256) public totalStaked;
    
    // Периоды стейкинга (в минутах)
    uint256 public constant SHORT_PERIOD = 1;
    uint256 public constant LONG_PERIOD = 10;
    
    // APY для разных периодов (в процентах)
    uint256 public shortAPY = 1000; // 1000% APY для короткого периода
    uint256 public longAPY = 100;   // 100% APY для длинного периода
    
    // Пенальти за ранний анстейк (в процентах)
    uint256 public constant EARLY_WITHDRAWAL_PENALTY = 5;
    
    event Staked(address indexed user, uint256 amount, uint256 period);
    event Unstaked(address indexed user, uint256 amount, bool early);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    constructor(address _token) {
        token = IERC20(_token);
    }
    
    function stake(uint256 amount, uint256 period) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(period == SHORT_PERIOD || period == LONG_PERIOD, "Invalid period");
        
        uint256 apy = period == SHORT_PERIOD ? shortAPY : longAPY;
        uint256 endTime = block.timestamp + (period * 1 minutes);
        
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        stakes[msg.sender].push(Stake({
            amount: amount,
            startTime: block.timestamp,
            endTime: endTime,
            apy: apy,
            isActive: true,
            rewardsClaimed: false
        }));
        
        totalStaked[msg.sender] += amount;
        emit Staked(msg.sender, amount, period);
    }
    
    function unstake(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < stakes[msg.sender].length, "Invalid stake index");
        Stake storage userStake = stakes[msg.sender][stakeIndex];
        require(userStake.isActive, "Stake is not active");
        
        uint256 amount = userStake.amount;
        bool early = block.timestamp < userStake.endTime;
        
        if (early) {
            // Применяем пенальти
            amount = amount * (100 - EARLY_WITHDRAWAL_PENALTY) / 100;
        } else if (!userStake.rewardsClaimed) {
            // Если стейк закончился и награды не получены, добавляем их
            uint256 timeStaked = userStake.endTime - userStake.startTime;
            uint256 rewards = calculateRewards(userStake.amount, userStake.apy, timeStaked);
            amount += rewards;
            userStake.rewardsClaimed = true;
        }
        
        userStake.isActive = false;
        totalStaked[msg.sender] -= userStake.amount;
        
        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount, early);
    }
    
    function claimRewards(uint256 stakeIndex) external nonReentrant {
        require(stakeIndex < stakes[msg.sender].length, "Invalid stake index");
        Stake storage userStake = stakes[msg.sender][stakeIndex];
        require(userStake.isActive, "Stake is not active");
        require(block.timestamp >= userStake.endTime, "Staking period not ended");
        require(!userStake.rewardsClaimed, "Rewards already claimed");
        
        uint256 timeStaked = userStake.endTime - userStake.startTime;
        uint256 rewards = calculateRewards(userStake.amount, userStake.apy, timeStaked);
        
        // Отправляем награды
        require(token.transfer(msg.sender, rewards), "Rewards transfer failed");
        
        // Помечаем награды как полученные
        userStake.rewardsClaimed = true;
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    function calculateRewards(uint256 amount, uint256 apy, uint256 timeStaked) internal pure returns (uint256) {
        return (amount * apy * timeStaked) / (365 days * 100);
    }
    
    function getStakes(address user) external view returns (Stake[] memory) {
        return stakes[user];
    }
    
    function getTotalStaked(address user) external view returns (uint256) {
        return totalStaked[user];
    }
} 