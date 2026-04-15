import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  // contract.address → contract.target
  // Only on variables ending in Contract or contract
  const nodes = root.root().findAll({
    rule: { pattern: "$CONTRACT.address" },
  });

  for (const node of nodes) {
    const contract = node.getMatch("CONTRACT")?.text() ?? "";
    if (
      contract === "contract" ||
      contract.endsWith("Contract") ||
      contract.endsWith("contract")
    ) {
      newSource = newSource.replace(node.text(), `${contract}.target`);
    }
  }

  return newSource !== source ? newSource : null;
};

export default transform;