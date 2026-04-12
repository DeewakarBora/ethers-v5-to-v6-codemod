const ethers = require('ethers');

// 1. Basic variable assignment
const balance = "1000000000000000000";
const ethValue = ethers.formatEther(balance);
console.log(`Balance in ETH: ${ethValue}`);

// 2. Inside a function
function convertToWei(amount) {
  return ethers.parseEther(amount);
}

// 3. As a function argument
async function sendTransaction() {
  const tx = await wallet.sendTransaction({
    to: "0x...",
    value: ethers.parseEther("1.5")
  });
}

// 4. Inside an object property
const transactionData = {
  label: "Payment",
  amountInWei: ethers.parseEther("0.1"),
  formatted: ethers.formatEther("100000000000000000")
};

// 5. In a template literal
const displayBalance = (val) => {
  return `Your current balance is ${ethers.formatEther(val)} ETH`;
};

// 6. In a mathematical expression or conditional
const threshold = ethers.parseEther("10.0");
if (ethers.parseEther("12.5").gt(threshold)) {
  console.log("Above threshold");
}
