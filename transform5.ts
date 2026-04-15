import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  // contract.callStatic.foo(args) → contract.foo.staticCall(args)
  const nodes = root.root().findAll({
    rule: { pattern: "$CONTRACT.callStatic.$METHOD($$$ARGS)" },
  });

  for (const node of nodes) {
    const contract = node.getMatch("CONTRACT")?.text() ?? "";
    const method = node.getMatch("METHOD")?.text() ?? "";
    const args = node.getMatch("ARGS")?.text() ?? "";
    newSource = newSource.replace(
      node.text(),
      `${contract}.${method}.staticCall(${args})`
    );
  }

  return newSource !== source ? newSource : null;
};

export default transform;