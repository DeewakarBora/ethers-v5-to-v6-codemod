import { ethers, BigNumber, providers } from 'ethers';

/**
 * test-input.ts
 * A realistic TypeScript DeFi utility file using ethers v5.
 */

export class DeFiService {
  private provider: providers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    // 1. providers.JsonRpcProvider
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  // 2. Type annotations like BigNumber and providers.Web3Provider
  async connect(browserProvider: providers.Web3Provider): Promise<string> {
    const signer = browserProvider.getSigner();
    return await signer.getAddress();
  }

  // 3. ethers.utils.formatEther and ethers.utils.parseEther
  public formatEth(wei: BigNumber): string {
    return ethers.utils.formatEther(wei);
  }

  public parseEth(eth: string): BigNumber {
    return ethers.utils.parseEther(eth);
  }

  // 4. BigNumber.from("1000") with TypeScript types
  public getTenPercent(value: BigNumber): BigNumber {
    const ten: BigNumber = BigNumber.from("10");
    const hundred: BigNumber = BigNumber.from("100");
    return value.mul(ten).div(hundred);
  }

  // 5. contract.callStatic.someFunction()
  async checkLiquidity(contract: ethers.Contract, user: string): Promise<BigNumber> {
    try {
      // simulate a call with callStatic
      const balance: BigNumber = await contract.callStatic.balanceOf(user);
      return balance;
    } catch (e) {
      console.error("Call static failed", e);
      return BigNumber.from(0);
    }
  }

  // 6. ethers.constants.AddressZero
  public isZeroAddress(address: string): boolean {
    return address === ethers.constants.AddressZero;
  }

  // 7. ethers.utils.keccak256
  public hashString(input: string): string {
    const bytes = ethers.utils.toUtf8Bytes(input);
    return ethers.utils.keccak256(bytes);
  }

  // 8. Complex flow with nesting
  async executeComplexOp(contract: ethers.Contract, amount: string) {
    const weiAmount: BigNumber = this.parseEth(amount);
    const fee: BigNumber = weiAmount.mul(BigNumber.from("3")).div(BigNumber.from("1000")); // 0.3% fee
    
    // contract.callStatic check then send
    if (await contract.callStatic.canProcess(weiAmount)) {
       console.log("Processing hash:", this.hashString(amount));
       return fee;
    }
    return BigNumber.from(0);
  }
}
