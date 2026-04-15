import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const utilsMap: Record<string, string> = {
  formatEther: "formatEther",
  parseEther: "parseEther",
  formatUnits: "formatUnits",
  parseUnits: "parseUnits",
  formatBytes32String: "encodeBytes32String",
  parseBytes32String: "decodeBytes32String",
  hexDataSlice: "dataSlice",
  hexZeroPad: "zeroPadValue",
  hexValue: "toQuantity",
  arrayify: "getBytes",
  solidityPack: "solidityPacked",
  soliditySha256: "solidityPackedSha256",
  keccak256: "keccak256",
  sha256: "sha256",
  ripemd160: "ripemd160",
  toUtf8Bytes: "toUtf8Bytes",
  toUtf8String: "toUtf8String",
  solidityKeccak256: "solidityPackedKeccak256",
};

const constantsMap: Record<string, string> = {
  AddressZero: "ZeroAddress",
  HashZero: "ZeroHash",
};

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  for (const [oldName, newName] of Object.entries(utilsMap)) {
    const nodes = root.root().findAll({
      rule: { pattern: `ethers.utils.${oldName}($$$ARGS)` },
    });
    for (const node of nodes) {
      const args = node.getMatch("ARGS")?.text() ?? "";
      newSource = newSource.replace(node.text(), `ethers.${newName}(${args})`);
    }
  }

  for (const [oldName, newName] of Object.entries(constantsMap)) {
    const nodes = root.root().findAll({
      rule: { pattern: `ethers.constants.${oldName}` },
    });
    for (const node of nodes) {
      newSource = newSource.replace(node.text(), `ethers.${newName}`);
    }
  }

  return newSource !== source ? newSource : null;
};

export default transform;