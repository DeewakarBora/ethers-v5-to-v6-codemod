import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const cryptoMap: Record<string, string> = {
  keccak256: "keccak256",
  solidityKeccak256: "solidityPackedKeccak256",
  sha256: "sha256",
  ripemd160: "ripemd160",
  toUtf8Bytes: "toUtf8Bytes",
  toUtf8String: "toUtf8String",
};

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  for (const [oldName, newName] of Object.entries(cryptoMap)) {
    const nodes = root.root().findAll({
      rule: { pattern: `ethers.utils.${oldName}($$$ARGS)` },
    });
    for (const node of nodes) {
      const args = node.getMatch("ARGS")?.text() ?? "";
      newSource = newSource.replace(node.text(), `ethers.${newName}(${args})`);
    }
  }

  return newSource !== source ? newSource : null;
};

export default transform;