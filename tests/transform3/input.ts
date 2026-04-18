import { ethers } from "ethers";

const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
const jsonRpcProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/key");
const wsProvider = new ethers.providers.WebSocketProvider("wss://mainnet.infura.io/ws/v3/key");
