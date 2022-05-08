import { ethers } from "hardhat";

export const calculateGasCost = async () => {
  try {
    const gasPrice = await ethers.provider.getGasPrice();
    const feeData = await ethers.provider.getFeeData();

    const gas = 260000;

    console.log(
      "gas price",
      feeData.gasPrice,
      "max priority",
      feeData.maxPriorityFeePerGas
    );

    return gasPrice.mul(gas);
  } catch (err) {
    console.warn("Error while calculating gas cost", err);
    // practically infinite gas cost
    return ethers.utils.parseEther("1000");
  }
};
