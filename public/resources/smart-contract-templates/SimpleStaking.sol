// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SimpleStaking
 * @dev A simple staking contract that distributes rewards over time
 * @custom:security-contact security@the3rdeyeadvisors.com
 */
contract SimpleStaking is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public rewardRate; // Reward tokens per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;
    
    mapping(address => uint256) public userStakedBalance;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    event RewardAdded(uint256 reward);

    /**
     * @dev Constructor
     * @param _stakingToken The token to be staked
     * @param _rewardToken The token to be distributed as rewards
     * @param _rewardRate Initial reward rate (tokens per second)
     */
    constructor(
        address _stakingToken,
        address _rewardToken,
        uint256 _rewardRate
    ) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Calculates the current reward per token
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        
        return rewardPerTokenStored + 
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalStaked);
    }

    /**
     * @dev Calculates the earned rewards for an account
     */
    function earned(address account) public view returns (uint256) {
        return ((userStakedBalance[account] * 
            (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) + 
            rewards[account];
    }

    /**
     * @dev Modifier to update rewards before executing function
     */
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /**
     * @dev Stakes tokens into the contract
     * @param amount The amount of tokens to stake
     */
    function stake(uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        updateReward(msg.sender) 
    {
        require(amount > 0, "Cannot stake 0");
        
        totalStaked += amount;
        userStakedBalance[msg.sender] += amount;
        
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Withdraws staked tokens from the contract
     * @param amount The amount of tokens to withdraw
     */
    function withdraw(uint256 amount) 
        external 
        nonReentrant 
        updateReward(msg.sender) 
    {
        require(amount > 0, "Cannot withdraw 0");
        require(userStakedBalance[msg.sender] >= amount, "Insufficient balance");
        
        totalStaked -= amount;
        userStakedBalance[msg.sender] -= amount;
        
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Claims accumulated rewards
     */
    function claimReward() 
        external 
        nonReentrant 
        updateReward(msg.sender) 
    {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards available");
        
        rewards[msg.sender] = 0;
        rewardToken.safeTransfer(msg.sender, reward);
        
        emit RewardPaid(msg.sender, reward);
    }

    /**
     * @dev Withdraws all staked tokens and claims rewards
     */
    function exit() external {
        withdraw(userStakedBalance[msg.sender]);
        claimReward();
    }

    /**
     * @dev Updates the reward rate (only owner)
     * @param _rewardRate The new reward rate
     */
    function setRewardRate(uint256 _rewardRate) 
        external 
        onlyOwner 
        updateReward(address(0)) 
    {
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    /**
     * @dev Adds reward tokens to the contract
     * @param amount The amount of reward tokens to add
     */
    function notifyRewardAmount(uint256 amount) 
        external 
        onlyOwner 
        updateReward(address(0)) 
    {
        require(amount > 0, "Cannot add 0 rewards");
        rewardToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardAdded(amount);
    }

    /**
     * @dev Pauses staking operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses staking operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw function for owner
     */
    function emergencyWithdraw(address token, uint256 amount) 
        external 
        onlyOwner 
    {
        IERC20(token).safeTransfer(owner(), amount);
    }
}