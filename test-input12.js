// 1. BigNumber only import → should be removed entirely
import { BigNumber } from "@ethersproject/bignumber";

// 2. Units import → redirect to "ethers"
import { formatEther, parseEther, formatUnits, parseUnits } from "@ethersproject/units";

// 3. Providers import → redirect to "ethers"
import { JsonRpcProvider, WebSocketProvider, InfuraProvider } from "@ethersproject/providers";

// 4. Solidity hashing → redirect + rename to solidityPacked* variants
import { keccak256, sha256 } from "@ethersproject/solidity";

// 5. Raw keccak256 → redirect to "ethers"
import { keccak256 as rawKeccak } from "@ethersproject/keccak256";

// 6. String utilities → redirect to "ethers"
import { toUtf8Bytes, toUtf8String } from "@ethersproject/strings";

// 7. Address utilities → redirect to "ethers"
import { getAddress, isAddress } from "@ethersproject/address";

// 8. Bytes utilities → redirect + rename
import { arrayify, hexlify } from "@ethersproject/bytes";

// --- Usage ---
const a = BigNumber.from("1000");
const bal = formatEther(a);
const provider = new JsonRpcProvider("https://rpc.example.com");
const hash = keccak256(["string"], ["hello"]);
const sha = sha256(["bytes"], ["0xdead"]);
const bytes = toUtf8Bytes("test");
const addr = getAddress("0x1234567890123456789012345678901234567890");
const raw = arrayify("0xdeadbeef");
