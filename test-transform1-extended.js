const { ethers } = require('ethers');

// --- formatUnits / parseUnits ---
const formatted = ethers.utils.formatUnits("1000000", 6);  // USDC has 6 decimals
const parsed = ethers.utils.parseUnits("1.5", 18);

// --- formatBytes32String / parseBytes32String ---
const encoded = ethers.utils.formatBytes32String("hello");
const decoded = ethers.utils.parseBytes32String(encoded);

// --- hexDataSlice / hexZeroPad / hexValue ---
const sliced = ethers.utils.hexDataSlice("0xabcdef1234567890", 0, 4);
const padded = ethers.utils.hexZeroPad("0x1234", 32);
const qty = ethers.utils.hexValue(255);

// --- arrayify ---
const bytes = ethers.utils.arrayify("0xdeadbeef");

// --- solidityPack / soliditySha256 ---
const packed = ethers.utils.solidityPack(["address", "uint256"], ["0x1234...", 100]);
const sha256Hash = ethers.utils.soliditySha256(["string"], ["hello"]);

// --- ethers.constants ---
const zeroAddr = ethers.constants.AddressZero;
const zeroHash = ethers.constants.HashZero;

// --- Originals still working ---
const bal = ethers.utils.formatEther("1000000000000000000");
const val = ethers.utils.parseEther("1.5");
