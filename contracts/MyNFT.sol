// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface IMyERC721 is IERC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function maxSupply() external view returns (uint256);

}
    
contract MyNFT is ERC721Enumerable, Ownable {
    uint256 public cost;
    uint256 public maxSupply;
  
    mapping(bytes32 => bool) private allowList;

    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply) ERC721(_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
    }



    function mint(address to, uint256 tokenId) external {
        require(isOnList(msg.sender), "this address is not allowed to buy tokens");

        _mint(to, tokenId);
    }

    function addAddress(address _address) public onlyOwner{
        bytes32 hash = keccak256(abi.encodePacked(_address));
        allowList[hash] = true;
    }

    function isOnList(address _address) public view returns (bool){
        bytes32 hash = keccak256(abi.encodePacked(_address));
        return allowList[hash];
    }


}
