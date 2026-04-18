import { ethers } from "ethers";

const amount = ethers.formatEther("1000000000000000000");
const parsed = ethers.parseEther("1.0");
const bytes = ethers.getBytes("0xdeadbeef");
const zero = ethers.ZeroAddress;
const hashZero = ethers.ZeroHash;
