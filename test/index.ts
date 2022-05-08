import { expect } from "chai";
import { ethers } from "hardhat";
import { contractAccounts } from "../scripts/addresses";
import { PTP, JOE } from "../scripts/tokens";

const wavax_addr = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
const aave_add_provider_addr = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";
describe("FlashSwap", function () {
  it("perform an arbitrage with amount and token address", async function () {
    const [owner] = await ethers.getSigners();
    console.log(
      "owner is",
      await owner.getAddress(),
      "with balance: ",
      await owner.getBalance()
    );
    const FlashSwap = await ethers.getContractFactory("FlashSwap");
    const flashswap = await FlashSwap.deploy(
      aave_add_provider_addr,
      contractAccounts.traderJoeRouter.mainnet,
      contractAccounts.traderJoeFactory.mainnet,
      contractAccounts.pangolinRouter.mainnet,
      contractAccounts.pangolinFactory.mainnet,
      wavax_addr
    );

    await flashswap.addReserve({
      value: ethers.utils.parseEther("0.1"),
    });

    await flashswap.arbitrage(ethers.utils.parseEther("1"), PTP);
  });
});
