import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/key");

const tx = await provider.broadcastTransaction(signedTx);
const serialized = ethers.Transaction.from(txData).serialized;
const parsed = ethers.Transaction.from(hexTx);
