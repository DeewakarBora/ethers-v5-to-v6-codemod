/**
 * recipe.js
 * Combines all 9 ethers.js v5 → v6 codemods into a single sequential pipeline.
 * Each transform's output is passed as the input to the next.
 * Returns null if no changes were made across any of the transforms.
 */

const transform1 = require('./transform');
const transform2 = require('./transform2');
const transform3 = require('./transform3');
const transform4 = require('./transform4');
const transform5 = require('./transform5');
const transform6 = require('./transform6');
const transform7 = require('./transform7');
const transform8 = require('./transform8');
const transform9 = require('./transform9');
const transform10 = require('./transform10');
const transform11 = require('./transform11');
const transform12 = require('./transform12');




const transforms = [
  { name: 'transform1 (formatEther/parseEther)',     fn: transform1 },
  { name: 'transform2 (BigNumber → BigInt)',          fn: transform2 },
  { name: 'transform3 (providers migration)',         fn: transform3 },
  { name: 'transform4 (crypto utils)',               fn: transform4 },
  { name: 'transform5 (callStatic → staticCall)',    fn: transform5 },
  { name: 'transform6 (contract.address → .target)', fn: transform6 },
  { name: 'transform7 (broadcastTransaction)',       fn: transform7 },
  { name: 'transform8 (Signature utils)',            fn: transform8 },
  { name: 'transform9 (import cleanup)',             fn: transform9 },
  { name: 'transform10 (gas price + hex utils)',     fn: transform10 },
  { name: 'transform11 (estimateGas + populateTransaction + functions)', fn: transform11 },
  { name: 'transform12 (@ethersproject imports)', fn: transform12 },
];




module.exports = function transform(file, api) {
  let currentSource = file.source;
  let anyChanged = false;

  for (const { name, fn } of transforms) {
    // Build a synthetic `file` object with the latest source
    const currentFile = {
      ...file,
      source: currentSource,
    };

    try {
      const result = fn(currentFile, api);

      // If the transform returned a new string, use it as the next input
      if (result != null && result !== currentSource) {
        currentSource = result;
        anyChanged = true;
        console.log(`[recipe] Applied: ${name}`);
      }
    } catch (err) {
      console.error(`[recipe] Error in ${name}:`, err.message);
    }
  }

  // Return null if nothing changed, otherwise return the final transformed source
  return anyChanged ? currentSource : null;
};
