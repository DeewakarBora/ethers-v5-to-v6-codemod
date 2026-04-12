module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Match CallExpressions of the shape: X.callStatic.Y(args)
  // AST structure:
  //   CallExpression {
  //     callee: MemberExpression {          <-- X.callStatic.Y
  //       object: MemberExpression {        <-- X.callStatic
  //         object: X,
  //         property: "callStatic"
  //       },
  //       property: Y
  //     },
  //     arguments: [args]
  //   }
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'MemberExpression',
          property: {
            type: 'Identifier',
            name: 'callStatic',
          },
        },
      },
    })
    .replaceWith((path) => {
      const callExpr = path.node;
      // X.callStatic.Y  =>  callee
      const callee = callExpr.callee;
      // X  =>  callee.object.object
      const contractObject = callee.object.object;
      // Y  =>  callee.property
      const methodName = callee.property;

      dirtyFlag = true;

      // Build: X.Y.staticCall(args)
      return j.callExpression(
        j.memberExpression(
          j.memberExpression(contractObject, methodName),
          j.identifier('staticCall')
        ),
        callExpr.arguments
      );
    });

  return dirtyFlag ? root.toSource() : null;
};
