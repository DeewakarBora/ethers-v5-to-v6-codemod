import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const namespaceMap: Record<string, string> = {
  estimateGas: "estimateGas",
  populateTransaction: "populateTransaction",
  functions: "staticCallResult",
};

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  for (const [namespace, v6Method] of Object.entries(namespaceMap)) {
    const nodes = root.root().findAll({
      rule: { pattern: `$CONTRACT.${namespace}.$METHOD($$$ARGS)` },
    });
    for (const node of nodes) {
      const contract = node.getMatch("CONTRACT")?.text() ?? "";
      const method = node.getMatch("METHOD")?.text() ?? "";
      const args = node.getMatch("ARGS")?.text() ?? "";
      newSource = newSource.replace(
        node.text(),
        `${contract}.${method}.${v6Method}(${args})`
      );
    }
  }

  return newSource !== source ? newSource : null;
};

export default transform;