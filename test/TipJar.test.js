import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TipJar Smart Contract", function () {
  let tipJar;
  let owner;
  let tipper1;
  let tipper2;

  beforeEach(async function () {
    [owner, tipper1, tipper2] = await ethers.getSigners();
    const TipJarFactory = await ethers.getContractFactory("TipJar");
    tipJar = await TipJarFactory.deploy();
    await tipJar.waitForDeployment();
  });

  it("Should initialize with correct owner and 0 balance", async function () {
    expect(await tipJar.owner()).to.equal(owner.address);
    expect(await tipJar.totalTipsCount()).to.equal(0);
    expect(await tipJar.totalVolumeWei()).to.equal(0);
  });

  it("Should accept a tip and emit TipReceived event with memo", async function () {
    const tipAmount = ethers.parseEther("0.05");
    const memo = "Thanks for the awesome terminal CLI!";

    await expect(tipJar.connect(tipper1).sendTip(memo, { value: tipAmount }))
      .to.emit(tipJar, "TipReceived")
      .withArgs(tipper1.address, tipAmount, memo, (val) => val > 0, 0);

    expect(await tipJar.totalTipsCount()).to.equal(1);
    expect(await tipJar.totalVolumeWei()).to.equal(tipAmount);

    const tips = await tipJar.getAllTips();
    expect(tips.length).to.equal(1);
    expect(tips[0].tipper).to.equal(tipper1.address);
    expect(tips[0].memo).to.equal(memo);
    expect(tips[0].amount).to.equal(tipAmount);
  });

  it("Should reject tips with 0 ETH value", async function () {
    await expect(
      tipJar.connect(tipper1).sendTip("Zero tip", { value: 0 })
    ).to.be.revertedWith("ERR: ZERO_VALUE_TIP_NOT_ALLOWED");
  });

  it("Should reject memos exceeding 280 characters", async function () {
    const longMemo = "a".repeat(281);
    await expect(
      tipJar.connect(tipper1).sendTip(longMemo, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWith("ERR: MEMO_EXCEEDS_MAX_LENGTH_280");
  });

  it("Should allow the owner to withdraw tips", async function () {
    const tipAmount = ethers.parseEther("0.1");
    await tipJar.connect(tipper1).sendTip("Tips for the host", { value: tipAmount });

    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

    const tx = await tipJar.connect(owner).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
    expect(finalOwnerBalance).to.be.closeTo(
      initialOwnerBalance + tipAmount - gasUsed,
      ethers.parseEther("0.0001")
    );
  });

  it("Should disallow non-owners from withdrawing", async function () {
    await tipJar.connect(tipper1).sendTip("Support", { value: ethers.parseEther("0.05") });
    await expect(
      tipJar.connect(tipper2).withdraw()
    ).to.be.revertedWith("ERR: CALLER_NOT_OWNER");
  });
});
