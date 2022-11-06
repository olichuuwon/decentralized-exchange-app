const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Dex Test', () => {
  let Dex, dex, Bird, bird, owner, addr1, addr2;

  beforeEach(async () => {
    Dex = await ethers.getContractFactory("Dex");
    dex = await Dex.deploy();

    Bird = await ethers.getContractFactory("BirdToken");
    bird = await Bird.deploy();

    [owner, addr1, addr2, _] = await ethers.getSigners();
  });

  describe("Deployment", () => {
    it("should set the right owner", async () => {
      expect(await dex.owner()).to.equal(owner.address);
    });

    it("should assign the total bird supply of tokens to the owner", async () => {
      const ownerBalance = await bird.balanceOf(owner.address);
      expect(await bird.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", () => {
    it("should throw an error if ETH balance is insufficient when crating a BUY limit order", async () => {
      const initialEthBalance = await dex.balances(owner.address, ethers.utils.formatBytes32String("ETH"));
      expect(
        dex.createLimitOrder(0, ethers.utils.formatBytes32String("BIRD"), 10, 1)
      ).to.be.reverted
      expect(await dex.balances(owner.address, ethers.utils.formatBytes32String("ETH"))).to.equal(initialEthBalance)
    });

    it("should allow transactions for BUY limit orders when ETH balance is sufficient", async () => {
      const initialEthBalance = await dex.balances(owner.address, ethers.utils.formatBytes32String("ETH"));
      expect(initialEthBalance).to.equal(0);

      const depositEthTx = await dex.depositEth({ value: 10 });
      await depositEthTx.wait();

      const afterDopositEthBalance = await dex.balances(owner.address, ethers.utils.formatBytes32String("ETH"));
      expect(afterDopositEthBalance).to.equal(10);

      const buyLimitOrderTx = await dex.createLimitOrder(0, ethers.utils.formatBytes32String("BIRD"), 10, 1);
      await buyLimitOrderTx.wait();
    });

    it("should throw an error if token balance is insufficient when creating a SELL limit order", async () => {
      const dexTokenBalance = await dex.balances(owner.address, ethers.utils.formatBytes32String("BIRD"));
      expect(dexTokenBalance).to.equal(0);
      await expect(
        dex.createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 10, 1)
      ).to.be.reverted;

      // it throws but now it must pass

      // approve args: spender address, amount
      const approveTx = await bird.approve(dex.address, 500);
      await approveTx.wait();
      // addToken args: ticker, token address
      const addTokenTx = await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);
      await addTokenTx.wait();
      // deposit args: amount, ticker
      const depositTx = await dex.deposit(10, ethers.utils.formatBytes32String("BIRD"));
      await depositTx.wait();

      const limitOrderTx = await dex.createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 10, 1);
      await limitOrderTx.wait();

      // it does throw an error at the start of the test so it passes
      // to add if time permits
    });

    it("The Limit BUY order book should be ordered on price from highest to lowest starting at index 0", async () => {
      await bird.approve(dex.address, 500); // 500 Bird tokens approved
      await dex.depositEth({ value: 3000 }); // in Wei
      await dex.createLimitOrder(0, ethers.utils.formatBytes32String("BIRD"), 1, 300);
      await dex.createLimitOrder(0, ethers.utils.formatBytes32String("BIRD"), 1, 100);
      await dex.createLimitOrder(0, ethers.utils.formatBytes32String("BIRD"), 1, 200);

      // get BUY side
      const orderBook = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 0); 
      expect(orderBook.length > 0);
      console.log("OrderBook BUY: ", orderBook);

      for (let i = 0; i < orderBook.length - 1; i++) {
        expect(
          orderBook[i].price >= orderBook[i + 1].price, "Order is incorrect in BUY side")
      }
    });

    it("The SELL order book should be ordered on price from lowest to highest starting at index 0", async () => {
      await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);
      await bird.approve(dex.address, 500);

      // args: address and ticker
      const balanceBefore = await dex.balances(owner.address, ethers.utils.formatBytes32String("BIRD"));
      console.log("Dex Owner Balance Before: ", balanceBefore.toNumber());
      const depositTx = await dex.deposit(100, ethers.utils.formatBytes32String("BIRD"));
      await depositTx.wait();
      const balanceAfter = await dex.balances(owner.address, ethers.utils.formatBytes32String("BIRD"));
      console.log("Dex Owner Balance After: ", balanceAfter.toNumber());

      await dex.createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 1, 300);
      await dex.createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 1, 100);
      await dex.createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 1, 200);

      // get SELL side
      const orderBook = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 1);
      expect(orderBook.length > 0);
      console.log("OrderBook SELL: ", orderBook);

      // for loop
      for (let i = 0; i < orderBook.length -1; i++) {
        expect(
          orderBook[i].price <= orderBook[i+1].price, "Order is incorrect in SELL side"
        )
      }
    });

  });
});