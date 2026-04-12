const ethers = require('ethers');

// 1. Basic callStatic inside an async function
async function checkBalance(contract, address) {
  const balance = await contract.callStatic.balanceOf(address);
  return balance;
}

// 2. With arguments and variable assignment
const address = "0x...";
const data = contract.callStatic.transfer(address, 100);

// 3. Chained with await directly
const result = await contract.callStatic.owner();

// 4. Inside an object property
const batchCalls = {
  checkOwner: contract.callStatic.owner(),
  checkTotal: contract.callStatic.totalSupply()
};

// 5. Inside a complex expression or conditional
async function run() {
    if (await contract.callStatic.isValid(123)) {
        console.log("Valid!");
    }
}

// 6. With multiple arguments and custom overrides
const customResult = await contract.callStatic.performAction(
    "hello",
    42,
    { from: "0x..." }
);
