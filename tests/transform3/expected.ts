import { ethers } from "ethers";

const web3Provider = new ethers.BrowserProvider(window.ethereum);
const jsonRpcProvider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/key");
const wsProvider = new ethers.WebSocketProvider("wss://mainnet.infura.io/ws/v3/key");
