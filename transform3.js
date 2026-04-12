module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Mapping of ethers v5 provider names under `ethers.providers.*` to their v6 equivalents
  const providerMap = {
    Web3Provider: 'BrowserProvider',
    JsonRpcProvider: 'JsonRpcProvider',
    StaticJsonRpcProvider: 'JsonRpcProvider', // Merged into JsonRpcProvider in v6
    WebSocketProvider: 'WebSocketProvider',
    InfuraProvider: 'InfuraProvider',
  };

  // Find all MemberExpressions matching `ethers.providers.<ProviderName>`
  root
    .find(j.MemberExpression, {
      object: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: 'ethers',
        },
        property: {
          type: 'Identifier',
          name: 'providers',
        },
      },
    })
    .filter((path) => {
      // Only process known provider names
      const providerName = path.node.property.name;
      return Object.prototype.hasOwnProperty.call(providerMap, providerName);
    })
    .replaceWith((path) => {
      const oldName = path.node.property.name;
      const newName = providerMap[oldName];
      dirtyFlag = true;

      // Replace `ethers.providers.<OldProvider>` with `ethers.<NewProvider>`
      return j.memberExpression(
        j.identifier('ethers'),
        j.identifier(newName)
      );
    });

  return dirtyFlag ? root.toSource() : null;
};
