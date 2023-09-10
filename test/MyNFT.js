const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
let MyNFT, accounts, deployer, user1, user2

describe('NFT', () => {
  const COST = ether(10)
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const MAX_SUPPLY = 25

  beforeEach(async () => {
    MyNFT = await ethers.getContractFactory('MyNFT')
    myNFT = await MyNFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY)
    await myNFT.deployed()

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
  })

  describe('Deployment', () => {
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
    
  })

  describe('Minting', () => {
  	beforeEach(async () => {
  	    await myNFT.connect(deployer).addAddress(user1.address)

    })

    describe('Success', () => {

		it('mints NFT', async () => {
			await myNFT.connect(user1).mint(user1.address, 1)
			const balance = await myNFT.balanceOf(user1.address)
			expect(balance).to.equal(1)
		})
	})

	describe('Failure', () => {
		it('rejects non allowList addresses', async () => {
			expect(myNFT.connect(user2).mint(user1.address, 1)).to.be.reverted
		})
	})	
  })
})