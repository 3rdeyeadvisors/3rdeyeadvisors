// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StandardERC20Token
 * @dev Implementation of a standard ERC20 token with additional security features
 * @custom:security-contact security@sentineldefi.online
 */
contract StandardERC20Token is ERC20, ERC20Burnable, Pausable, Ownable {
    uint8 private _decimals;
    uint256 private _maxSupply;

    event MaxSupplyUpdated(uint256 oldMaxSupply, uint256 newMaxSupply);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    /**
     * @dev Constructor that initializes the token
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param decimals_ The number of decimals for the token
     * @param initialSupply The initial supply to mint to the deployer
     * @param maxSupply_ The maximum supply that can ever exist
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        uint256 maxSupply_
    ) ERC20(name_, symbol_) {
        require(maxSupply_ >= initialSupply, "Max supply must be >= initial supply");
        
        _decimals = decimals_;
        _maxSupply = maxSupply_ * (10 ** decimals_);
        
        if (initialSupply > 0) {
            _mint(msg.sender, initialSupply * (10 ** decimals_));
        }
    }

    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Returns the maximum supply of tokens
     */
    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    /**
     * @dev Mints new tokens to a specified address
     * @param to The address to receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
        require(totalSupply() + amount <= _maxSupply, "Would exceed max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /**
     * @dev Burns tokens from the caller's account
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public virtual override whenNotPaused {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Pauses all token transfers
     * Can only be called by the owner
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers
     * Can only be called by the owner
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Updates the maximum supply
     * Can only increase the max supply, not decrease it
     * @param newMaxSupply The new maximum supply
     */
    function updateMaxSupply(uint256 newMaxSupply) public onlyOwner {
        require(newMaxSupply >= totalSupply(), "New max supply must be >= current supply");
        require(newMaxSupply >= _maxSupply, "Can only increase max supply");
        
        uint256 oldMaxSupply = _maxSupply;
        _maxSupply = newMaxSupply;
        
        emit MaxSupplyUpdated(oldMaxSupply, newMaxSupply);
    }
}