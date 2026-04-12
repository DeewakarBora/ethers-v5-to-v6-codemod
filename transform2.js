/**
 * transform2.js (v2 — smarter BigNumber detection)
 *
 * Phase 1: Collect variable names that are provably assigned a BigNumber value.
 * Phase 2: Replace BigNumber.from() → BigInt() (always safe).
 * Phase 3: Replace .add/.sub/.mul/.div/.eq ONLY when the receiver is:
 *   - A direct BigNumber.from() / BigInt() call (just converted in phase 2)
 *   - A variable name collected in phase 1
 *
 * Leaves ambiguous cases (e.g. arr.add(), str.eq()) completely untouched.
 */

module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  const methodToOperator = {
    add: '+',
    sub: '-',
    mul: '*',
    div: '/',
    eq: '===',
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────

  // Returns true if node is a `BigNumber.from(...)` or `ethers.BigNumber.from(...)` call
  function isBigNumberFromCall(node) {
    if (!node || node.type !== 'CallExpression') return false;
    const { callee } = node;

    // BigNumber.from(...)
    if (
      callee.type === 'MemberExpression' &&
      callee.object.type === 'Identifier' &&
      callee.object.name === 'BigNumber' &&
      callee.property.name === 'from'
    ) return true;

    // ethers.BigNumber.from(...)
    if (
      callee.type === 'MemberExpression' &&
      callee.object.type === 'MemberExpression' &&
      callee.object.object.type === 'Identifier' &&
      callee.object.object.name === 'ethers' &&
      callee.object.property.name === 'BigNumber' &&
      callee.property.name === 'from'
    ) return true;

    return false;
  }

  // Returns true if node is a `BigInt(...)` call
  // (used to detect values already converted by phase 2 in the same pass)
  function isBigIntCall(node) {
    return (
      node &&
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'BigInt'
    );
  }

  // ─── Phase 1: Collect variables provably assigned a BigNumber ─────────────
  const bigNumberVars = new Set();

  // `const a = BigNumber.from(...)` or `const a = ethers.BigNumber.from(...)`
  root.find(j.VariableDeclarator).forEach((path) => {
    if (
      path.node.id.type === 'Identifier' &&
      isBigNumberFromCall(path.node.init)
    ) {
      bigNumberVars.add(path.node.id.name);
    }
  });

  // `a = BigNumber.from(...)` (assignment expression)
  root.find(j.AssignmentExpression).forEach((path) => {
    if (
      path.node.left.type === 'Identifier' &&
      isBigNumberFromCall(path.node.right)
    ) {
      bigNumberVars.add(path.node.left.name);
    }
  });

  // ─── Phase 2: BigNumber.from(...) → BigInt(...) ───────────────────────────
  root
    .find(j.CallExpression)
    .filter((path) => isBigNumberFromCall(path.node))
    .replaceWith((path) => {
      dirtyFlag = true;
      return j.callExpression(j.identifier('BigInt'), path.node.arguments);
    });

  // ─── Phase 3: Arithmetic methods — only on confirmed BigNumber receivers ──
  function isConfirmedBigNumber(node) {
    if (!node) return false;
    // Already converted in phase 2: BigInt(...)
    if (isBigIntCall(node)) return true;
    // Known variable assigned a BigNumber value
    if (node.type === 'Identifier' && bigNumberVars.has(node.name)) return true;
    return false;
  }

  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: { type: 'Identifier' },
      },
    })
    .filter((path) => {
      const methodName = path.node.callee.property.name;
      if (!Object.prototype.hasOwnProperty.call(methodToOperator, methodName)) return false;
      return isConfirmedBigNumber(path.node.callee.object);
    })
    .replaceWith((path) => {
      const methodName = path.node.callee.property.name;
      const operator = methodToOperator[methodName];
      const left = path.node.callee.object;
      const right = path.node.arguments[0];
      if (!right) return path.node; // safety guard
      dirtyFlag = true;
      return j.binaryExpression(operator, left, right);
    });

  return dirtyFlag ? root.toSource() : null;
};
