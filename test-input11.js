const { ethers } = require('ethers');

// 1. estimateGas inside an async function
async function estimateTransfer(contract, recipient, amount) {
  const gas = await contract.estimateGas.transfer(recipient, amount);
  console.log("Estimated Gas:", gas.toString());
  return gas;
}

// 2. populateTransaction for offline signing
async function prepareDeposit(contract, amount) {
  const unsignedTx = await contract.populateTransaction.deposit(amount);
  return unsignedTx;
}

// 3. functions namespace to get all return values (v5 style)
async function getRawBalance(contract, address) {
  const result = await contract.functions.balanceOf(address);
  return result; // in v5 this returns a Result object with positional and named values
}

// 4. estimateGas used in a variable assignment
async function getOverhead(contract, data) {
  const estimated = await contract.estimateGas.processData(data);
  const buffered = estimated.mul(120).div(100); // 20% buffer
  return buffered;
}

// 5. populateTransaction with multiple arguments
async function prepareSwap(contract, tokenA, tokenB, amount) {
  const tx = await contract.populateTransaction.swap(tokenA, tokenB, amount);
  console.log("Gas limit in populated tx:", tx.gasLimit);
  return tx;
}

// 6. functions namespace inside a conditional
async function checkOwnership(contract, tokenId) {
  const [owner] = await contract.functions.ownerOf(tokenId);
  if (owner === "0x1234567890123456789012345678901234567890") {
    return true;
  }
  return false;
}
