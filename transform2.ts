import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  // BigNumber.from(x) → BigInt(x)
  for (const pattern of ["BigNumber.from($ARG)", "ethers.BigNumber.from($ARG)"]) {
    const nodes = root.root().findAll({ rule: { pattern } });
    for (const node of nodes) {
      const arg = node.getMatch("ARG")?.text() ?? "";
      newSource = newSource.replace(node.text(), `BigInt(${arg})`);
    }
  }

  // Arithmetic methods — only on confirmed BigInt receivers
  const methodMap: Record<string, string> = {
    add: "+", sub: "-", mul: "*", div: "/", eq: "===",
    lt: "<", gt: ">", lte: "<=", gte: ">=",
  };

  for (const [method, operator] of Object.entries(methodMap)) {
    const nodes = root.root().findAll({
      rule: { pattern: `BigInt($LEFT).${method}($RIGHT)` },
    });
    for (const node of nodes) {
      const left = node.getMatch("LEFT")?.text() ?? "";
      const right = node.getMatch("RIGHT")?.text() ?? "";
      newSource = newSource.replace(node.text(), `BigInt(${left}) ${operator} ${right}`);
    }
  }

  return newSource !== source ? newSource : null;
};

export default transform;