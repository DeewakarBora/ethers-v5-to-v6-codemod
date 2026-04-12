const { ethers } = require('ethers');
const ERC20_ABI = require('./abi/ERC20.json');
const POOL_ABI = require('./abi/Pool.json');

/**
 * contracts.js
 * Contract interaction module for DeFi token and liquidity pool operations.
 */

const RPC_URL = process.env.RPC_URL || "https://mainnet.infura.io/v3/YOUR_INFURA_KEY";
const TOKEN_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC
const POOL_ADDRESS  = "0x1234567890abcdef1234567890abcdef12345678";

// Initialise a read-only provider and contract instances
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
const poolContract  = new ethers.Contract(POOL_ADDRESS, POOL_ABI, provider);

// Read token balance using callStatic (safe, no gas)
async function getTokenBalance(userAddress) {
  const balance = await tokenContract.callStatic.balanceOf(userAddress);
  const decimals = await tokenContract.callStatic.decimals();
  const formatted = ethers.utils.formatUnits(balance, decimals);
  console.log(`Token balance: ${formatted}`);
  return formatted;
}

// Simulate a swap without sending a real transaction
async function simulateSwap(amountIn, tokenIn, tokenOut, userAddress) {
  const amountInWei = ethers.BigNumber.from(amountIn);
  const expectedOut = await poolContract.callStatic.getAmountOut(
    amountInWei,
    tokenIn,
    tokenOut
  );
  console.log(`Expected output: ${expectedOut.toString()}`);
  return expectedOut;
}

// Check pool reserves using callStatic
async function getPoolReserves() {
  const [reserve0, reserve1] = await poolContract.callStatic.getReserves();
  console.log(`Reserve0: ${reserve0.toString()}, Reserve1: ${reserve1.toString()}`);
  return { reserve0, reserve1 };
}

// Log deployed contract addresses (v5: contract.address)
function logContractAddresses() {
  console.log("Token contract address:", tokenContract.address);
  console.log("Pool contract address:", poolContract.address);
}

// Fetch allowance with callStatic
async function getAllowance(owner, spender) {
  const allowance = await tokenContract.callStatic.allowance(owner, spender);
  console.log(`Allowance: ${allowance.toString()}`);
  return allowance;
}

module.exports = { getTokenBalance, simulateSwap, getPoolReserves, logContractAddresses, getAllowance };
