import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  // provider.sendTransaction(signedTx) → provider.broadcastTransaction(signedTx)
  // Only when argument is NOT an object literal
  const sendTxNodes = root.root().findAll({
    rule: { pattern: "$PROVIDER.sendTransaction($ARG)" },
  });
  for (const node of sendTxNodes) {
    const arg = node.getMatch("ARG")?.text() ?? "";
    if (!arg.startsWith("{")) {
      const provider = node.getMatch("PROVIDER")?.text() ?? "";
      newSource = newSource.replace(
        node.text(),
        `${provider}.broadcastTransaction(${arg})`
      );
    }
  }

  // ethers.utils.serializeTransaction(tx) → ethers.Transaction.from(tx).serialized
  const serializeNodes = root.root().findAll({
    rule: { pattern: "ethers.utils.serializeTransaction($ARG)" },
  });
  for (const node of serializeNodes) {
    const arg = node.getMatch("ARG")?.text() ?? "";
    newSource = newSource.replace(
      node.text(),
      `ethers.Transaction.from(${arg}).serialized`
    );
  }

  // ethers.utils.parseTransaction(hex) → ethers.Transaction.from(hex)
  const parseNodes = root.root().findAll({
    rule: { pattern: "ethers.utils.parseTransaction($ARG)" },
  });
  for (const node of parseNodes) {
    const arg = node.getMatch("ARG")?.text() ?? "";
    newSource = newSource.replace(
      node.text(),
      `ethers.Transaction.from(${arg})`
    );
  }

  return newSource !== source ? newSource : null;
};

export default transform;