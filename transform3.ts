import type { Transform } from "codemod:ast-grep";
import type JS from "codemod:ast-grep/langs/js";

const providerMap: Record<string, string> = {
  Web3Provider: "BrowserProvider",
  JsonRpcProvider: "JsonRpcProvider",
  StaticJsonRpcProvider: "JsonRpcProvider",
  WebSocketProvider: "WebSocketProvider",
  InfuraProvider: "InfuraProvider",
};

const transform: Transform<JS> = (root) => {
  const source = root.root().text();
  let newSource = source;

  for (const [oldName, newName] of Object.entries(providerMap)) {
    const nodes = root.root().findAll({
      rule: { pattern: `ethers.providers.${oldName}` },
    });
    for (const node of nodes) {
      newSource = newSource.replace(node.text(), `ethers.${newName}`);
    }
  }

  return newSource !== source ? newSource : null;
};

export default transform;