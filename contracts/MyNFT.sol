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
    uint256 public allowMintingOn;
    string public baseURI;
  
    mapping(bytes32 => bool) private allowList;

    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _allowMintingOn,
        string memory _baseURI) ERC721(_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
        allowMintingOn = _allowMintingOn;
        baseURI = _baseURI;
    }



    function mint(uint256 _mintAmount) external payable {
        require(block.timestamp >= allowMintingOn, "Minting not open yet");
        require(isOnList(msg.sender), "this address is not on the allow list");
        require(msg.value >= cost * _mintAmount, "insufficent payment");
        
        uint256 supply = totalSupply();

        for(uint256 i = 1; i <= _mintAmount; i++){
            _safeMint(msg.sender, supply + i);

        }
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
