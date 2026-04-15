import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const packageMap: Record<string, { removeSpecifiers: string[]; renameMap: Record<string, string> }> = {
  "@ethersproject/bignumber": { removeSpecifiers: ["BigNumber"], renameMap: {} },
  "@ethersproject/units": { removeSpecifiers: [], renameMap: {} },
  "@ethersproject/providers": { removeSpecifiers: [], renameMap: {} },
  "@ethersproject/solidity": { removeSpecifiers: [], renameMap: { keccak256: "solidityPackedKeccak256", sha256: "solidityPackedSha256" } },
  "@ethersproject/keccak256": { removeSpecifiers: [], renameMap: {} },
  "@ethersproject/strings": { removeSpecifiers: [], renameMap: {} },
  "@ethersproject/address": { removeSpecifiers: [], renameMap: {} },
  "@ethersproject/bytes": { removeSpecifiers: [], renameMap: { arrayify: "getBytes", hexlify: "hexlify", hexZeroPad: "zeroPadValue" } },
};

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  for (const [pkg, config] of Object.entries(packageMap)) {
    const escapedPkg = pkg.replace(/\//g, "\\/").replace(/@/g, "\\@");
    const importRegex = new RegExp(
      `import\\s*\\{([^}]+)\\}\\s*from\\s*['"]${escapedPkg}['"];?\\n?`,
      "g"
    );

    newSource = newSource.replace(importRegex, (match, imports) => {
      let specifiers = imports
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s && !config.removeSpecifiers.includes(s))
        .map((s: string) => config.renameMap[s]
          ? `${config.renameMap[s]} as ${s}`
          : s
        );

      if (specifiers.length === 0) return "";
      return `import { ${specifiers.join(", ")} } from 'ethers';\n`;
    });
  }

  return newSource !== source ? newSource : null;
};

export default transform;