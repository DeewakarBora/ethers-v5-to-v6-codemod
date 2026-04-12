module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Configuration for each @ethersproject/* sub-package:
  //   source: always 'ethers' for v6
  //   removeSpecifiers: imported names to drop entirely (e.g. BigNumber → native BigInt)
  //   renameMap: { oldImportedName: newImportedName } — the local alias is preserved
  //              so existing usage in the file continues to work
  const packageConfig = {
    '@ethersproject/bignumber': {
      removeSpecifiers: ['BigNumber'],  // replaced by native BigInt
      renameMap: {},
    },
    '@ethersproject/units': {
      removeSpecifiers: [],
      renameMap: {},
    },
    '@ethersproject/providers': {
      removeSpecifiers: [],
      renameMap: {},
    },
    '@ethersproject/solidity': {
      removeSpecifiers: [],
      // Renamed in v6 — use alias so local call sites still compile
      renameMap: {
        keccak256: 'solidityPackedKeccak256',
        sha256:    'solidityPackedSha256',
      },
    },
    '@ethersproject/keccak256': {
      removeSpecifiers: [],
      renameMap: {},
    },
    '@ethersproject/strings': {
      removeSpecifiers: [],
      renameMap: {},
    },
    '@ethersproject/address': {
      removeSpecifiers: [],
      renameMap: {},
    },
    '@ethersproject/contracts': {
      removeSpecifiers: [],
      renameMap: {},
    },
    '@ethersproject/hash': {
      removeSpecifiers: [],
      renameMap: { hashMessage: 'hashMessage' },
    },
    '@ethersproject/bytes': {
      removeSpecifiers: [],
      renameMap: {
        arrayify: 'getBytes',
        hexlify:  'hexlify',
        hexZeroPad: 'zeroPadValue',
      },
    },
  };

  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      const pkg = path.node.source.value;
      // Only handle @ethersproject/* packages we have config for
      return (
        typeof pkg === 'string' &&
        pkg.startsWith('@ethersproject/') &&
        Object.prototype.hasOwnProperty.call(packageConfig, pkg)
      );
    })
    .forEach((path) => {
      const pkg = path.node.source.value;
      const config = packageConfig[pkg];
      const { removeSpecifiers, renameMap } = config;

      // Step 1: Filter out specifiers that should be removed entirely
      let specifiers = path.node.specifiers.filter((spec) => {
        if (spec.type !== 'ImportSpecifier') return true;
        return !removeSpecifiers.includes(spec.imported.name);
      });

      // Step 2: Apply renames — preserve the local alias so call sites still work
      specifiers = specifiers.map((spec) => {
        if (spec.type !== 'ImportSpecifier') return spec;
        const importedName = spec.imported.name;
        const newImportedName = renameMap[importedName];

        if (!newImportedName || newImportedName === importedName) return spec;

        // Build: { newImportedName as localName }
        const localName = spec.local.name; // original local usage (may equal importedName)
        return j.importSpecifier(
          j.identifier(newImportedName),
          j.identifier(localName)
        );
      });

      dirtyFlag = true;

      // Step 3: If no specifiers remain, remove the entire import declaration
      if (specifiers.length === 0) {
        j(path).remove();
        return;
      }

      // Step 4: Update specifiers and redirect source to 'ethers'
      path.node.specifiers = specifiers;
      path.node.source = j.stringLiteral('ethers');
    });

  return dirtyFlag ? root.toSource() : null;
};
