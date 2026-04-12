// 1. Basic ethers import
import { ethers } from 'ethers';
const provider = new ethers.providers.Web3Provider(window.ethereum);

// 2. Providers only import (to be removed)
import { providers as providersOnly } from 'ethers';
console.log(providersOnly.JsonRpcProvider);

// 3. BigNumber only import (to be removed)
import { BigNumber as BigNumberOnly } from 'ethers';
const val = BigNumberOnly.from(100);

// 4. Mixed import (ethers and BigNumber)
import { ethers as eth1, BigNumber as BN1 } from 'ethers';
const b1 = BN1.from(eth1.utils.parseEther("1.0"));

// 5. Mixed import (ethers and providers)
import { ethers as eth2, providers as pvd2 } from 'ethers';
const p2 = new pvd2.JsonRpcProvider();

// 6. CommonJS ethers require
const { ethers: ethCJS } = require('ethers');
const balance = ethCJS.utils.formatEther("1000");

// 7. CommonJS BigNumber require (to be removed)
const { BigNumber: BNCJS } = require('ethers');
console.log(BNCJS.from(50));

// 8. CommonJS mixed require
const { ethers: ethMixed, BigNumber: BNMixed } = require('ethers');
const result = BNMixed.from(ethMixed.utils.parseEther("2.0"));
