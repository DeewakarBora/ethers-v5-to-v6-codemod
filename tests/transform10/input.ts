import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/key");

const gasPrice = await provider.getGasPrice();
const hex = ethers.utils.hexlify(255);
const addr = ethers.utils.getAddress("0x1234567890123456789012345678901234567890");
