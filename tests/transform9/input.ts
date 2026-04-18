import { BigNumber, ethers } from "ethers";
import { providers, Wallet } from "ethers";

const wallet = new Wallet(privateKey);
const provider = new providers.JsonRpcProvider(rpcUrl);
const bn = BigNumber.from("100");
