# AI-INSTRUCTIONS.md
# Ethers.js v5 → v6 Migration: AI Agent Edge Case Handling

> **Purpose:** This document instructs an AI agent on how to handle migration cases that the automated jscodeshift codemods (`transform.js` through `transform12.js`) cannot resolve deterministically. Follow each section precisely and in order when reviewing migrated files.

---

## How to Use This Document

1. Run the full automated recipe first: `npx jscodeshift -t recipe.js ./src --extensions=js,ts`
2. After the automated pass, open each modified file and check for the patterns described below.
3. Apply the manual fixes described in each section, using the before/after examples as a guide.
4. For TypeScript files, also apply the type-level fixes in Section 6.

---

## Section 1: Complex BigNumber Chains on Unknown Variables

### Problem

The codemod only converts `.add()`, `.sub()`, `.mul()`, `.div()`, `.eq()` when the receiver is a **provably known BigNumber** (i.e., directly created with `BigNumber.from()` or assigned from one). If a variable was passed in from an external scope, parameter, or returned from a function, the codemod leaves it untouched.

### Pattern to Find

```js
// The codemod left this unchanged because the type of someUnknownVar is ambiguous
someUnknownVar.add(otherVar).mul(factor)
```

### AI Instructions

1. **Trace the variable backwards** through the current file and function scope.
2. If `someUnknownVar` was assigned from a `BigNumber.from(...)` call, a function that returns `BigNumber`, or is typed as `BigNumber` in TypeScript, it **is** a BigNumber — convert it.
3. If the variable is a function parameter with no type annotation, **check the call sites** to see what is passed in.
4. If you cannot determine the type with confidence, **add a comment** and leave it for human review.

### Before

```js
function calcFee(amount, bps) {
  return amount.mul(bps).div(10000);
}
```

### After (when `amount` is confirmed BigInt at call sites)

```js
function calcFee(amount, bps) {
  return amount * bps / BigInt(10000);
}
```

### After (when type is uncertain — leave with comment)

```js
function calcFee(amount, bps) {
  // TODO(ethers-v6-migration): Verify 'amount' is BigInt before converting
  return amount.mul(bps).div(10000);
}
```

---

## Section 2: `ethers.utils.commify` Replacement

### Problem

`ethers.utils.commify` was **removed entirely in v6**. There is no equivalent in the new API. It must be replaced with a custom inline implementation.

### Pattern to Find

```js
ethers.utils.commify("1234567.89")
```

### AI Instructions

1. Find all occurrences of `ethers.utils.commify(...)`.
2. Add the following helper function **once** at the top of each file that uses it:

```js
// ethers v6: commify was removed — using custom implementation
function commify(value) {
  const [integer, fraction] = String(value).split(".");
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction !== undefined ? `${formatted}.${fraction}` : formatted;
}
```

3. Replace all occurrences of `ethers.utils.commify(x)` with `commify(x)`.

### Before

```js
const display = ethers.utils.commify(ethers.utils.formatEther(balance));
```

### After

```js
function commify(value) {
  const [integer, fraction] = String(value).split(".");
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction !== undefined ? `${formatted}.${fraction}` : formatted;
}

const display = commify(ethers.formatEther(balance));
```

---

## Section 3: `ethers.utils.fetchJson` → `FetchRequest`

### Problem

`ethers.utils.fetchJson(url, json)` has been replaced by the `FetchRequest` class in v6, which has a fundamentally different API. A simple rename is not sufficient.

### Pattern to Find

```js
// GET style
const data = await ethers.utils.fetchJson(url);

// POST style
const data = await ethers.utils.fetchJson(url, JSON.stringify(body));
```

### AI Instructions

For **GET requests** (single argument — URL only):

```js
// Before
const data = await ethers.utils.fetchJson(url);

// After
const req = new ethers.FetchRequest(url);
const resp = await req.send();
const data = resp.bodyJson;
```

For **POST requests** (two arguments — URL and JSON body):

```js
// Before
const data = await ethers.utils.fetchJson(url, JSON.stringify(body));

// After
const req = new ethers.FetchRequest(url);
req.body = ethers.toUtf8Bytes(JSON.stringify(body));
req.setHeader("content-type", "application/json");
const resp = await req.send();
const data = resp.bodyJson;
```

> [!IMPORTANT]
> Always check whether the second argument to `fetchJson` is `JSON.stringify(...)` or a plain string. Both are POST requests. If the body is a pre-serialized string, wrap it in `ethers.toUtf8Bytes(body)`.

---

## Section 4: Custom Provider Subclasses

### Problem

Classes that extend `ethers.providers.JsonRpcProvider` (or any other v5 provider) need manual updates. The class hierarchy and constructor signatures changed in v6.

### Pattern to Find

```js
class MyProvider extends ethers.providers.JsonRpcProvider {
  constructor(url) {
    super(url);
  }
}
```

### AI Instructions

1. Update `extends ethers.providers.JsonRpcProvider` → `extends ethers.JsonRpcProvider`.
2. Check if the `constructor` uses `super(url, network)`. In v6, the second argument is a `Network` or `Networkish` object — verify compatibility.
3. If the subclass overrides `send(method, params)`, the signature is unchanged in v6. No action needed.
4. If the subclass overrides `detectNetwork()`, it must now return `Promise<Network>` (same as before, but import `Network` from `"ethers"` not from a sub-package).

### Before

```js
class MyProvider extends ethers.providers.JsonRpcProvider {
  constructor(url, network) {
    super(url, network);
  }
  async send(method, params) {
    console.log(method);
    return super.send(method, params);
  }
}
```

### After

```js
class MyProvider extends ethers.JsonRpcProvider {
  constructor(url, network) {
    super(url, network);
  }
  async send(method, params) {
    console.log(method);
    return super.send(method, params);
  }
}
```

---

## Section 5: BigNumber Literal Conversion

### Problem

The automated codemod converts `BigNumber.from(x)` to `BigInt(x)` for all arguments. However, when the argument is a **number literal** (e.g., `1000`, `0`, `1`), the idiomatic v6 JavaScript style is to use the **`n` suffix notation** (e.g., `1000n`) instead of `BigInt(1000)`.

Both are functionally equivalent, but `1000n` is cleaner and is what the ethers v6 docs use.

### Pattern to Find

```js
// Codemod output — functional but not idiomatic
const zero = BigInt(0);
const fee  = BigInt(10000);
const one  = BigInt(1);
```

### AI Instructions

After the codemod runs, scan for `BigInt(<number literal>)` and convert those to the `n` suffix form:

- `BigInt(0)` → `0n`
- `BigInt(1)` → `1n`
- `BigInt(10000)` → `10000n`

> [!NOTE]
> Only apply this to **plain integer literals**. Do NOT convert `BigInt(someVariable)` or `BigInt("1000")` (a string) to the `n` suffix — those need `BigInt()` to remain.

### Before (codemod output)

```js
const fee = amount * BigInt(3) / BigInt(1000);
const zero = BigInt(0);
```

### After (idiomatic v6)

```js
const fee = amount * 3n / 1000n;
const zero = 0n;
```

---

## Section 6: TypeScript `BigNumber` Type Annotations

### Problem

The automated codemod does not touch TypeScript type annotations. All instances of `BigNumber` used as a **type** (not as a value/constructor) must be replaced with the native `bigint` type.

### Pattern to Find

```ts
const balance: BigNumber = ...
function getAmount(): Promise<BigNumber> { ... }
type Amounts = { fee: BigNumber; slippage: BigNumber };
interface SwapResult { amountOut: BigNumber }
```

### AI Instructions

1. Replace `BigNumber` used as a **type annotation** with `bigint` (lowercase).
2. Do NOT replace `BigNumber` in value positions — those are handled by the codemod (e.g., `BigNumber.from()` → `BigInt()`).
3. Also update `Array<BigNumber>` → `bigint[]` and `BigNumber[]` → `bigint[]`.

### Before

```ts
import { BigNumber } from 'ethers';

async function getBalance(address: string): Promise<BigNumber> {
  const raw: BigNumber = await contract.balanceOf(address);
  return raw;
}
```

### After

```ts
// BigNumber import removed by transform9

async function getBalance(address: string): Promise<bigint> {
  const raw: bigint = await contract.balanceOf(address);
  return raw;
}
```

---

## Section 7: `AbiCoder.defaultAbiCoder` Property → Function Call

### Problem

In v5, `AbiCoder.defaultAbiCoder` was a **static property**. In v6, it is a **static getter function** and must be called as `AbiCoder.defaultAbiCoder()`.

### Pattern to Find

```js
const coder = ethers.utils.defaultAbiCoder;
// or
const coder = AbiCoder.defaultAbiCoder;
```

### AI Instructions

1. Find all reads of `AbiCoder.defaultAbiCoder` (without parentheses).
2. Also find `ethers.utils.defaultAbiCoder` (handled partially by transform1, but verify).
3. Add `()` to make it a function call.

### Before

```js
const coder = ethers.AbiCoder.defaultAbiCoder;
const encoded = coder.encode(["uint256"], [100]);
```

### After

```js
const coder = ethers.AbiCoder.defaultAbiCoder();
const encoded = coder.encode(["uint256"], [100]);
```

> [!IMPORTANT]
> This **only** applies when `defaultAbiCoder` is being read (accessed). It does NOT apply to any assignment to the property.

---

## Section 8: `feeData.lastBaseFeePerGas` Removal

### Problem

The `lastBaseFeePerGas` field on `FeeData` objects was **removed in v6**. Code that reads this field will silently get `undefined` or throw a runtime error.

The correct replacement is to read `baseFeePerGas` from the **latest block** directly.

### Pattern to Find

```js
const feeData = await provider.getFeeData();
const baseFee = feeData.lastBaseFeePerGas;
```

### AI Instructions

1. Find all reads of `.lastBaseFeePerGas` on any variable.
2. Replace the entire pattern with a block fetch:

### Before

```js
const feeData = await provider.getFeeData();
const baseFee = feeData.lastBaseFeePerGas;
```

### After

```js
const block = await provider.getBlock("latest");
const baseFee = block.baseFeePerGas;
```

> [!WARNING]
> `block.baseFeePerGas` can be `null` on networks that do not support EIP-1559. Add a null check if the code uses the value in calculations:
> ```js
> const block = await provider.getBlock("latest");
> const baseFee = block.baseFeePerGas ?? 0n;
> ```

---

## Section 9: BigNumber Comparison Operators

### Problem

The codemod converts arithmetic methods (`.add()`, `.mul()` etc.) but does **not** convert comparison methods: `.lt()`, `.gt()`, `.lte()`, `.gte()`. These must also be migrated when the receiver is a confirmed BigInt.

The same safety rules as Section 1 apply — only convert when the variable is provably a BigInt.

### Pattern to Find

```js
// Left unchanged by codemod — type of 'balance' is ambiguous
if (balance.lt(threshold)) { ... }
if (amount.gt(0)) { ... }
```

### AI Instructions

1. **Trace the variable** using the same method as Section 1.
2. Only convert when confirmed as a confirmed BigInt (or bigint-typed in TypeScript).
3. Apply the following operator substitutions:

| v5 method | v6 operator |
|---|---|
| `.lt(other)` | `< other` |
| `.gt(other)` | `> other` |
| `.lte(other)` | `<= other` |
| `.gte(other)` | `>= other` |

4. If type is uncertain, add a `TODO` comment and leave it unchanged.

### Before

```js
async function checkBalance(contract, user) {
  const balance = await contract.balanceOf(user); // returns bigint in v6
  if (balance.lt(ethers.parseEther("1.0"))) {
    console.log("Below minimum");
  }
  if (balance.gte(BigInt("1000000000000000000"))) {
    console.log("Above threshold");
  }
}
```

### After (balance confirmed as bigint from contract call)

```js
async function checkBalance(contract, user) {
  const balance = await contract.balanceOf(user);
  if (balance < ethers.parseEther("1.0")) {
    console.log("Below minimum");
  }
  if (balance >= 1000000000000000000n) {
    console.log("Above threshold");
  }
}
```

### After (type uncertain — leave with comment)

```js
// TODO(ethers-v6-migration): Verify 'balance' is bigint before converting .gt()
if (balance.gt(minimum)) { ... }
```

---

## Section 10: `contract.deployed()` Removal

### Problem

In v5, after deploying a contract you had to `await contract.deployed()` to wait for the contract to be mined. In v6, **this method has been removed**. Deployment is considered complete when the transaction is mined, which happens at the `await factory.deploy()` step itself.

### Pattern to Find

```js
const contract = await factory.deploy(arg1, arg2);
await contract.deployed(); // ← remove this line
```

### AI Instructions

1. Find all occurrences of `await <variable>.deployed()`.
2. Remove the entire line.
3. Do NOT remove the `await factory.deploy(...)` line — that is still required and correct.
4. If the return value of `.deployed()` was assigned to a variable (e.g., `const c = await contract.deployed()`), replace it with the original contract variable from the `deploy()` call.

### Before

```js
async function deployToken(factory) {
  const token = await factory.deploy("TokenName", "TKN");
  await token.deployed();
  console.log("Token deployed at:", token.address);
  return token;
}
```

### After

```js
async function deployToken(factory) {
  const token = await factory.deploy("TokenName", "TKN");
  // await token.deployed() removed — not needed in ethers v6
  console.log("Token deployed at:", token.target);
  return token;
}
```

> [!NOTE]
> Notice also that `token.address` was updated to `token.target` — this should have been handled automatically by `transform6.js`, but verify it was caught.

---

## Section 11: `provider.waitForTransaction()` → `provider.waitForTransactionReceipt()`

### Problem

`provider.waitForTransaction(txHash)` was renamed to `provider.waitForTransactionReceipt(txHash)` in v6. The method signature is otherwise identical.

### Pattern to Find

```js
const receipt = await provider.waitForTransaction(txHash);
```

### AI Instructions

1. Find all calls to `provider.waitForTransaction(...)` (on any variable name, not just `provider`).
2. Rename the method to `waitForTransactionReceipt`.
3. Arguments and return value are the same — no other changes needed.

### Before

```js
async function confirmTx(provider, txHash) {
  const receipt = await provider.waitForTransaction(txHash);
  console.log("Confirmed in block:", receipt.blockNumber);
  return receipt;
}

// Also with confirmations argument
const receipt = await provider.waitForTransaction(txHash, 3);
```

### After

```js
async function confirmTx(provider, txHash) {
  const receipt = await provider.waitForTransactionReceipt(txHash);
  console.log("Confirmed in block:", receipt.blockNumber);
  return receipt;
}

// Also with confirmations argument
const receipt = await provider.waitForTransactionReceipt(txHash, 3);
```

> [!NOTE]
> This is a straightforward rename with no behavioural changes. It is safe to apply globally across the codebase.

---

## Checklist for Manual Review

After applying all automated codemods (`recipe.js`) and all manual fixes above, verify:

| Check | Done? |
|---|---|
| No remaining `BigNumber.from(...)` calls | ☐ |
| No remaining `ethers.utils.*` calls | ☐ |
| No remaining `ethers.providers.*` references | ☐ |
| No remaining `ethers.constants.*` references | ☐ |
| `ethers.utils.commify` replaced with custom function | ☐ |
| `ethers.utils.fetchJson` replaced with `FetchRequest` | ☐ |
| Custom provider subclasses updated | ☐ |
| `BigInt(<literal>)` converted to `n` suffix where appropriate | ☐ |
| TypeScript `BigNumber` type annotations updated to `bigint` | ☐ |
| `AbiCoder.defaultAbiCoder` has parentheses added | ☐ |
| `feeData.lastBaseFeePerGas` replaced with `block.baseFeePerGas` | ☐ |
| `.lt()` / `.gt()` / `.lte()` / `.gte()` on confirmed BigInt values converted to operators | ☐ |
| `contract.deployed()` calls removed | ☐ |
| `waitForTransaction` renamed to `waitForTransactionReceipt` | ☐ |
| `package.json` updated to `"ethers": "^6.0.0"` | ☐ |
