module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Mapping of ethers v5 utils function/property names to their v6 equivalents
  const utilsMap = {
    // Ether formatting
    formatEther: 'formatEther',
    parseEther: 'parseEther',
    formatUnits: 'formatUnits',
    parseUnits: 'parseUnits',
    // Bytes32 string encoding (renamed in v6)
    formatBytes32String: 'encodeBytes32String',
    parseBytes32String: 'decodeBytes32String',
    // Hex utilities (renamed in v6)
    hexDataSlice: 'dataSlice',
    hexZeroPad: 'zeroPadValue',
    hexValue: 'toQuantity',
    // Byte array utilities (renamed in v6)
    arrayify: 'getBytes',
    // Solidity packing (renamed in v6)
    solidityPack: 'solidityPacked',
    soliditySha256: 'solidityPackedSha256',
  };

  // Mapping of ethers v5 constants to their v6 named equivalents
  const constantsMap = {
    AddressZero: 'ZeroAddress',
    HashZero: 'ZeroHash',
  };

  // ─── 1. ethers.utils.* → ethers.* ────────────────────────────────────────
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

  // ─── 2. ethers.constants.* → ethers.* ────────────────────────────────────
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
          name: 'constants',
        },
      },
    })
    .filter((path) => {
      return Object.prototype.hasOwnProperty.call(constantsMap, path.node.property.name);
    })
    .replaceWith((path) => {
      const newName = constantsMap[path.node.property.name];
      dirtyFlag = true;
      return j.memberExpression(
        j.identifier('ethers'),
        j.identifier(newName)
      );
    });

  // Return the transformed source if changes were made; otherwise, return null to skip
  return dirtyFlag ? root.toSource() : null;
};
