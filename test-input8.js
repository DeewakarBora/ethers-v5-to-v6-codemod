const { ethers } = require('ethers');

// 1. splitSignature with a hex string argument
const signature = "0x4fe77301c24ca022b794a32cd617415a78241517540203f3192078696d595166661c94412c969372bd161a069ba35ceb3058866579628a8d0f119e83ca51bf8f6c1b";
const split = ethers.utils.splitSignature(signature);

// 2. joinSignature with a signature object
const sigObject = {
  r: "0x4fe77301c24ca022b794a32cd617415a78241517540203f3192078696d595166",
  s: "0x61c94412c969372bd161a069ba35ceb3058866579628a8d0f119e83ca51bf8f6c",
  v: 27
};
const joined = ethers.utils.joinSignature(sigObject);

// 3. verifyMessage inside an async function
async function checkSigner(message, sig) {
  const address = ethers.utils.verifyMessage(message, sig);
  console.log("Recovered Address:", address);
  return address;
}

// 4. recoverAddress used in a variable assignment
const digest = ethers.utils.id("hello world");
const recovered = ethers.utils.recoverAddress(digest, signature);

// 5. splitSignature inside a function
function getSignatureParts(sig) {
  const { r, s, v } = ethers.utils.splitSignature(sig);
  return { r, s, v };
}

// 6. complex flow inside an async function
async function processSignature(signer, message) {
  const sig = await signer.signMessage(message);
  
  // Test both verify and recover
  const addr1 = ethers.utils.verifyMessage(message, sig);
  const digest = ethers.utils.hashMessage(message);
  const addr2 = ethers.utils.recoverAddress(digest, sig);
  
  // Test splitting and joining
  const part = ethers.utils.splitSignature(sig);
  const re_joined = ethers.utils.joinSignature(part);
  
  return { addr1, addr2, re_joined };
}
