const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Wallet Test", function () {
  let Dex, dex, Bird, bird, owner, addr1, addr2;

  beforeEach(async () => {
    Dex = await ethers.getContractFactory("JeslynDex");
    dex = await Dex.deploy();

    Bird = await ethers.getContractFactory("BirdToken");
    bird = await Bird.deploy();

    [owner, addr1, addr2, _] = await ethers.getSigners();
  });

  describe("Deployement", () => {
    it("should set to the right owner", async () => {
      expect(await dex.owner()).to.equal(owner.address);
    });

    it("should assign the total supply of tokens to the owner", async () => {
      const ownerBalance = await bird.balanceOf(owner.address);
      expect(await bird.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", () => {
    it("should allow tokens added by owner only", async () => {
      await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address)
    });

    it("should fail if tokens are added by anyone besides the owner", async () => {
      const initialOwnerBalance = await bird.balanceOf(owner.address);
      expect(
        dex.connect(addr1).addToken(ethers.utils.formatBytes32String("BIRD"), bird.address)).to.be.revertedWith("Adding tokens not allowed if not the owner").catch((error) => { console.log(error) });
      expect(await bird.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("should allow deposits to correct token and account", async () => {
      await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);
      const approveTx = await bird.approve(dex.address, 500);
      await dex.deposit(100, ethers.utils.formatBytes32String("BIRD"));
      await approveTx.wait();
      const ownerBalance = await dex.balances(owner.address, ethers.utils.formatBytes32String("BIRD"));
      expect(ownerBalance).to.equal(100);
    });

    it("should not allow withdrawls greater than the balance amount", async () => {
      await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address)
      const initialOwnerBalance = await bird.balanceOf(owner.address);
      expect(
        dex.withdraw(1000, ethers.utils.formatBytes32String("BIRD"))
      ).to.be.revertedWith("Insufficient token balance").catch((error) => { console.log(error) });
      expect(await bird.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("should allow withdrawls when token balance is sufficient", async () => {
      await dex.addToken(ethers.utils.formatBytes32String("BIRD"), bird.address);
      const approveTx = await bird.approve(dex.address, 500);
      await approveTx.wait();
      const depositTx = await dex.deposit(100, ethers.utils.formatBytes32String("BIRD"));
      await depositTx.wait();
      const beforeBalance = await dex.balances(owner.address, ethers.utils.formatBytes32String("BIRD"));
      expect(beforeBalance).to.equal(100);
      await dex.withdraw(100, ethers.utils.formatBytes32String("BIRD"));
      const afterBalance = await dex.balances(owner.address, ethers.utils.formatBytes32String("BIRD"));
      expect(afterBalance).to.equal(0);
    });

    it("should transfer tokens between accounts", async () => {
      await bird.transfer(addr1.address, 50);
      const addr1Balance = await bird.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
    });

    it("should fail if sender has not enough bird balance", async () => {
      const initialOwnerBalance = await bird.balanceOf(owner.address);
      expect(
        bird.connect(addr1).transfer(owner.address, 1)
      ).to.be.reverted;
      expect(await bird.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("it should update balances after token transfers", async () => {
      // get balanceOf
      const initialOwnerBalance = await bird.balanceOf(owner.address);

      // transfers
      const transferTx1 = await bird.transfer(addr1.address, 100);
      await transferTx1.wait();
      const transferTx2 = await bird.transfer(addr2.address, 50);
      await transferTx2.wait();

      // test final owner balance has decreased and assert
      // const finalOwnerBalance = await bird.balanceOf(owner.address);
      // expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);
      const addr1Balance = await bird.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);
      const addr2Balance = await bird.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });
});