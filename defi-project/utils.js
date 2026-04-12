const { ethers } = require('ethers');

/**
 * utils.js
 * Shared utility functions for hashing, encoding, and BigNumber math.
 */

// Hash a message using keccak256 after encoding it as UTF-8 bytes
function hashMessage(message) {
  const bytes = ethers.utils.toUtf8Bytes(message);
  const hash = ethers.utils.keccak256(bytes);
  console.log(`keccak256("${message}") = ${hash}`);
  return hash;
}

// Generate a deterministic ID from two addresses and a nonce
function generatePoolId(tokenA, tokenB, nonce) {
  return ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(`${tokenA}:${tokenB}:${nonce}`)
  );
}

// Format a raw wei value to a human-readable ETH string
function formatBalance(weiValue) {
  return ethers.utils.formatEther(weiValue);
}

// Calculate total fees from an array of BigNumber fee amounts
function sumFees(feeAmounts) {
  return feeAmounts.reduce(
    (acc, fee) => acc.add(fee),
    ethers.BigNumber.from(0)
  );
}

// Calculate the protocol cut: amount * feeBps / 10000
function calcProtocolFee(amount, feeBps) {
  const bigAmount = ethers.BigNumber.from(amount);
  const bigBps = ethers.BigNumber.from(feeBps);
  const fee = bigAmount.mul(bigBps).div(ethers.BigNumber.from(10000));
  console.log(`Protocol fee: ${ethers.utils.formatEther(fee)} ETH`);
  return fee;
}

// Add slippage tolerance to an amount (e.g., 0.5% = 50 bps)
function applySlippage(amountOut, slippageBps) {
  const bigAmount = ethers.BigNumber.from(amountOut);
  const factor = ethers.BigNumber.from(10000).sub(slippageBps);
  return bigAmount.mul(factor).div(ethers.BigNumber.from(10000));
}

// Build a summary object for a swap operation
function buildSwapSummary(amountIn, amountOut, feeBps) {
  const fee = calcProtocolFee(amountIn, feeBps);
  const afterFee = ethers.BigNumber.from(amountIn).sub(fee);
  return {
    amountIn: formatBalance(amountIn),
    amountOut: formatBalance(amountOut),
    fee: formatBalance(fee),
    netInput: formatBalance(afterFee),
  };
}

module.exports = { hashMessage, generatePoolId, formatBalance, sumFees, calcProtocolFee, applySlippage, buildSwapSummary };
