import { ethers } from "ethers";

const split = ethers.Signature.from(sig);
const joined = ethers.Signature.from(sigObj).serialized;
const recovered = ethers.verifyMessage(message, sig);
