import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const hexMap: Record<string, string> = {
  hexlify: "hexlify",
  hexStripZeros: "stripZerosLeft",
  isHexString: "isHexString",
  getAddress: "getAddress",
  isAddress: "isAddress",
};

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  // provider.getGasPrice() → (await provider.getFeeData()).gasPrice
  const gasPriceNodes = root.root().findAll({
    rule: { pattern: "await $PROVIDER.getGasPrice()" },
  });
  for (const node of gasPriceNodes) {
    const provider = node.getMatch("PROVIDER")?.text() ?? "";
    newSource = newSource.replace(
      node.text(),
      `(await ${provider}.getFeeData()).gasPrice`
    );
  }

  // ethers.utils.hex/address utils → ethers.*
  for (const [oldName, newName] of Object.entries(hexMap)) {
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