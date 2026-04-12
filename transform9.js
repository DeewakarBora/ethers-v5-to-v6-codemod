module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  const deprecatedImports = ['BigNumber', 'providers'];

  // 1. Handle ES6 Imports: `import { ... } from 'ethers'`
  root
    .find(j.ImportDeclaration, {
      source: { value: 'ethers' },
    })
    .forEach((path) => {
      const { specifiers } = path.node;
      if (!specifiers) return;

      const newSpecifiers = specifiers.filter((spec) => {
        if (spec.type === 'ImportSpecifier') {
          return !deprecatedImports.includes(spec.imported.name);
        }
        return true;
      });

      if (newSpecifiers.length === 0) {
        // Remove the entire import if no specifiers remain
        j(path).remove();
        dirtyFlag = true;
      } else if (newSpecifiers.length !== specifiers.length) {
        // Update the import if some specifiers were removed
        path.node.specifiers = newSpecifiers;
        dirtyFlag = true;
      }
    });

  // 2. Handle CommonJS Requires: `const { ... } = require('ethers')`
  root
    .find(j.VariableDeclaration)
    .filter((path) => {
      // Look for `require('ethers')` anywhere in the declaration
      return path.node.declarations.some((decl) => {
        return (
          decl.init &&
          decl.init.type === 'CallExpression' &&
          decl.init.callee.name === 'require' &&
          decl.init.arguments.length > 0 &&
          decl.init.arguments[0].value === 'ethers'
        );
      });
    })
    .forEach((path) => {
      const { declarations } = path.node;
      
      const newDeclarations = declarations.filter((decl) => {
        // Check if this specific declarator is a require('ethers')
        const isEthersRequire = (
          decl.init &&
          decl.init.type === 'CallExpression' &&
          decl.init.callee.name === 'require' &&
          decl.init.arguments.length > 0 &&
          decl.init.arguments[0].value === 'ethers'
        );

        if (!isEthersRequire) return true;

        // If it's a destructuring assignment: `const { BigNumber } = require('ethers')`
        if (decl.id.type === 'ObjectPattern') {
          const newProperties = decl.id.properties.filter((prop) => {
            if (prop.type === 'Property' && prop.key.type === 'Identifier') {
              return !deprecatedImports.includes(prop.key.name);
            }
            return true;
          });

          if (newProperties.length === 0) {
            // This specific require has no members left
            return false;
          } else if (newProperties.length !== decl.id.properties.length) {
            decl.id.properties = newProperties;
            dirtyFlag = true;
            return true;
          }
        }
        
        return true;
      });

      if (newDeclarations.length === 0) {
        // Remove the entire variable declaration if no declarators remain
        j(path).remove();
        dirtyFlag = true;
      } else if (newDeclarations.length !== declarations.length) {
        path.node.declarations = newDeclarations;
        dirtyFlag = true;
      }
    });

  return dirtyFlag ? root.toSource() : null;
};
