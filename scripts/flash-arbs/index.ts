// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import IPangolinFactoryArtifact from "@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/PangolinFactory.sol/PangolinFactory.json";
import IPangolinPairArtifact from "@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/PangolinPair.sol/PangolinPair.json";
import IPangolinRouterArtifact from "@pangolindex/exchange-contracts/artifacts/contracts/pangolin-periphery/PangolinRouter.sol/PangolinRouter.json";
import { IJoeFactory, IJoePair, IJoeRouter02 } from "@traderjoe-xyz/core";
import IJoeFactoryArtifact from "@traderjoe-xyz/core/artifacts/contracts/traderjoe/JoeFactory.sol/JoeFactory.json";
import IJoePairArtifact from "@traderjoe-xyz/core/artifacts/contracts/traderjoe/JoePair.sol/JoePair.json";
import IJoeRouter02Artifact from "@traderjoe-xyz/core/artifacts/contracts/traderjoe/JoeRouter02.sol/JoeRouter02.json";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { contractAccounts } from "../addresses";
import { calculateGasCost } from "../gas-calculate";
import { PTP } from "../tokens";

const table: any[] = [];

const ONE = ethers.BigNumber.from(1);
const TWO = ethers.BigNumber.from(2);

function sqrt(value: BigNumber) {
  const x = ethers.BigNumber.from(value);
  let z = x.add(ONE).div(TWO);
  let y = x;
  while (z.sub(y).isNegative()) {
    y = z;
    z = x.div(z).add(z).div(TWO);
  }
  return y;
}

const findOptimalAVAX = (
  r0: BigNumber,
  r1: BigNumber,
  r2: BigNumber,
  r3: BigNumber,
  k0: BigNumber,
  k1: BigNumber
) => {
  const a = r1.add(r2);
  const b = r3
    .mul(r2)
    .add(r3.mul(r2))
    .add(r2.mul(r0))
    .add(r1.mul(r0))
    .add(k1)
    .mul(-1);
  const c = r3
    .mul(r2)
    .mul(r0)
    .add(r3.mul(r1).mul(r0))
    .sub(r3.mul(k0))
    .sub(k1.mul(r0));

  const x = b
    .mul(-1)
    .add(sqrt(b.pow(2).sub(a.mul(c).mul(4))))
    .div(a.mul(2));

  return x;
};

async function main() {
  const provider = ethers.provider;
  const balance = await provider.getBalance(
    "0x7c5eb0f25876209d9990acec3ea0bafa0c9f9135"
  );

  // Pangoline Contract
  const pangolinFactory = new ethers.Contract(
    contractAccounts.pangolinFactory.mainnet,
    IPangolinFactoryArtifact.abi,
    provider
  );
  const pangolinRouter = new ethers.Contract(
    contractAccounts.pangolinRouter.mainnet,
    IPangolinRouterArtifact.abi,
    provider
  );

  // Joe Contract
  const joeFactory = new ethers.Contract(
    contractAccounts.traderJoeFactory.mainnet,
    IJoeFactoryArtifact.abi,
    provider
  ) as IJoeFactory;
  const joeRouter = new ethers.Contract(
    contractAccounts.traderJoeRouter.mainnet,
    IJoeRouter02Artifact.abi,
    provider
  ) as IJoeRouter02;

  const WAVAX = await joeRouter.WAVAX();
  console.log("WAVAX", WAVAX);

  provider.on("block", async (blockNumber) => {
    const joePairAddress = await joeFactory.getPair(WAVAX, PTP);
    const targetJoePair = new ethers.Contract(
      joePairAddress,
      IJoePairArtifact.abi,
      provider
    ) as IJoePair;
    const pngPairAddress = await pangolinFactory.getPair(WAVAX, PTP);
    const targetPngPair = new ethers.Contract(
      pngPairAddress,
      IPangolinPairArtifact.abi,
      provider
    );

    const [reserve0, reserve1] = await targetJoePair.getReserves();
    const kLastJoe = await targetJoePair.kLast();
    const [reserve2, reserve3]: BigNumber[] = await targetPngPair.getReserves();
    const kLastPng: BigNumber = await targetPngPair.kLast();

    const joePtpPrice = await joeRouter.getAmountsOut(
      ethers.utils.parseEther("1"),
      [WAVAX, PTP]
    );
    const pngPtpPrice: BigNumber[] = await pangolinRouter.getAmountsOut(
      ethers.utils.parseEther("1"),
      [WAVAX, PTP]
    );

    let direction = "none";
    let optimalValue = "";
    if (joePtpPrice[1].gt(pngPtpPrice[1])) {
      // route: WAVAX -> JOE PTP -> PNG PTP -> WAVAX
      // x WAVAX -> r1 - k0 / (r0 + x) PTP -> r3 - k1 / (r2 + (r1 - k / (r0 + x)))
      // (r1 - k0 / (r0 + x)) / x = (r1 - k0 / (r0 + x)) / (r3 - k1 / (r2 + (r1 - k / (r0 + x))))
      // x = (r3 - k1 / (r2 + (r1 - k / (r0 + x))))
      const x = findOptimalAVAX(
        reserve0,
        reserve1,
        reserve2,
        reserve3,
        kLastJoe,
        kLastPng
      );

      direction = "joe -> png";
      optimalValue = ethers.utils.formatEther(x);
    } else if (pngPtpPrice[1].gt(joePtpPrice[1])) {
      // route: WAVAX -> PNG PTP -> JOE PTP -> WAVAX
      const x = findOptimalAVAX(
        reserve2,
        reserve3,
        reserve0,
        reserve1,
        kLastPng,
        kLastJoe
      );

      direction = "png -> joe";
      optimalValue = ethers.utils.formatEther(x);
    }

    table.push({
      blockNumber,
      reserve0: reserve0.toString(),
      reserve1: reserve1.toString(),
      reserve2: reserve2.toString(),
      reserve3: reserve3.toString(),
      joePtpPrice: ethers.utils.formatEther(joePtpPrice[1]),
      pngPtpPrice: ethers.utils.formatEther(pngPtpPrice[1]),
      priceDiff: ethers.utils.formatEther(joePtpPrice[1].sub(pngPtpPrice[1])),
      direction,
      optimalValue,
    });
    if (table.length > 20) {
      table.shift();
    }
    // monitor contract
    console.clear();
    console.table(table);

    const gasCost = await calculateGasCost();
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
