const ethers = require('ethers');

// 1. Web3Provider (wraps a browser wallet like MetaMask) → BrowserProvider
const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

// 2. JsonRpcProvider (connect to a JSON-RPC node)
const rpcProvider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_KEY");

// 3. StaticJsonRpcProvider (no network auto-detection, merged into JsonRpcProvider in v6)
const staticProvider = new ethers.providers.StaticJsonRpcProvider("https://rpc.ankr.com/eth");

// 4. WebSocketProvider (for real-time subscriptions)
const wsProvider = new ethers.providers.WebSocketProvider("wss://mainnet.infura.io/ws/v3/YOUR_KEY");

// 5. InfuraProvider (convenience provider for Infura)
const infuraProvider = new ethers.providers.InfuraProvider("mainnet", "YOUR_INFURA_KEY");

// 6. Provider used as a function argument
async function getSigner(windowEth) {
  const provider = new ethers.providers.Web3Provider(windowEth);
  return provider.getSigner();
}

// 7. Provider stored in an object
const config = {
  provider: new ethers.providers.JsonRpcProvider("https://rpc.example.com"),
  wsProvider: new ethers.providers.WebSocketProvider("wss://rpc.example.com"),
};
