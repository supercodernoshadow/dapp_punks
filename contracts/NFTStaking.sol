// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./RewardsToken.sol";
import "./NFT.sol";
import "hardhat/console.sol";

contract NFTStaking is Ownable {
	using SafeMath for uint256;

    IERC721 private nft;

    event NFTStaked(address indexed user, uint256 tokenId);
    event NFTUnStaked(address indexed user, uint256 tokenId);

    RewardsToken public rewardToken;
    mapping(uint256 => bool) public stakedTokens;
    mapping(uint256 => address) private tokenOrigins;

    mapping(uint256 => uint256) public stakedTimestamps;
    uint256 public rewardRate = 1e18; // 1 reward token per second per NFT


    constructor(address _nftAddress, address _rewardTokenAddress) {

        rewardToken = RewardsToken(_rewardTokenAddress);
        nft = IERC721(_nftAddress);
    }

	function stakeNFT(uint256 tokenId) external {
	    require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
	    require(!stakedTokens[tokenId], "Token already staked");

	    // Mark the token as staked
	    stakedTokens[tokenId] = true;
	    tokenOrigins[tokenId] = msg.sender;
	    stakedTimestamps[tokenId] = block.timestamp;

	    //nft.approve(address(this), tokenId);
	    // Transfer the NFT to the contract
	    nft.safeTransferFrom(msg.sender, address(this), tokenId);


	    emit NFTStaked(msg.sender, tokenId);
    }

    function unstakeNFT(uint256 tokenId) external {
	    require(stakedTokens[tokenId], "Token is not staked");
	    require(tokenOrigins[tokenId]  == msg.sender, "You did not desposit this NFT");

	    stakedTokens[tokenId] = false;
	    // Directly transfer the NFT back to the owner without needing an approval
	    nft.transferFrom(address(this), msg.sender, tokenId);

	    emit NFTUnStaked(msg.sender, tokenId);

	}

    function isStaked(uint256 tokenId) external view returns (bool) {
        return stakedTokens[tokenId];
    }

    // Rewards functions
    function setRewardRate(uint256 _newRate) external onlyOwner {
        rewardRate = _newRate;
    }

    function calcReward(uint256 tokenId) external view returns (uint256) {
   		uint256 stakingDuration = block.timestamp.sub(stakedTimestamps[tokenId]);
   		return stakingDuration.mul(rewardRate);
    }

    function claimRewards(uint256 tokenId) external payable {
    	require(tokenOrigins[tokenId] == msg.sender);
    	uint256 rewardAmount = this.calcReward(tokenId);
        rewardToken.transfer(msg.sender, rewardAmount);
    }

    // Receiving NFTs
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

}