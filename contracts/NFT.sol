// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

interface IMyERC721 is IERC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function maxSupply() external view returns (uint256);
    function approve(address to, uint256 tokenId) external;

}

interface IMyERC721Receiver is IERC721Receiver {
   function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}
    
contract NFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public cost;
    uint256 public maxSupply;
    uint256 public maxMint;
    uint256 public allowMintingOn;
    string public baseURI;
    string public baseExtension = '.json';
    bool public pauseMinting = false;
  
    mapping(bytes32 => bool) private allowList;
    // Mapping from token ID to the address that minted it
    mapping(uint256 => uint256) public stakedTimestamps;


    event Mint(uint256 amount, address minter);
    event Withdraw(uint256 amount, address owner);



    constructor(
        string memory _name, 
        string memory _symbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _maxMint,
        uint256 _allowMintingOn,
        string memory _baseURI) ERC721(_name, _symbol) {
        cost = _cost;
        maxSupply = _maxSupply;
        maxMint = _maxMint;
        allowMintingOn = _allowMintingOn;
        baseURI = _baseURI;
    }



    function mint(uint256 _mintAmount) external payable {
        require(block.timestamp >= allowMintingOn, "Minting not open yet");
        require(!pauseMinting, "Minting has been paused");
        require(isOnList(msg.sender), "this address is not on the allow list");
        require(_mintAmount > 0, "must mint at least 1 NFT");
        require(msg.value >= cost * _mintAmount, "insufficent payment");
        require(_mintAmount <= maxMint, "Cannot mint more than 5 NFTs");

        
        uint256 supply = totalSupply();
        require(supply + _mintAmount <= maxSupply, "exceeded max supply");

        for(uint256 i = 1; i <= _mintAmount; i++){
            _safeMint(msg.sender, supply + i);
        }

        emit Mint(_mintAmount, msg.sender);
    }

    function addAddress(address _address) public onlyOwner{
        bytes32 hash = keccak256(abi.encodePacked(_address));
        allowList[hash] = true;
    }

    function isOnList(address _address) public view returns (bool){
        bytes32 hash = keccak256(abi.encodePacked(_address));
        return allowList[hash];
    }

    // Return metadata IPFS url
    // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns(string memory)
    {
        require(_exists(_tokenId), 'token does not exist');
        return(string(abi.encodePacked(baseURI, _tokenId.toString(), baseExtension)));
    }

    function walletOfOwner(address _owner) public view returns(uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for(uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    // Owner functions

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;

        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success);

        emit Withdraw(balance, msg.sender);
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function pauseMint() public onlyOwner {
        pauseMinting = true;
    }

    function unPauseMint() public onlyOwner {
        pauseMinting = false;
    }

}
