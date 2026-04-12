const ethers = require('ethers');

// 1. keccak256
const data = "0x1234";
const hash = ethers.utils.keccak256(data);

// 2. solidityKeccak256
const types = ["string", "uint256"];
const values = ["hello", 123];
const combinedHash = ethers.utils.solidityKeccak256(types, values);

// 3. sha256
const shaHash = ethers.utils.sha256(ethers.utils.toUtf8Bytes("hello world"));

// 4. ripemd160
const ripeHash = ethers.utils.ripemd160(data);

// 5. toUtf8Bytes (inside a function)
function getBytes(text) {
  return ethers.utils.toUtf8Bytes(text);
}

// 6. toUtf8String (inside an object)
const message = {
  raw: "0x48656c6c6f",
  decoded: ethers.utils.toUtf8String("0x48656c6c6f")
};

// 7. Used in a return statement
const processData = (input) => {
    const bytes = ethers.utils.toUtf8Bytes(input);
    return ethers.utils.keccak256(bytes);
};
