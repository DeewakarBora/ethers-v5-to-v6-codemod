const { ethers } = require('ethers');

// 1. sendTransaction with a signed raw hex string → should become broadcastTransaction
async function broadcast(provider, signedTxHex) {
  const txResponse = await provider.sendTransaction(signedTxHex);
  return txResponse;
}

// 2. sendTransaction with a plain object → should NOT be changed (stays sendTransaction)
async function sendEth(signer) {
  const tx = await signer.sendTransaction({
    to: "0x1234567890123456789012345678901234567890",
    value: ethers.utils.parseEther("1.0"),
  });
  return tx;
}

// 3. serializeTransaction → ethers.Transaction.from(tx).serialized
const txData = {
  to: "0x1234567890123456789012345678901234567890",
  value: ethers.utils.parseEther("0.5"),
  nonce: 10
};
const serializedTx = ethers.utils.serializeTransaction(txData);

// 4. parseTransaction → ethers.Transaction.from(hexString)
const hexString = "0xf86c0a8502540be400825208941234567890123456789012345678901234567890880de0b6b3a7640000801ca0";
const parsed = ethers.utils.parseTransaction(hexString);

// 5. serializeTransaction inside a variable assignment
const getRaw = (tx) => {
  const raw = ethers.utils.serializeTransaction(tx);
  return raw;
};

// 6. parseTransaction inside an async function
async function decode(hex) {
  const decoded = ethers.utils.parseTransaction(hex);
  console.log("Decoded Nonce:", decoded.nonce);
  return decoded;
}
