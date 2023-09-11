// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./NFT.sol";
import "hardhat/console.sol";

contract NFTStaking is Ownable {
	IERC721 public nft;

    mapping(uint256 => bool) public stakedTokens;

    event NFTStaked(address indexed user, uint256 tokenId);


    constructor(address _nftAddress) {
        nft = IERC721(_nftAddress);
    }

	function stakeNFT(uint256 tokenId) external {
    require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
    require(!stakedTokens[tokenId], "Token already staked");

    //nft.approve(address(this), tokenId);
    // Transfer the NFT to the contract
    nft.safeTransferFrom(msg.sender, address(this), tokenId);

    // Mark the token as staked
    stakedTokens[tokenId] = true;

    emit NFTStaked(msg.sender, tokenId);
    }

    function unstakeNFT(uint256 tokenId) external {
	    require(stakedTokens[tokenId], "Token is not staked");
	    require(nft.ownerOf(tokenId) == address(this), "Contract is not the owner of this NFT");

	    // Directly transfer the NFT back to the owner without needing an approval
	    nft.transferFrom(address(this), msg.sender, tokenId);

	    stakedTokens[tokenId] = false;
	}


    function isStaked(uint256 tokenId) external view returns (bool) {
        return stakedTokens[tokenId];
    }

    // Receiving NFTs
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

}