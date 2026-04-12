module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Heuristic: Only replace `.address` on identifiers that look like contracts.
  // Matches: `contract`, `myContract`, `tokenContract`, `nftContract`, etc.
  // Does NOT match: `wallet`, `provider`, `signer`, `owner`, etc.
  function looksLikeContract(node) {
    if (node.type !== 'Identifier') return false;
    const name = node.name;
    // Match: exactly "contract", or anything ending in "Contract" or "contract"
    return (
      name === 'contract' ||
      name.endsWith('Contract') ||
      name.endsWith('contract')
    );
  }

  // Find all MemberExpressions where property is `address`
  root
    .find(j.MemberExpression, {
      property: {
        type: 'Identifier',
        name: 'address',
      },
    })
    .filter((path) => {
      // Only transform if the object looks like a contract variable
      return looksLikeContract(path.node.object);
    })
    .replaceWith((path) => {
      dirtyFlag = true;
      // Replace `.address` with `.target`
      return j.memberExpression(
        path.node.object,
        j.identifier('target'),
        path.node.computed // preserve computed access style (e.g. obj["address"])
      );
    });

  return dirtyFlag ? root.toSource() : null;
};
