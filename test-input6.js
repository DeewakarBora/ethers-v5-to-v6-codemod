const ethers = require('ethers');

// 1. In a console.log
console.log("Contract deployed at:", contract.address);

// 2. Variable assignment
const contractAddress = contract.address;

// 3. Inside an if statement
if (contract.address === "0x0000000000000000000000000000000000000000") {
  console.log("Contract not deployed yet.");
}

// 4. In a template literal
const message = `The contract is live at ${contract.address} on mainnet.`;

// 5. Inside an object property
const deploymentInfo = {
  name: "MyToken",
  address: contract.address,
  deployer: wallet.address
};

// 6. As a function argument
async function verifyContract() {
  await hre.run("verify:verify", {
    address: contract.address,
    constructorArguments: []
  });
}
