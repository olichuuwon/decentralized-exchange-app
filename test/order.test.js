// initialising
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Market Test", () => {
  let Dex, dex, Bird, bird, owner, addr1, addr2, addr3, addr4;

  beforeEach(async () => {
    Dex = await ethers.getContractFactory("JeslynDex");
    dex = await Dex.deploy();

    Bird = await ethers.getContractFactory("BirdToken");
    bird = await Bird.deploy();

    //Testing from a different account
    [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
  });
  describe("Deployment", () => {
    it("should set the right owner", async () => {
      expect(await dex.owner()).to.equal(owner.address);
    });

    it("should check that the Bird total supply is equal to the owner's balance", async () => {

      const ownerBalance = await bird.balanceOf(owner.address);
      expect(await bird.totalSupply()).to.equal(ownerBalance);
    });
  });
  describe("Transactions", () => {
    it("Should throw an error when creating a sell market order without adequate token balance", async () => {

      const initialTokenBalance = await dex.balances(addr1.address, ethers.utils.formatBytes32String("BIRD"));
      console.log("Init Token Balance: ", initialTokenBalance.toNumber());

      await expect(
        dex.connect(addr1).createMarketOrder(1, ethers.utils.formatBytes32String("BIRD"), 10)
      ).to.be.reverted;

    });

  it("Market BUY orders can be submitted even if the order book is empty", async () => {

    const orderBookBefore = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 0); // get buy side

    expect(orderBookBefore.length).to.equal(0);
    console.log("Orderbook length before: ", orderBookBefore.length);

    const marketOrderTx = await dex.createMarketOrder(0, ethers.utils.formatBytes32String("BIRD"), 10);
    await marketOrderTx.wait();

    const orderBookAfter = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 0); // get buy side
    console.log("Orderbook length after: ", orderBookAfter.length);

    // Should be empty
    expect(orderBookAfter.length).to.equal(0);
  });
  it("Market orders should not fill more limit orders than the market order amount", async () => {

    //Get the sell side orderbook
    const orderbook = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 1);
    expect(orderbook.length).to.equal(0);
    console.log("Orderbook SELL length start:", orderbook.length);

    await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);

    const depositEthTx = await dex.depositEth({ value: 30000 });
    await depositEthTx.wait();

    

    // Send BIRD tokens to accounts 1, 2, 3 from accounts 0
    const transferTx1 = await bird.transfer(addr1.address, 150);
    await transferTx1.wait();

    const transferTx2 = await bird.transfer(addr2.address, 150);
    await transferTx2.wait();

    const transferTx3 = await bird.transfer(addr3.address, 150);
    await transferTx3.wait();



    // Approve DEX for accounts 1, 2, 3
    const approveTx1 = await bird.connect(addr1).approve(dex.address, 50);
    await approveTx1.wait();
    const approveTx2 = await bird.connect(addr2).approve(dex.address, 50);
    await approveTx2.wait();
    const approveTx3 = await bird.connect(addr3).approve(dex.address, 50);
    await approveTx3.wait();

    //Deposit BIRD into DEX for accounts 1, 2, 3
    const depositTx1 = await dex.connect(addr1).deposit(50, ethers.utils.formatBytes32String("BIRD"));
    await depositTx1.wait();
    const depositTx2 = await dex.connect(addr2).deposit(50, ethers.utils.formatBytes32String("BIRD"));
    await depositTx2.wait();
    const depositTx3 = await dex.connect(addr3).deposit(50, ethers.utils.formatBytes32String("BIRD"));
    await depositTx3.wait();

    // Fill the Limit sell order book
    const limitSellTx1 = await dex.connect(addr1).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 5, 300);
    await limitSellTx1.wait();

    const limitSellTx2 = await dex.connect(addr2).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 5, 400);
    await limitSellTx2.wait();

    const limitSellTx3 = await dex.connect(addr3).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 5, 500);
    await limitSellTx3.wait();

    // Create market order which fills 2/3 orders in the book
    const marketOrderTx = await dex.createMarketOrder(0, ethers.utils.formatBytes32String("BIRD"), 10);
    await marketOrderTx.wait();
    console.log("Market Order BUY: ", marketOrderTx);

    //Get the sell side orderbook
    const orderbookAfter = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 1);

    expect(orderbookAfter.length).to.equal(1);
    console.log("Orderbook length: ", orderbookAfter.length)
    expect(orderbookAfter[0].filled).to.equal(0);
    console.log("Orderbook filled: ", orderbookAfter[0].filled.toNumber());
    // Note: I think "filled" is 0 because it has not been filled. The market order was only for 10 bird. 
    // Two Sell orders where filled but one remains (5 bird) as it should only fill the the amount the market order was for.

  });
  it("Market orders should be filled until the order book is empty", async () => {
    // This is checked by creating a buying order for more Bird coins than there are available, until the order book gets emptied.

    // add Bird Token, deposit Eth 

    // Bird transfers Bird token to 3 accounts,
    // Bird approves amount of Bird for Dex to spend for those 3 accounts on their behalf
    // Dex deposits Bird from those same 3 accounts

    // begin limit sell orders

    // check orderbook sell side orders
    // check owner bird balance before market order
    // create market buy order
    // check owner bird balance after market order

    // assert/expect
    // balance before + amount bought should equal balance after
    await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);

    await dex.depositEth({ value: 30000 });

    // bird token transfers to address 1, 2, 3, again since order book is empty
    await bird.transfer(addr1.address, 150);
    await bird.transfer(addr2.address, 150);
    await bird.transfer(addr3.address, 150);

    // approve dex for address 1, 2, 3
    await bird.connect(addr1).approve(dex.address, 50);
    await bird.connect(addr2).approve(dex.address, 50);
    await bird.connect(addr3).approve(dex.address, 50);

    // deposit bird to address 1, 2, 3
    await dex.connect(addr1).deposit(50, ethers.utils.formatBytes32String("BIRD"));
    await dex.connect(addr2).deposit(50, ethers.utils.formatBytes32String("BIRD"));
    await dex.connect(addr3).deposit(50, ethers.utils.formatBytes32String("BIRD"));


    // create limit sell orders
    const limitSellTx1 = await dex.connect(addr1).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 5, 300);
    await limitSellTx1.wait();

    const limitSellTx2 = await dex.connect(addr2).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 5, 400);
    await limitSellTx2.wait();

    const limitSellTx3 = await dex.connect(addr3).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 5, 500);
    await limitSellTx3.wait();

    //Get sell side orderbook
    const orderbook = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 1);
    expect(orderbook.length).to.equal(3, "Sell side Orderbook should have 3 orders");
    console.log("Orderbook SELL length start:", orderbook.length);

    const balanceBefore = await dex.balances(owner.address, ethers.utils.formatBytes32String("BIRD"));
    console.log("BIRD balance before BUY order: ", balanceBefore.toNumber());

    await dex.createMarketOrder(0, ethers.utils.formatBytes32String("BIRD"), 50);

    const balanceAfter = await dex.balances(owner.address, ethers.utils.formatBytes32String("BIRD"));
    console.log("BIRD balance after BUY order: ", balanceAfter.toNumber());

    expect(balanceBefore + 15).to.equal(balanceAfter);
    console.log("BIRD balance before BUY order - expect: ", balanceAfter.toNumber());
  });
  it("The eth balance of the buyer should decrease with the filled amount", async () => {

    await dex.depositEth({ value: 3000 });

    await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);

    await bird.connect(addr1).approve(dex.address, 150);

    await bird.transfer(addr1.address, 10);

    const depositTx = await dex.connect(addr1).deposit(10, ethers.utils.formatBytes32String("BIRD"));
    await depositTx.wait();

    const limitOrderTx = await dex.connect(addr1).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 1, 300);
    await limitOrderTx.wait();
    console.log("Limit order tx: ", limitOrderTx);

    //Check buyer ETH balance before trade
    const balanceBefore = await dex.balances(owner.address, ethers.utils.formatBytes32String("ETH"))
    console.log("Eth balance before trade: ", balanceBefore.toNumber());

    const marketOrderTx = await dex.createMarketOrder(0, ethers.utils.formatBytes32String("BIRD"), 1);
    await marketOrderTx.wait();
    console.log("Market order tx: ", marketOrderTx);

    //Check buyer ETH balance after trade
    const balanceAfter = await dex.balances(owner.address, ethers.utils.formatBytes32String("ETH"));
    console.log("Eth balance after trade: ", balanceAfter.toNumber());

    expect(balanceBefore - 300).to.equal(balanceAfter);
  });
  
    it("the token balances of the limit order sellers, should decrease with the filled amounts", async () => {
      // add Eth, Token, 
      // Approve, Transfer, for two accounts 1, 2
      const depositEthTx = await dex.depositEth({ value: 3000 });
      await depositEthTx.wait();

      const addTokenTx = await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);
      await addTokenTx.wait();

      const approveTx1 = await bird.connect(addr1).approve(dex.address, 150);
      await approveTx1.wait();

      const approveTx2 = await bird.connect(addr2).approve(dex.address, 150);
      await approveTx2.wait();

      const transferTx1 = await bird.transfer(addr1.address, 10);
      await transferTx1.wait();

      const transferTx2 = await bird.transfer(addr2.address, 10);
      await transferTx2.wait();

      // deposit bird to address 1, 2
      const depositReceipt1 = await dex.connect(addr1).deposit(10, ethers.utils.formatBytes32String("BIRD"));
      await depositReceipt1.wait();

      const depositReceipt2 = await dex.connect(addr2).deposit(10, ethers.utils.formatBytes32String("BIRD"));
      await depositReceipt2.wait();

      //Create limit orders, accounts 1, 2
      const limitOrderTx1 = await dex.connect(addr1).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 1, 100);
      await limitOrderTx1.wait();
      console.log("Limit order Sell: ", limitOrderTx1);

      const limitOrderTx2 = await dex.connect(addr2).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 1, 100);
      await limitOrderTx2.wait();
      console.log("Limit order Sell: ", limitOrderTx2);

      //Check sellers BIRD balance before trade, accounts 1, 2
      const account1BIRDBalanceBefore = await dex.balances(addr1.address, ethers.utils.formatBytes32String("BIRD"));
      console.log("BIRD balance before trade, acc1: ", account1BIRDBalanceBefore.toNumber());

      const account2BIRDBalanceBefore = await dex.balances(addr2.address, ethers.utils.formatBytes32String("BIRD"));
      console.log("BIRD balance before trade, acc2: ", account2BIRDBalanceBefore.toNumber());

      //Create market BUY order
      const marketOrderTx = await dex.createMarketOrder(0, ethers.utils.formatBytes32String("BIRD"), 2);
      await marketOrderTx.wait();
      console.log("Market order Buy: ", marketOrderTx);

      //Check sellers BIRD balance after trade for accounts 1, 2
      const account1BIRDBalanceAfter = await dex.balances(addr1.address, ethers.utils.formatBytes32String("BIRD"));
      console.log("BIRD balance after trade, acc1: ", account1BIRDBalanceAfter.toNumber());

      const account2BIRDBalanceAfter = await dex.balances(addr2.address, ethers.utils.formatBytes32String("BIRD"));
      console.log("BIRD balance after trade, acc2: ", account2BIRDBalanceAfter.toNumber());

      expect(account1BIRDBalanceBefore - 1).to.equal(account1BIRDBalanceAfter);
      expect(account2BIRDBalanceBefore - 1).to.equal(account2BIRDBalanceAfter);

    });
    it("Filled limit orders should be removed from the orderbook", async () => {
      // deposit eth, add token, approve, transfer
      const depositEthTx = await dex.depositEth({ value: 3000 });
      await depositEthTx.wait();

      const addTokenTx = await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);
      await addTokenTx.wait();

      const approveTx1 = await bird.connect(addr3).approve(dex.address, 150);
      await approveTx1.wait();

      const transferTx1 = await bird.transfer(addr3.address, 10);
      await transferTx1.wait();

      // deposit to dex
      const depositReceipt1 = await dex.connect(addr3).deposit(10, ethers.utils.formatBytes32String("BIRD"));
      await depositReceipt1.wait();

      // Create Limit order
      const limitOrderTx1 = await dex.connect(addr3).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 1, 100);
      await limitOrderTx1.wait();
      console.log("Limit order Sell: ", limitOrderTx1);

      // check order book, SELL side, before trade
      const orderbookBefore = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 1)
      console.log("Orderbook length, SELL, Before: ", orderbookBefore.length);

      expect(orderbookBefore.length).to.equal(1);

      // Create Market order
      const marketOrderTx = await dex.createMarketOrder(0, ethers.utils.formatBytes32String("BIRD"), 1);
      await marketOrderTx.wait();

      // check order book, SELL side, after trade
      const orderbookAfter = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 1)
      console.log("Orderbook length, SELL, After: ", orderbookAfter.length);

      expect(orderbookAfter.length).to.equal(0);
    });
    it("Limit orders with the filled property, should be updated after each trade", async () => {
      // deposit eth, add token, approve, transfer
      const depositEthTx = await dex.depositEth({ value: 3000 });
      await depositEthTx.wait();

      const addTokenTx = await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);
      await addTokenTx.wait();

      const approveTx1 = await bird.connect(addr3).approve(dex.address, 150);
      await approveTx1.wait();

      const transferTx1 = await bird.transfer(addr3.address, 10);
      await transferTx1.wait();

      // deposit to dex
      const depositReceipt1 = await dex.connect(addr3).deposit(10, ethers.utils.formatBytes32String("BIRD"));
      await depositReceipt1.wait();

      // Create Limit order
      const limitOrderTx1 = await dex.connect(addr3).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 5, 100);
      await limitOrderTx1.wait();
      console.log("Limit order Sell: ", limitOrderTx1);

      // check order book, SELL side, before trade
      const orderbookBefore = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 1);
      console.log("Orderbook amount, SELL, Before: ", orderbookBefore[0].amount.toNumber());
      console.log("Orderbook filled, SELL, Before: ", orderbookBefore[0].filled.toNumber());

      expect(orderbookBefore[0].amount).to.equal(5, "Expecting 5");
      expect(orderbookBefore[0].filled).to.equal(0, "Expecting 0");

      // Create Market order
      const marketOrderTx = await dex.createMarketOrder(0, ethers.utils.formatBytes32String("BIRD"), 2);
      await marketOrderTx.wait();

      // check order book, SELL side, after trade
      const orderbookAfter = await dex.getOrderBook(ethers.utils.formatBytes32String("BIRD"), 1)
      console.log("Orderbook amount, SELL, After: ", orderbookAfter[0].amount.toNumber());
      console.log("Orderbook filled, SELL, After: ", orderbookAfter[0].filled.toNumber());

      expect(orderbookAfter[0].amount).to.equal(5);
      expect(orderbookAfter[0].filled).to.equal(2);

    });
    
    it("should throw an error when creating a Buy market order with insufficient ETH balance", async () => {
      // using two accounts to create market orders which fail since their respective, Eth balances are insufficient
      await dex.depositEth({ value: 100 });
      await dex.connect(addr4).depositEth({ value: 10 });

      await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);

      await bird.connect(addr1).approve(dex.address, 150);
      await bird.connect(addr2).approve(dex.address, 150);

      await bird.transfer(addr1.address, 10);
      await bird.transfer(addr2.address, 10);

      const depositTx1 = await dex.connect(addr1).deposit(10, ethers.utils.formatBytes32String("BIRD"));
      await depositTx1.wait();

      const depositTx2 = await dex.connect(addr2).deposit(10, ethers.utils.formatBytes32String("BIRD"));
      await depositTx2.wait();

      const limitOrderTx = await dex.connect(addr1).createLimitOrder(1, ethers.utils.formatBytes32String("BIRD"), 1, 300);
      await limitOrderTx.wait();
      console.log("Limit order tx: ", limitOrderTx);

      //Check buyer ETH balance before trade
      const balanceBefore1 = await dex.balances(owner.address, ethers.utils.formatBytes32String("ETH"))
      console.log("Eth balance 1 before trade: ", balanceBefore1.toNumber());

      const balanceBefore2 = await dex.balances(addr4.address, ethers.utils.formatBytes32String("ETH"))
      console.log("Eth balance 2 before trade: ", balanceBefore2.toNumber());

      await expect(
        dex.createMarketOrder(0, ethers.utils.formatBytes32String("BIRD"), 1)
      ).to.be.reverted;

      await expect(
        dex.connect(addr4).createMarketOrder(0, ethers.utils.formatBytes32String("BIRD"), 1)
      ).to.be.reverted;

      //Check buyer ETH balance after trade
      const balanceAfter1 = await dex.balances(owner.address, ethers.utils.formatBytes32String("ETH"));
      console.log("Eth balance 1 after trade: ", balanceAfter1.toNumber());

      const balanceAfter2 = await dex.balances(addr4.address, ethers.utils.formatBytes32String("ETH"));
      console.log("Eth balance 2 after trade: ", balanceAfter2.toNumber());

      expect(balanceBefore1).to.equal(balanceAfter1);
      expect(balanceBefore2).to.equal(balanceAfter2);

    });
      
  });


});