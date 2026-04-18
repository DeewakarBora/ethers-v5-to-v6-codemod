import { formatEther } from "ethers";
import { getAddress } from "ethers";
import { getBytes as arrayify } from "ethers";

const formatted = formatEther("1000000000000000000");
const checksummed = getAddress("0x1234567890123456789012345678901234567890");
const bytes = arrayify("0xdeadbeef");
