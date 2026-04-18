import { ethers } from "ethers";

const contract = new ethers.Contract(address, abi, provider);
const to = "0x1234567890123456789012345678901234567890";
const amount = ethers.utils.parseEther("1.0");

const result = await contract.callStatic.transfer(to, amount);
