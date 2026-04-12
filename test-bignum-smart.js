const { ethers, BigNumber } = require('ethers');

// --- Should be transformed (provably BigNumber) ---

// 1. Direct BigNumber.from().add() chain
const sum = BigNumber.from("100").add(BigNumber.from("200"));

// 2. Variable assigned BigNumber.from() then used
const a = BigNumber.from("1000");
const b = BigNumber.from("2000");
const result = a.add(b);
const product = a.mul(b);
const isEqual = a.eq(b);

// 3. ethers.BigNumber.from() chain
const fee = ethers.BigNumber.from("500").mul(ethers.BigNumber.from("3"));

// --- Should NOT be transformed (ambiguous — not provably BigNumber) ---

// 4. Array method — should be ignored
const arr = [1, 2, 3];
const added = arr.add(4);  // false positive risk — leave alone

// 5. String method — should be ignored
const str = "hello";
const eq = str.eq("hello");  // false positive risk — leave alone

// 6. Unknown object — should be ignored
const result2 = someObject.add(otherValue);  // no evidence this is BigNumber
