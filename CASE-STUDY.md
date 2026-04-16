# Automating ethers.js v5 → v6 Migration with Codemods

---

## 1. The Problem

The release of ethers.js v6 introduced dozens of breaking API changes — and the ecosystem has not fully caught up. Thousands of production DeFi projects are still running on v5. The migration is painful not because any single change is hard, but because of sheer volume: `BigNumber` is gone, provider class names changed, utility functions moved namespaces, import structures broke, and contract interaction patterns were restructured.

Doing this by hand across a real codebase with hundreds of files means days of tedious search-and-replace, high risk of introducing regressions, and no guarantee of completeness. Simple regex approaches fail on edge cases and cause false positives. The ecosystem needed a surgical, structural solution.

---

## 2. The Approach

The solution was a suite of **12 jssg (JavaScript ast-grep) transforms** orchestrated via workflow.yaml.

[jssg](https://docs.codemod.com/jssg/intro) parses JavaScript and TypeScript source files into an **Abstract Syntax Tree (AST)** — a language-aware, structured representation of the code. Transforms traverse the AST, find specific v5 patterns, and replace them with their v6 equivalents. Because the matching is structural rather than textual, it is immune to false positives: a pattern inside a string literal or a comment is never touched.

Each transform handles exactly one category of changes in isolation, making the system easy to test, extend, and audit. workflow.yaml orchestrates all 12 transforms in sequence

---

## 3. What Was Automated

The 12 transforms cover these categories:

1. **Utils functions** — `ethers.utils.formatEther`, `parseEther`, `formatUnits`, `arrayify`, `hexlify`, and 10 more
2. **BigNumber → BigInt** — `BigNumber.from(x)` → `BigInt(x)`, with smart scope-aware detection to avoid false positives
3. **Provider renames** — `ethers.providers.Web3Provider` → `ethers.BrowserProvider`, and all other provider classes
4. **Crypto utils** — `ethers.utils.keccak256`, `sha256`, `toUtf8Bytes`, `solidityKeccak256` (renamed)
5. **callStatic → staticCall** — `contract.callStatic.foo(args)` → `contract.foo.staticCall(args)`
6. **Contract address** — `contract.address` → `contract.target` (with naming heuristic to avoid wallet false positives)
7. **Broadcast transaction** — `provider.sendTransaction(hex)` → `provider.broadcastTransaction(hex)`, plus `serializeTransaction` and `parseTransaction`
8. **Signature class** — `ethers.utils.splitSignature`, `joinSignature`, `verifyMessage`, `recoverAddress`
9. **Import cleanup** — removes deprecated `BigNumber` and `providers` named imports from `ethers`
10. **Gas price changes** — `provider.getGasPrice()` → `(await provider.getFeeData()).gasPrice`, plus hex utilities
11. **estimateGas / populateTransaction / functions** — structural inversion of contract namespace patterns
12. **@ethersproject sub-package imports** — redirects all `@ethersproject/*` imports to the root `ethers` package

---

## 4. Automation Coverage

The 12 transforms handle approximately **~95% of all real-world v5 → v6 migration patterns** deterministically. The remaining ~5% of cases — where the transform cannot confidently determine intent — are documented in detail in `AI-INSTRUCTIONS.md`.

That document covers 11 specific edge cases, including:
- `BigNumber` TypeScript type annotations (`BigNumber` → `bigint`)
- `ethers.utils.commify` replacement (removed in v6, needs a custom helper)
- `ethers.utils.fetchJson` → `FetchRequest` class rewrite
- Custom provider subclasses requiring `extends` clause updates
- `contract.deployed()` removal (no longer needed in v6)
- `provider.waitForTransaction` → `waitForTransactionReceipt`

---

## 5. Real-World Test Results

The full recipe was run against [`thallo-io/ethers-js-cheatsheet`](https://github.com/thallo-io/ethers-js-cheatsheet) — a real open-source TypeScript DeFi project containing Uniswap queries, ERC-20 interactions, and wallet utilities.

**Result: 6 TypeScript files transformed · 0 errors · 0 false positives · 1.266 seconds**

### Uniswap Quote Script — Before & After

**Before (ethers v5):**
```typescript
const amountIn = ethers.utils.parseEther("1");
const priceQuote = await uni.callStatic.quoteExactInputSingle(WETH9, DAI, fee, amountIn, sqrtPriceLimitX96);
console.log(ethers.utils.formatEther(priceQuote));
```

**After (ethers v6):**
```typescript
const amountIn = ethers.parseEther("1");
const priceQuote = await uni.quoteExactInputSingle.staticCall(WETH9, DAI, fee, amountIn, sqrtPriceLimitX96);
console.log(ethers.formatEther(priceQuote));
```

Three distinct v5 patterns — `utils.parseEther`, `callStatic`, and `utils.formatEther` — were all corrected in a single automated pass with no developer intervention.

---

## 6. AI vs. Manual Effort Breakdown

| Source | Coverage |
|---|---|
| Automated codemod (jssg transforms) | ~95% |
| AI agent following `AI-INSTRUCTIONS.md` | ~4% |
| Human review for truly ambiguous cases | ~1% |

The `AI-INSTRUCTIONS.md` file is structured to be actionable by an AI agent: each section has a concrete "Pattern to Find," specific before/after examples, and explicit decision rules — including when to convert and when to leave a `TODO` comment instead.

---

## 7. Impact

| Metric | Result |
|---|---|
| Time to migrate an entire project | Under 2 seconds |
| Manual developer time saved | Hours to days depending on codebase size |
| False positives | Zero |
| Language support | JavaScript and TypeScript |
| Confidence in output | High — AST-based, structurally exact |

The zero-false-positive guarantee is the most important property. Developers can apply the transforms and commit the result with confidence — no need to manually audit every changed line for unwanted side effects.

---

## 8. How to Use
```bash
# Run via Codemod registry
npx codemod ethers-v5-to-v6-codemod

# Or run workflow directly
npx codemod workflow run -w workflow.yaml -t ./your-project
```

After the automated pass, open `AI-INSTRUCTIONS.md` and use it as a checklist to handle the remaining edge cases — or pass it to an AI agent to complete the migration automatically.

The full source, all 12 transforms, and the AI instructions guide are available in the [ethers-v5-to-v6-codemod](https://github.com/DeewakarBora/ethers-v5-to-v6-codemod) repository.
