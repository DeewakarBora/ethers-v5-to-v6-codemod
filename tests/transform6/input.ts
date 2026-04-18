import { ethers } from "ethers";

const tokenContract = new ethers.Contract(tokenAddress, abi, signer);
const myContract = new ethers.Contract(contractAddress, abi, provider);

console.log(tokenContract.address);
console.log(myContract.address);
