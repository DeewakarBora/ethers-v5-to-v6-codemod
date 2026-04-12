const { BigNumber } = require('ethers');
const ethers = require('ethers');

// 1. Conversion tests
const a = BigNumber.from("1000");
const b = ethers.BigNumber.from("2000");

// 2. Variable assignments with operators
const sum = a.add(b);
const diff = a.sub(b);
const product = a.mul(b);
const quotient = a.div(b);

// 3. Equality comparison
const isEqual = a.eq(b);

// 4. Usage in functions
function calculateTotal(items) {
  return items.reduce((acc, item) => acc.add(item), BigNumber.from(0));
}

// 5. Nested operations (Fluent API style)
// Should become: (a + b) * BigInt("2")
const complex = a.add(b).mul(BigNumber.from("2"));

// 6. usage in conditionals
if (a.eq(BigNumber.from("1000"))) {
  console.log("Matched!");
}
