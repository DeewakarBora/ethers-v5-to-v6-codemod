import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  // Remove: import { BigNumber } from 'ethers'
  // Remove: import { providers } from 'ethers'
  // Clean: import { ethers, BigNumber } from 'ethers' → import { ethers } from 'ethers'
  const deprecatedImports = ["BigNumber", "providers"];

  for (const name of deprecatedImports) {
    // Remove standalone imports
    const standalonePattern = new RegExp(
      `import\\s*\\{\\s*${name}\\s*\\}\\s*from\\s*['"]ethers['"];?\\n?`,
      "g"
    );
    newSource = newSource.replace(standalonePattern, "");

    // Clean from combined imports
    const combinedPattern = new RegExp(`\\s*,?\\s*${name}\\s*,?`, "g");
    newSource = newSource.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"]ethers['"]/g,
      (match, imports) => {
        const cleaned = imports
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => !deprecatedImports.includes(s))
          .join(", ");
        return cleaned ? `import { ${cleaned} } from 'ethers'` : "";
      }
    );
  }

  return newSource !== source ? newSource : null;
};

export default transform;