import { ethers } from "ethers";

const contract = new ethers.Contract(address, abi, signer);
const to = "0x1234567890123456789012345678901234567890";
const amount = ethers.parseEther("1.0");

const gas = await contract.transfer.estimateGas(to, amount);
const populated = await contract.transfer.populateTransaction(to, amount);
