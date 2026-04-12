module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Mapping of ethers v5 utils function names to their v6 equivalents
  const utilsMap = {
    keccak256: 'keccak256',
    solidityKeccak256: 'solidityPackedKeccak256', // Renamed in v6
    sha256: 'sha256',
    ripemd160: 'ripemd160',
    toUtf8Bytes: 'toUtf8Bytes',
    toUtf8String: 'toUtf8String',
  };

  // Find MemberExpressions matching `ethers.utils.<functionName>`
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
          name: 'utils',
        },
      },
    })
    .filter((path) => {
      // Only process known utils function names
      const fnName = path.node.property.name;
      return Object.prototype.hasOwnProperty.call(utilsMap, fnName);
    })
    .replaceWith((path) => {
      const oldName = path.node.property.name;
      const newName = utilsMap[oldName];
      dirtyFlag = true;

      // Replace `ethers.utils.<fn>` with `ethers.<newFn>`
      return j.memberExpression(
        j.identifier('ethers'),
        j.identifier(newName)
      );
    });

  return dirtyFlag ? root.toSource() : null;
};
