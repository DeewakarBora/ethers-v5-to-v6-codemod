module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // ─── Helper: build `ethers.Signature` MemberExpression ───────────────────
  function ethersSignature() {
    return j.memberExpression(
      j.identifier('ethers'),
      j.identifier('Signature')
    );
  }

  // ─── Helper: match a call to `ethers.utils.<methodName>` ─────────────────
  function isEthersUtilsCall(path, methodName) {
    const callee = path.node.callee;
    return (
      callee.type === 'MemberExpression' &&
      callee.object.type === 'MemberExpression' &&
      callee.object.object.type === 'Identifier' &&
      callee.object.object.name === 'ethers' &&
      callee.object.property.type === 'Identifier' &&
      callee.object.property.name === 'utils' &&
      callee.property.type === 'Identifier' &&
      callee.property.name === methodName
    );
  }

  // ─── 1. ethers.utils.splitSignature(sig) → ethers.Signature.from(sig) ────
  root
    .find(j.CallExpression)
    .filter((path) => isEthersUtilsCall(path, 'splitSignature'))
    .replaceWith((path) => {
      dirtyFlag = true;
      return j.callExpression(
        j.memberExpression(ethersSignature(), j.identifier('from')),
        path.node.arguments
      );
    });

  // ─── 2. ethers.utils.joinSignature(sig) → ethers.Signature.from(sig).serialized
  root
    .find(j.CallExpression)
    .filter((path) => isEthersUtilsCall(path, 'joinSignature'))
    .replaceWith((path) => {
      dirtyFlag = true;
      // Build: ethers.Signature.from(sig)
      const fromCall = j.callExpression(
        j.memberExpression(ethersSignature(), j.identifier('from')),
        path.node.arguments
      );
      // Wrap: ethers.Signature.from(sig).serialized
      return j.memberExpression(fromCall, j.identifier('serialized'));
    });

  // ─── 3. ethers.utils.verifyMessage(msg, sig) → ethers.verifyMessage(msg, sig)
  root
    .find(j.CallExpression)
    .filter((path) => isEthersUtilsCall(path, 'verifyMessage'))
    .replaceWith((path) => {
      dirtyFlag = true;
      return j.callExpression(
        j.memberExpression(j.identifier('ethers'), j.identifier('verifyMessage')),
        path.node.arguments
      );
    });

  // ─── 4. ethers.utils.recoverAddress(digest, sig) → ethers.recoverAddress(digest, sig)
  root
    .find(j.CallExpression)
    .filter((path) => isEthersUtilsCall(path, 'recoverAddress'))
    .replaceWith((path) => {
      dirtyFlag = true;
      return j.callExpression(
        j.memberExpression(j.identifier('ethers'), j.identifier('recoverAddress')),
        path.node.arguments
      );
    });

  return dirtyFlag ? root.toSource() : null;
};
