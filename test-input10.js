const { ethers } = require('ethers');

// 1. getGasPrice inside an async function
async function checkCurrentGas(provider) {
  const gasPrice = await provider.getGasPrice();
  console.log("Current gas price:", gasPrice.toString());
  return gasPrice;
}

// 2. hexlify and isHexString inside a function
function formatData(value) {
  if (ethers.utils.isHexString(value)) {
    return value;
  }
  return ethers.utils.hexlify(value);
}

// 3. hexStripZeros and getAddress in a cleanup utility
function cleanupAddress(input) {
  const stripped = ethers.utils.hexStripZeros(input);
  try {
    return ethers.utils.getAddress(stripped);
  } catch (e) {
    return null;
  }
}

// 4. isAddress inside a conditional
async function validateAndSend(provider, address) {
  if (ethers.utils.isAddress(address)) {
    const gasPrice = await provider.getGasPrice();
    console.log(`Sending to valid address with gas: ${gasPrice}`);
  }
}

// 5. Mixed usage in variable assignments
async function getMetadata(provider, rawHex) {
  const isValid = ethers.utils.isHexString(rawHex);
  const gasPrice = await provider.getGasPrice();
  const checksumAddr = ethers.utils.getAddress("0x1234567890123456789012345678901234567890");
  
  return {
    isValid,
    gasPrice,
    checksumAddr
  };
}
