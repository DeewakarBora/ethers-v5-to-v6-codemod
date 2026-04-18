import { ethers } from "ethers";

const hash = ethers.keccak256("0xdeadbeef");
const sha = ethers.sha256("0xdeadbeef");
const bytes = ethers.toUtf8Bytes("hello world");
