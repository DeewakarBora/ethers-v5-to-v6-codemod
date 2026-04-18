import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/key");

const tx = await provider.sendTransaction(signedTx);
const serialized = ethers.utils.serializeTransaction(txData);
const parsed = ethers.utils.parseTransaction(hexTx);
