import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  // splitSignature(sig) → ethers.Signature.from(sig)
  const splitNodes = root.root().findAll({
    rule: { pattern: "ethers.utils.splitSignature($ARG)" },
  });
  for (const node of splitNodes) {
    const arg = node.getMatch("ARG")?.text() ?? "";
    newSource = newSource.replace(node.text(), `ethers.Signature.from(${arg})`);
  }

  // joinSignature(sig) → ethers.Signature.from(sig).serialized
  const joinNodes = root.root().findAll({
    rule: { pattern: "ethers.utils.joinSignature($ARG)" },
  });
  for (const node of joinNodes) {
    const arg = node.getMatch("ARG")?.text() ?? "";
    newSource = newSource.replace(
      node.text(),
      `ethers.Signature.from(${arg}).serialized`
    );
  }

  // verifyMessage → ethers.verifyMessage
  const verifyNodes = root.root().findAll({
    rule: { pattern: "ethers.utils.verifyMessage($$$ARGS)" },
  });
  for (const node of verifyNodes) {
    const args = node.getMatch("ARGS")?.text() ?? "";
    newSource = newSource.replace(node.text(), `ethers.verifyMessage(${args})`);
  }

  // recoverAddress → ethers.recoverAddress
  const recoverNodes = root.root().findAll({
    rule: { pattern: "ethers.utils.recoverAddress($$$ARGS)" },
  });
  for (const node of recoverNodes) {
    const args = node.getMatch("ARGS")?.text() ?? "";
    newSource = newSource.replace(node.text(), `ethers.recoverAddress(${args})`);
  }

  return newSource !== source ? newSource : null;
};

export default transform;