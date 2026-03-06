# Smart Contract Templates
### By Sentinel DeFi

This package contains production-ready Solidity smart contract templates for common DeFi use cases. All contracts follow best security practices and include comprehensive documentation.

## 📦 Included Templates

### 1. ERC20Token.sol
A fully-featured ERC20 token implementation with:
- ✅ Mintable functionality with max supply cap
- ✅ Burnable tokens
- ✅ Pausable transfers for emergency situations
- ✅ Owner controls with OpenZeppelin Ownable
- ✅ Comprehensive events for tracking
- ✅ Decimal customization

**Use Cases:**
- Governance tokens
- Utility tokens
- Reward tokens
- Project tokens

### 2. SimpleStaking.sol
A time-based staking contract with reward distribution:
- ✅ Stake any ERC20 token
- ✅ Earn rewards in any ERC20 token
- ✅ Continuous reward accrual per second
- ✅ Emergency pause functionality
- ✅ Non-custodial (users control their funds)
- ✅ Reentrancy protection

**Use Cases:**
- Liquidity mining programs
- Token staking rewards
- Community incentive programs
- Governance participation rewards

## 🔒 Security Features

All contracts include:
- **OpenZeppelin**: Industry-standard security libraries
- **ReentrancyGuard**: Protection against reentrancy attacks
- **SafeERC20**: Safe token transfer operations
- **Pausable**: Emergency stop mechanism
- **Access Control**: Role-based permissions

## 🚀 Deployment Guide

### Prerequisites
```bash
npm install --save-dev hardhat
npm install @openzeppelin/contracts
```

### Basic Deployment (Hardhat)

```javascript
const { ethers } = require("hardhat");

async function main() {
  // Deploy ERC20 Token
  const Token = await ethers.getContractFactory("StandardERC20Token");
  const token = await Token.deploy(
    "My Token",        // name
    "MTK",            // symbol
    18,               // decimals
    1000000,          // initial supply
    10000000          // max supply
  );
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // Deploy Staking Contract
  const Staking = await ethers.getContractFactory("SimpleStaking");
  const staking = await Staking.deploy(
    token.address,    // staking token
    token.address,    // reward token
    ethers.utils.parseEther("1") // reward rate (1 token per second)
  );
  await staking.deployed();
  console.log("Staking deployed to:", staking.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## 📝 Usage Examples

### ERC20 Token

```solidity
// Mint new tokens (owner only)
token.mint(recipientAddress, ethers.utils.parseEther("1000"));

// Burn tokens
token.burn(ethers.utils.parseEther("100"));

// Pause transfers (emergency)
token.pause();
token.unpause();

// Transfer tokens
token.transfer(recipient, amount);
```

### Staking Contract

```solidity
// Approve staking contract to spend tokens
token.approve(stakingAddress, ethers.utils.parseEther("1000"));

// Stake tokens
staking.stake(ethers.utils.parseEther("100"));

// Check earned rewards
uint256 earned = staking.earned(userAddress);

// Claim rewards
staking.claimReward();

// Withdraw staked tokens
staking.withdraw(ethers.utils.parseEther("50"));

// Exit (withdraw all + claim rewards)
staking.exit();
```

## 🔧 Customization Tips

### Modify Reward Rate
```solidity
// Owner can update reward rate dynamically
staking.setRewardRate(ethers.utils.parseEther("2")); // 2 tokens per second
```

### Add Rewards to Pool
```solidity
// Owner adds more reward tokens
token.approve(stakingAddress, rewardAmount);
staking.notifyRewardAmount(rewardAmount);
```

## ⚠️ Important Notes

1. **Audit Required**: Always audit contracts before mainnet deployment
2. **Test Thoroughly**: Use testnets (Goerli, Sepolia) for testing
3. **Gas Optimization**: Consider gas costs for your specific use case
4. **Upgrade Path**: These contracts are not upgradeable by default
5. **Compliance**: Ensure compliance with local regulations

## 🧪 Testing

```javascript
describe("Token Tests", function() {
  it("Should mint tokens correctly", async function() {
    const [owner, addr1] = await ethers.getSigners();
    // Test logic here
  });
});
```

## 📚 Additional Resources

- **OpenZeppelin Docs**: https://docs.openzeppelin.com/
- **Hardhat Documentation**: https://hardhat.org/
- **Solidity Docs**: https://docs.soliditylang.org/
- **Sentinel DeFi Courses**: https://sentineldefi.online/courses

## 🛡️ Security Checklist

Before deployment, verify:
- [ ] All contracts compiled without warnings
- [ ] Unit tests pass with 100% coverage
- [ ] Gas optimization reviewed
- [ ] Access controls properly configured
- [ ] Events emitted for all state changes
- [ ] Emergency pause mechanisms tested
- [ ] Integration tests completed
- [ ] Third-party audit considered

## 💡 Advanced Features

### Adding Vesting
Consider implementing token vesting for team allocations:
```solidity
// Lock tokens with linear vesting over time
```

### Governance Integration
Extend contracts with on-chain governance:
```solidity
// Add voting power based on staked tokens
```

### Multi-Reward Staking
Modify staking to distribute multiple reward tokens simultaneously.

## 📞 Support

For questions, tutorials, and advanced implementations:
- Website: https://sentineldefi.online
- Email: info@the3rdeyeadvisors.com
- Discord: Join our community
- Twitter: @sentineldefi

## 📄 License

MIT License - Feel free to use and modify for your projects.

---

**Disclaimer**: These templates are provided for educational purposes. Always conduct thorough testing and security audits before using in production. Sentinel DeFi is not responsible for any losses incurred from using these contracts.

**Version**: 1.0.0  
**Last Updated**: 2025  
**Solidity Version**: ^0.8.20