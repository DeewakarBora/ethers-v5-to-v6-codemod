module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // ─── Helper: build `ethers.Transaction` MemberExpression ─────────────────
  function ethersTransaction() {
    return j.memberExpression(
      j.identifier('ethers'),
      j.identifier('Transaction')
    );
  }

  // ─── 1. provider.sendTransaction(signedTx) → provider.broadcastTransaction(signedTx)
  //        ONLY when the first argument is NOT a plain object literal `{}`
  // ─────────────────────────────────────────────────────────────────────────
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: {
          type: 'Identifier',
          name: 'sendTransaction',
        },
      },
    })
    .filter((path) => {
      const firstArg = path.node.arguments[0];
      // Skip if no argument or if the argument is a plain object expression
      // e.g. provider.sendTransaction({ to: "...", value: ... }) — leave it alone
      if (!firstArg || firstArg.type === 'ObjectExpression') {
        return false;
      }
      return true;
    })
    .replaceWith((path) => {
      dirtyFlag = true;
      return j.callExpression(
        j.memberExpression(
          path.node.callee.object,       // preserve: provider / signer / etc.
          j.identifier('broadcastTransaction')
        ),
        path.node.arguments
      );
    });

  // ─── 2. ethers.utils.serializeTransaction(tx) → ethers.Transaction.from(tx).serialized
  // ─────────────────────────────────────────────────────────────────────────
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'ethers' },
          property: { type: 'Identifier', name: 'utils' },
        },
        property: {
          type: 'Identifier',
          name: 'serializeTransaction',
        },
      },
    })
    .replaceWith((path) => {
      dirtyFlag = true;
      // ethers.Transaction.from(tx)
      const fromCall = j.callExpression(
        j.memberExpression(ethersTransaction(), j.identifier('from')),
        path.node.arguments
      );
      // ethers.Transaction.from(tx).serialized
      return j.memberExpression(fromCall, j.identifier('serialized'));
    });

  // ─── 3. ethers.utils.parseTransaction(hex) → ethers.Transaction.from(hex)
  // ─────────────────────────────────────────────────────────────────────────
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'ethers' },
          property: { type: 'Identifier', name: 'utils' },
        },
        property: {
          type: 'Identifier',
          name: 'parseTransaction',
        },
      },
    })
    .replaceWith((path) => {
      dirtyFlag = true;
      // ethers.Transaction.from(hex)
      return j.callExpression(
        j.memberExpression(ethersTransaction(), j.identifier('from')),
        path.node.arguments
      );
    });

  return dirtyFlag ? root.toSource() : null;
};
