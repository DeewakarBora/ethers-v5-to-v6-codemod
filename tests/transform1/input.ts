import { ethers } from "ethers";

const amount = ethers.utils.formatEther("1000000000000000000");
const parsed = ethers.utils.parseEther("1.0");
const bytes = ethers.utils.arrayify("0xdeadbeef");
const zero = ethers.constants.AddressZero;
const hashZero = ethers.constants.HashZero;
