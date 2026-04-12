import { BigNumber } from "@ethersproject/bignumber";
import { formatEther, parseEther } from "@ethersproject/units";
import { JsonRpcProvider } from "@ethersproject/providers";
import { keccak256 } from "@ethersproject/solidity";
import { toUtf8Bytes } from "@ethersproject/strings";
import { getAddress } from "@ethersproject/address";
import { arrayify, hexlify } from "@ethersproject/bytes";

/**
 * test-input12.ts
 * Examples of ethers v5 sub-package imports and usage.
 */

// 1. BigNumber
const amount: BigNumber = BigNumber.from("1000000000000000000");
console.log("BigNumber amount:", amount.toString());

// 2. Units
const ethValue: string = formatEther(amount);
const weiValue: BigNumber = parseEther("1.5");
console.log(`Formatted: ${ethValue}, Parsed: ${weiValue}`);

// 3. Providers
const provider = new JsonRpcProvider("https://mainnet.infura.io/v3/YOUR-PROJECT-ID");
provider.getBlockNumber().then(console.log);

// 4. Solidity Keccak256
const digest = keccak256(["string", "uint256"], ["test", amount]);
console.log("Solidity Digest:", digest);

// 5. Strings
const encodedBytes = toUtf8Bytes("hello world");
console.log("UTF-8 Bytes:", encodedBytes);

// 6. Address
const checksumAddr = getAddress("0x1234567890123456789012345678901234567890");
console.log("Checksummed Address:", checksumAddr);

// 7. Bytes
const dataArray = arrayify("0xdeadbeef");
const hexString = hexlify([1, 2, 3]);
console.log("Arrayify:", dataArray);
console.log("Hexlify:", hexString);
