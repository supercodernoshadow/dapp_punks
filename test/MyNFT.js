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

        await myNFT.connect(user1).mint(1, { value: COST })

      })

  		it('mints NFT', async () => {
  			expect(await myNFT.balanceOf(user1.address)).to.equal(1)
  		})

      it('updates total supply', async () => {
        expect(await myNFT.totalSupply()).to.equal(1)
      })

      it('updates contract ether balance', async () => {
        expect(await ethers.provider.getBalance(myNFT.address)).to.equal(COST)
      })
	  })

  	describe('Failure', () => {
  		it('rejects non allowList addresses', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const MyNFT = await ethers.getContractFactory('MyNFT')
        mynft = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
  			expect(myNFT.connect(user1).mint(1, { value: COST })).to.be.reverted
  		})

      it('rejects insufficient payment', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const MyNFT = await ethers.getContractFactory('MyNFT')
        mynft = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await myNFT.connect(deployer).addAddress(user1.address)
        expect(myNFT.connect(user1).mint(1, { value: (COST - ether(1)) })).to.be.reverted
      })

      it('rejects minting before allowed time', async () => {
        const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10)
        const MyNFT = await ethers.getContractFactory('MyNFT')
        mynft = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, ALLOW_MINTING_ON, BASE_URI)
        await myNFT.connect(deployer).addAddress(user1.address)
        expect(myNFT.connect(user1).mint(1, { value: (COST - ether(1)) })).to.be.reverted
      })
  	})	
  })
})