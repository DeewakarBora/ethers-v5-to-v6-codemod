import { ethers } from "ethers";
import { Wallet } from "ethers";

const wallet = new Wallet(privateKey);
const provider = new ethers.JsonRpcProvider(rpcUrl);
const bn = BigInt("100");
