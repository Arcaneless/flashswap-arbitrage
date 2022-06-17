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
      wavax_addr
    );

    await flashswap.addReserve({
      value: ethers.utils.parseEther("0.1"),
    });

    await flashswap.addDex(
      "traderjoe",
      contractAccounts.traderJoeRouter.mainnet,
      contractAccounts.traderJoeFactory.mainnet,
      ethers.utils.arrayify(
        "0x0bbca9af0511ad1a1da383135cf3a8d2ac620e549ef9f6ae3a4c33c2fed0af91"
      )
    );

    await flashswap.addDex(
      "pangolin",
      contractAccounts.pangolinRouter.mainnet,
      contractAccounts.pangolinFactory.mainnet,
      ethers.utils.arrayify(
        "0x40231f6b438bce0797c9ada29b718a87ea0a5cea3fe9a771abdd76bd41a3e545"
      )
    );

    // optimal value 4548223.770824810366868468
    await flashswap.arbitrage(
      ethers.utils.parseEther("0.55329232076763"),
      PTP,
      contractAccounts.traderJoeRouter.mainnet,
      contractAccounts.pangolinRouter.mainnet
    );
  });
});
