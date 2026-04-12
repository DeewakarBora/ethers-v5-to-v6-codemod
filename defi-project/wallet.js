const { ethers } = require('ethers');

/**
 * wallet.js
 * Wallet utility module for connecting to MetaMask and managing balances.
 */

// Connect to MetaMask via Web3Provider
async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log("Connected wallet:", address);
  return { provider, signer, address };
}

// Get ETH balance formatted for display
async function getEthBalance(provider, address) {
  const rawBalance = await provider.getBalance(address);
  const formatted = ethers.utils.formatEther(rawBalance);
  console.log(`ETH Balance: ${formatted} ETH`);
  return formatted;
}

// Send ETH from signer to a recipient
async function sendEth(signer, recipientAddress, amountInEth) {
  const value = ethers.utils.parseEther(amountInEth);
  const tx = await signer.sendTransaction({
    to: recipientAddress,
    value: value,
  });
  console.log("Transaction sent:", tx.hash);
  await tx.wait();
  console.log("Transaction confirmed.");
  return tx;
}

// Calculate gas cost in ETH from gas used and gas price
function calculateGasCost(gasUsed, gasPrice) {
  const costInWei = ethers.BigNumber.from(gasUsed).mul(gasPrice);
  return ethers.utils.formatEther(costInWei);
}

// Check if wallet has enough balance for a transaction
async function hasSufficientBalance(provider, address, requiredEth) {
  const balance = await provider.getBalance(address);
  const required = ethers.utils.parseEther(requiredEth);
  if (balance.lt(required)) {
    console.warn("Insufficient balance.");
    return false;
  }
  return true;
}

module.exports = { connectWallet, getEthBalance, sendEth, calculateGasCost, hasSufficientBalance };
