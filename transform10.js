module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Mapping of ethers.utils.* methods to their v6 equivalents
  const utilsMap = {
    hexlify: 'hexlify',
    hexStripZeros: 'stripZerosLeft',  // renamed in v6
    isHexString: 'isHexString',
    getAddress: 'getAddress',
    isAddress: 'isAddress',
  };

  // ─── 1. await provider.getGasPrice()
  //        → (await provider.getFeeData()).gasPrice
  //
  //  AST in:  AwaitExpression
  //             └── CallExpression
  //                   └── MemberExpression { property: 'getGasPrice' }
  //
  //  AST out: MemberExpression { property: 'gasPrice' }
  //             └── object: AwaitExpression
  //                           └── CallExpression
  //                                 └── MemberExpression { property: 'getFeeData' }
  // ─────────────────────────────────────────────────────────────────────────
  root
    .find(j.AwaitExpression, {
      argument: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: {
            type: 'Identifier',
            name: 'getGasPrice',
          },
        },
      },
    })
    .replaceWith((path) => {
      dirtyFlag = true;
      const providerObject = path.node.argument.callee.object;

      // Build: provider.getFeeData()
      const getFeeDataCall = j.callExpression(
        j.memberExpression(providerObject, j.identifier('getFeeData')),
        []
      );

      // Build: await provider.getFeeData()
      const awaitGetFeeData = j.awaitExpression(getFeeDataCall);

      // Build: (await provider.getFeeData()).gasPrice
      // Recast will add parens automatically when an AwaitExpression is the
      // object of a MemberExpression to preserve correct operator precedence.
      return j.memberExpression(awaitGetFeeData, j.identifier('gasPrice'));
    });

  // ─── 2. ethers.utils.* → ethers.* (hex and address utilities) ────────────
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
      return Object.prototype.hasOwnProperty.call(utilsMap, path.node.property.name);
    })
    .replaceWith((path) => {
      const newName = utilsMap[path.node.property.name];
      dirtyFlag = true;
      return j.memberExpression(
        j.identifier('ethers'),
        j.identifier(newName)
      );
    });

  return dirtyFlag ? root.toSource() : null;
};
