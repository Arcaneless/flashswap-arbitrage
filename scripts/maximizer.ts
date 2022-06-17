import IPangolinFactoryArtifact from "@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/PangolinFactory.sol/PangolinFactory.json";
import IPangolinPairArtifact from "@pangolindex/exchange-contracts/artifacts/contracts/pangolin-core/PangolinPair.sol/PangolinPair.json";
import IPangolinRouterArtifact from "@pangolindex/exchange-contracts/artifacts/contracts/pangolin-periphery/PangolinRouter.sol/PangolinRouter.json";
import { IJoeFactory, IJoePair, IJoeRouter02 } from "@traderjoe-xyz/core";
import IJoeFactoryArtifact from "@traderjoe-xyz/core/artifacts/contracts/traderjoe/JoeFactory.sol/JoeFactory.json";
import IJoePairArtifact from "@traderjoe-xyz/core/artifacts/contracts/traderjoe/JoePair.sol/JoePair.json";
import IJoeRouter02Artifact from "@traderjoe-xyz/core/artifacts/contracts/traderjoe/JoeRouter02.sol/JoeRouter02.json";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { contractAccounts } from "./addresses";
import { PTP } from "./tokens";

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

// route: WAVAX -> JOE PTP -> PNG PTP -> WAVAX
// x WAVAX -> r1 - k0 / (r0 + x) PTP -> r3 - k1 / (r2 + (r1 - k / (r0 + x)))
// (r1 - k0 / (r0 + x)) / x = (r1 - k0 / (r0 + x)) / (r3 - k1 / (r2 + (r1 - k / (r0 + x))))
// x = (r3 - k1 / (r2 + (r1 - k / (r0 + x))))
export function findOptimalAVAX(
  r0: BigNumber,
  r1: BigNumber,
  r2: BigNumber,
  r3: BigNumber,
  k0: BigNumber,
  k1: BigNumber
) {
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
}

export async function optimizeByToken() {
  const provider = ethers.provider;

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
}
