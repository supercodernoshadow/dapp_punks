const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
let MyNFT, accounts, deployer, user1, user2

describe('MyNFT', () => {

  beforeEach(async () => {
    MyNFT = await ethers.getContractFactory('MyNFT')
    myNFT = await MyNFT.deploy('MyNFT', 'MNFT')
    await myNFT.deployed()

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    user1 = accounts[1]
    user2 = accounts[2]
  })

  describe('Deployment', () => {
    it('has correct name', async () => {
      const name = await myNFT.name()
      expect(name).to.equal('MyNFT')
    })

    it('has correct symbol', async () => {
      const symbol = await myNFT.symbol()
      expect(symbol).to.equal('MNFT')
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