import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/key");

const gasPrice = (await provider.getFeeData()).gasPrice;
const hex = ethers.hexlify(255);
const addr = ethers.getAddress("0x1234567890123456789012345678901234567890");
