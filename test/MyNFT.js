const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
let MyNFT, deployer, user1, user2

describe('NFT', () => {
  const COST = ether(10)
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const MAX_SUPPLY = 25
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'

  beforeEach(async () => {    
    

    let accounts = await ethers.getSigners()

    deployer = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
  })

  describe('Deployment', () => {
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10) // 2 mins from now

    beforeEach(async () => { 

      MyNFT = await ethers.getContractFactory('MyNFT')
      myNFT = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
      await myNFT.deployed()
    })

    it('has correct name', async () => {
      expect(await myNFT.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await myNFT.symbol()).to.equal(SYMBOL)
    })

    it('returns cost to mint', async () => {
      expect(await myNFT.cost()).to.equal(COST)
    })

    it('returns cost to mint', async () => {
      expect(await myNFT.cost()).to.equal(COST)
    })

    it('returns max supply', async () => {
      expect(await myNFT.maxSupply()).to.equal(MAX_SUPPLY)
    })

    it('returns allowed minting time', async () => {
      expect(await myNFT.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })

    it('returns base URI', async () => {
      expect(await myNFT.baseURI()).to.equal(BASE_URI)
    })

    it('returns owner', async () => {
      expect(await myNFT.owner()).to.equal(deployer.address)
    })
  })

  describe('Minting', () => {
    const ALLOW_MINTING_ON = Date.now() // now

  	beforeEach(async () => {  

      MyNFT = await ethers.getContractFactory('MyNFT')
      myNFT = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
      await myNFT.deployed()  

      await myNFT.connect(deployer).addAddress(user1.address)

    })

    describe('Success', () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {  
        MyNFT = await ethers.getContractFactory('MyNFT')
        myNFT = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await myNFT.deployed()  

        await myNFT.connect(deployer).addAddress(user1.address)

        transaction = await myNFT.connect(user1).mint(1, { value: COST })
        result = await transaction.wait()

      })
      it('returns the address of the minter', async () => {
        expect(await myNFT.ownerOf(1)).to.equal(user1.address)
      })

  		it('returns total number of tokens the minter owns', async () => {
  			expect(await myNFT.balanceOf(user1.address)).to.equal(1)
  		})

      it('returns IPFS URI', async () => {
        // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
        // Uncomment this line to see example
        // console.log(await nft.tokenURI(1))
        expect(await myNFT.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('updates total supply', async () => {
        expect(await myNFT.totalSupply()).to.equal(1)
      })

      it('updates contract ether balance', async () => {
        expect(await ethers.provider.getBalance(myNFT.address)).to.equal(COST)
      })

      it('emits Mint event', async () => {
        expect(transaction).to.emit(myNFT, 'Withdraw')
          .withArgs(COST, deployer.address)      })
	  })

  	describe('Failure', () => {
  		it('rejects non allowList addresses', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const MyNFT = await ethers.getContractFactory('MyNFT')
        mynft = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
  			await expect(myNFT.connect(user1).mint(1, { value: COST })).to.be.reverted
  		})

      it('rejects insufficient payment', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const MyNFT = await ethers.getContractFactory('MyNFT')
        mynft = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await myNFT.connect(deployer).addAddress(user1.address)
        await expect(myNFT.connect(user1).mint(1, { value: ether(1) })).to.be.reverted
      })

      it('rejects minting before allowed time', async () => {
        const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10)
        const MyNFT = await ethers.getContractFactory('MyNFT')
        mynft = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await myNFT.connect(deployer).addAddress(user1.address)
        await expect(myNFT.connect(user1).mint(1, { value: COST })).to.be.reverted
      })

      it('requires at least 1 NFT to be minted', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const MyNFT = await ethers.getContractFactory('MyNFT')
        mynft = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await myNFT.connect(deployer).addAddress(user1.address)
        await expect(myNFT.connect(user1).mint(0, { value: COST })).to.be.reverted
      })

      it('does not allow more NFTs to be minted than max amount', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const MyNFT = await ethers.getContractFactory('MyNFT')
        myNFT = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await myNFT.connect(deployer).addAddress(user1.address)

        await expect(myNFT.connect(user1).mint(100, { value: ether(1000) })).to.be.reverted
      })
  	})	
  })
})