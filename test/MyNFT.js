const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
let MyNFT, accounts, deployer, receiver, exchange

describe('MyNFT', () => {

  beforeEach(async () => {
    MyNFT = await ethers.getContractFactory('MyNFT')
    MyNFT = await MyNFT.deploy('MyNFT', 'MNFT')
    await MyNFT.deployed()

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    receiver = accounts[1]
    exchange = accounts[2]
  })

  describe('Deployment', () => {
    it('has correct name', async () => {
      const name = await MyNFT.name();
      expect(name).to.equal('MyNFT');
    })

    it('has correct symbol', async () => {
      const symbol = await MyNFT.symbol();
      expect(symbol).to.equal('MNFT');
    })
})

})