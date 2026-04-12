module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Maps the v5 "namespace" (middle segment) to the v6 method name (tail segment)
  //
  // v5 pattern:  X . <namespace> . Y (args)
  // v6 pattern:  X . Y . <v6Method> (args)
  const namespaceToV6Method = {
    estimateGas:         'estimateGas',         // name stays, position changes
    populateTransaction: 'populateTransaction', // name stays, position changes
    functions:           'staticCallResult',    // renamed in v6
  };

  // Find all call expressions matching: X.<namespace>.Y(args)
  //
  // AST shape:
  //   CallExpression {
  //     callee: MemberExpression {         <── X.<namespace>.Y
  //       object: MemberExpression {       <── X.<namespace>
  //         object: X,
  //         property: <namespace>
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
          },
        },
      },
    })
    .filter((path) => {
      // Only match the three known namespace names
      const namespace = path.node.callee.object.property.name;
      return Object.prototype.hasOwnProperty.call(namespaceToV6Method, namespace);
    })
    .replaceWith((path) => {
      const callExpr    = path.node;
      const callee      = callExpr.callee;           // X.<namespace>.Y
      const X           = callee.object.object;       // X (contract object)
      const Y           = callee.property;            // Y (method name node)
      const namespace   = callee.object.property.name;
      const v6Method    = namespaceToV6Method[namespace];

      dirtyFlag = true;

      // Build: X.Y.<v6Method>(args)
      return j.callExpression(
        j.memberExpression(
          j.memberExpression(X, Y),         // X.Y
          j.identifier(v6Method)            // .<v6Method>
        ),
        callExpr.arguments
      );
    });

  return dirtyFlag ? root.toSource() : null;
};
