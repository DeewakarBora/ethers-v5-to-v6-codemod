import { ethers } from "ethers";

const hash = ethers.utils.keccak256("0xdeadbeef");
const sha = ethers.utils.sha256("0xdeadbeef");
const bytes = ethers.utils.toUtf8Bytes("hello world");
