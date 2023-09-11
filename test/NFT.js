const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens
let nft, deployer, minter, user2

describe('NFT', () => {
  const COST = ether(10)
  const NAME = 'Dapp Punks'
  const SYMBOL = 'DP'
  const MAX_SUPPLY = 25
  const MAX_MINT = 5
  const BASE_URI = 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/'

  beforeEach(async () => {    
    

    let accounts = await ethers.getSigners()

    deployer = accounts[0]
    minter = accounts[1]
    minter2 = accounts[2]
    minter3 = accounts[3]
    minter4 = accounts[4]
    minter5 = accounts[5]
    minter6 = accounts[6]

  })

  describe('Deployment', () => {
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10) // 2 mins from now

    beforeEach(async () => { 

      NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
      await nft.deployed()
    })

    it('has correct name', async () => {
      expect(await nft.name()).to.equal(NAME)
    })

    it('has correct symbol', async () => {
      expect(await nft.symbol()).to.equal(SYMBOL)
    })

    it('returns cost to mint', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    it('returns cost to mint', async () => {
      expect(await nft.cost()).to.equal(COST)
    })

    it('returns max supply', async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY)
    })

    it('returns allowed minting time', async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON)
    })

    it('returns base URI', async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI)
    })

    it('returns owner', async () => {
      expect(await nft.owner()).to.equal(deployer.address)
    })
  })

  describe('Minting', () => {
    const ALLOW_MINTING_ON = Date.now() // now

  	beforeEach(async () => {  

      NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
      await nft.deployed()  

      await nft.connect(deployer).addAddress(minter.address)

    })

    describe('Success', () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {  
        NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        await nft.deployed()  

        await nft.connect(deployer).addAddress(minter.address)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

      })
      it('returns the address of the minter', async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })

  		it('returns total number of tokens the minter owns', async () => {
  			expect(await nft.balanceOf(minter.address)).to.equal(1)
  		})

      it('returns IPFS URI', async () => {
        // EG: 'ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/1.json'
        // Uncomment this line to see example
        // console.log(await nft.tokenURI(1))
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`)
      })

      it('updates total supply', async () => {
        expect(await nft.totalSupply()).to.equal(1)
      })

      it('updates contract ether balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST)
      })

      it('emits Mint event', async () => {
        expect(transaction).to.emit(nft, 'Withdraw')
          .withArgs(COST, deployer.address)      })
	  })

  	describe('Failure', () => {
  		it('rejects non allowList addresses', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
  			await expect(nft.connect(minter).mint(1, { value: COST })).to.be.reverted
  		})

      it('rejects insufficient payment', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).addAddress(minter.address)
        await expect(nft.connect(minter).mint(1, { value: ether(1) })).to.be.reverted
      })

      it('rejects minting before allowed time', async () => {
        const ALLOW_MINTING_ON = new Date('May 26, 2030 18:00:00').getTime().toString().slice(0, 10)
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).addAddress(minter.address)
        await expect(nft.connect(minter).mint(1, { value: COST })).to.be.reverted
      })

      it('requires at least 1 NFT to be minted', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).addAddress(minter.address)
        await expect(nft.connect(minter).mint(0, { value: COST })).to.be.reverted
      })

      it('does not allow more NFTs to be minted than max amount', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).addAddress(minter.address)
        await nft.connect(deployer).addAddress(minter2.address)
        await nft.connect(deployer).addAddress(minter3.address)
        await nft.connect(deployer).addAddress(minter4.address)
        await nft.connect(deployer).addAddress(minter5.address)
        await nft.connect(deployer).addAddress(minter6.address)

        await (nft.connect(minter).mint(5, { value: ether(50) }))
        await (nft.connect(minter2).mint(5, { value: ether(50) }))
        await (nft.connect(minter3).mint(5, { value: ether(50) }))
        await (nft.connect(minter4).mint(5, { value: ether(50) }))
        await (nft.connect(minter5).mint(5, { value: ether(50) }))

        await expect(nft.connect(minter5).mint(5, { value: ether(50) })).to.be.reverted
      })

      it('does not return URIs for invalid tokens', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        nft.connect(minter).mint(1, { value: COST })

        await expect(nft.tokenURI('99')).to.be.reverted
      })

      it('does not allow minter more than 5 NFTs', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        await expect(nft.connect(minter).mint(6, { value: COST })).to.be.reverted

      })
  	})	
  })


  describe('Displaying NFTs', () => {
    let transaction, result

    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

    beforeEach(async () => {
      const NFT = await ethers.getContractFactory('NFT')
      nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
      await nft.connect(deployer).addAddress(minter.address)

      // Mint 3 nfts
      transaction = await nft.connect(minter).mint(3, { value: ether(30) })
      result = await transaction.wait()
    })

    it('returns all the NFTs for a given owner', async () => {
      let tokenIds = await nft.walletOfOwner(minter.address)
      // Uncomment this line to see the return value
      // console.log("owner wallet", tokenIds)
      expect(tokenIds.length).to.equal(3)
      expect(tokenIds[0].toString()).to.equal('1')
      expect(tokenIds[1].toString()).to.equal('2')
      expect(tokenIds[2].toString()).to.equal('3')
    })


  })

  describe('Withdrawing', () => {

    describe('Success', async () => {

      let transaction, result, balanceBefore

      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).addAddress(minter.address)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        balanceBefore = await ethers.provider.getBalance(deployer.address)

        transaction = await nft.connect(deployer).withdraw()
        result = await transaction.wait()
      })

      it('deducts contract balance', async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0)
      })

      it('sends funds to the owner', async () => {
        expect(await ethers.provider.getBalance(deployer.address)).to.be.greaterThan(balanceBefore)
      })

      it('emits a withdraw event', async () => {
        expect(transaction).to.emit(nft, 'Withdraw')
          .withArgs(COST, deployer.address)
      })
    })

    describe('Failure', async () => {

      it('prevents non-owner from withdrawing', async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        nft.connect(minter).mint(1, { value: COST })

        await expect(nft.connect(minter).withdraw()).to.be.reverted
      })
    })
  })

  describe('Staking', () => {
    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).addAddress(minter.address)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

        await nft.connect(minter).stakeNFT(1)

      })

      it('updates staking mapping', async () => {
        expect(await nft.isStaked(1)).to.equal(true)
      })

      it('transfers NFT to contract', async () => {
        expect(await nft.ownerOf(1)).to.equal(nft.address)
      })

      it('allows withdraws', async () => {
        await nft.connect(minter).unstakeNFT(1)
        expect(await nft.ownerOf(1)).to.equal(minter.address)
      })
  })

  describe('Misc', () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10) // Now

      beforeEach(async () => {
        const NFT = await ethers.getContractFactory('NFT')
        nft = await NFT.deploy(NAME, SYMBOL, COST, MAX_SUPPLY, MAX_MINT, ALLOW_MINTING_ON, BASE_URI)
        await nft.connect(deployer).addAddress(minter.address)

        transaction = await nft.connect(minter).mint(1, { value: COST })
        result = await transaction.wait()

      })
    it('allows owner to update cost', async () => {
        const NEWCOST = ether(20)
        await nft.connect(deployer).setCost(NEWCOST)
        expect(await nft.cost()).to.equal(NEWCOST)
    })

    it('allows owner to pause mint', async () => {
        await nft.connect(deployer).pauseMint()

        await expect(nft.connect(minter).mint(1, { value: COST })).to.be.reverted
    })
  })
})