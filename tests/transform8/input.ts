import { ethers } from "ethers";

const split = ethers.utils.splitSignature(sig);
const joined = ethers.utils.joinSignature(sigObj);
const recovered = ethers.utils.verifyMessage(message, sig);
