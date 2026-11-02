import { ethers } from "ethers";
import { TIP_JAR_ABI, OnChainTip, TipJarStats } from "../contracts/TipJarABI";
import contractConfig from "../contract-config.json";

// Default contract address from config (Mainnet: 0xFD51797C48f75aF10761F92Bdd639e4518358324)
export const DEFAULT_CONTRACT_ADDRESS = contractConfig.address || "0xFD51797C48f75aF10761F92Bdd639e4518358324";
export const BOTCHAIN_RPC_URL = contractConfig.rpcUrl || "https://rpc.botchain.ai";
export const BOTCHAIN_CHAIN_ID = contractConfig.chainId || 677;

// Initial seed mock tips for instant offline/demo immersion
export const INITIAL_MOCK_TIPS: OnChainTip[] = [
  {
    id: "tip-001",
    tipper: "0x71C841920B2F2A2dE1624c88e91B33d3C873B001",
    amount: "5.000",
    amountWei: ethers.parseEther("5").toString(),
    memo: "root@sec:~$ Hack the planet! Keep the open-source pipeline alive on BOT Chain.",
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    blockNumber: 4892011,
    txHash: "0x8f2d91a7e2b1029487c699042bbf89849202390a78912ef093847291a094bb1a"
  },
  {
    id: "tip-002",
    tipper: "0x3A042B0294BBe346292b00E88c3F8582C9914f6e",
    amount: "1.000",
    amountWei: ethers.parseEther("1").toString(),
    memo: "Coffee supply chain replenished. Excellent terminal aesthetics on Botchain.",
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hrs ago
    blockNumber: 4891965,
    txHash: "0x34c7b889028eef911049581938abce19405820491039841829481940abbca192"
  },
  {
    id: "tip-003",
    tipper: "0x992B1049eFa9810848039d9182390fFe910488d1",
    amount: "10.000",
    amountWei: ethers.parseEther("10").toString(),
    memo: "Cyber Whale node check-in. Autonomous agent smart contracts are the future.",
    timestamp: Date.now() - 1000 * 60 * 360, // 6 hrs ago
    blockNumber: 4891780,
    txHash: "0xbc89401928091189384019284091823094810294810928410294801928401928"
  },
  {
    id: "tip-004",
    tipper: "0x12a0B89120894C298eF092841028309128038910",
    amount: "0.500",
    amountWei: ethers.parseEther("0.5").toString(),
    memo: "cat /dev/urandom > /dev/tipjar. Powered by Botchain autonomous network.",
    timestamp: Date.now() - 1000 * 60 * 900,
    blockNumber: 4891402,
    txHash: "0x7129840192840918204918204918204918204918204918204918204918204918"
  }
];

export class EthereumService {
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string = DEFAULT_CONTRACT_ADDRESS;

  constructor() {
    this.contractAddress = DEFAULT_CONTRACT_ADDRESS;
  }

  public setContractAddress(addr: string) {
    if (ethers.isAddress(addr)) {
      this.contractAddress = addr;
      this.contract = null;
    }
  }

  public getContractAddress(): string {
    return this.contractAddress;
  }

  // Check if browser has an injected Ethereum provider (MetaMask, Rabby, Brave, etc.)
  public hasInjectedProvider(): boolean {
    return typeof window !== "undefined" && typeof (window as unknown as { ethereum?: unknown }).ethereum !== "undefined";
  }

  // Get a fallback read-only JSON-RPC provider (targeting BOT Chain Mainnet)
  private getFallbackProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(BOTCHAIN_RPC_URL);
  }

  // Connect wallet
  public async connectWallet(): Promise<{ address: string; chainId: number; balanceEth: string }> {
    if (!this.hasInjectedProvider()) {
      throw new Error("ERR_NO_WEB3_PROVIDER: MetaMask or injected wallet not detected in browser.");
    }

    const ethereum = (window as unknown as { ethereum: ethers.Eip1193Provider }).ethereum;
    this.provider = new ethers.BrowserProvider(ethereum);
    
    // Request accounts
    const accounts = await ethereum.request({ method: "eth_requestAccounts" }) as string[];
    if (!accounts || accounts.length === 0) {
      throw new Error("ERR_USER_REJECTED: No account authorized by user.");
    }

    this.signer = await this.provider.getSigner();
    const address = await this.signer.getAddress();
    const network = await this.provider.getNetwork();
    const balanceWei = await this.provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);

    this.contract = new ethers.Contract(this.contractAddress, TIP_JAR_ABI, this.signer);

    return {
      address,
      chainId: Number(network.chainId),
      balanceEth: parseFloat(balanceEth).toFixed(4)
    };
  }

  // Get current account if already connected
  public async getConnectedAccount(): Promise<string | null> {
    if (!this.hasInjectedProvider()) return null;
    try {
      const ethereum = (window as unknown as { ethereum: ethers.Eip1193Provider }).ethereum;
      const accounts = await ethereum.request({ method: "eth_accounts" }) as string[];
      if (accounts && accounts.length > 0) {
        this.provider = new ethers.BrowserProvider(ethereum);
        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(this.contractAddress, TIP_JAR_ABI, this.signer);
        return accounts[0];
      }
    } catch {
      return null;
    }
    return null;
  }

  // Fetch contract statistics
  public async fetchStats(): Promise<TipJarStats | null> {
    try {
      let contractToRead = this.contract;
      if (!contractToRead) {
        if (this.hasInjectedProvider()) {
          const ethereum = (window as unknown as { ethereum: ethers.Eip1193Provider }).ethereum;
          const readProvider = new ethers.BrowserProvider(ethereum);
          contractToRead = new ethers.Contract(this.contractAddress, TIP_JAR_ABI, readProvider);
        } else {
          // Use BOT Chain Mainnet fallback provider
          const readProvider = this.getFallbackProvider();
          contractToRead = new ethers.Contract(this.contractAddress, TIP_JAR_ABI, readProvider);
        }
      }

      const [totalTips, totalVolumeWei, balanceWei, owner] = await contractToRead.getStats();
      return {
        totalTips: Number(totalTips),
        totalVolumeEth: ethers.formatEther(totalVolumeWei),
        vaultBalanceEth: ethers.formatEther(balanceWei),
        ownerAddress: owner
      };
    } catch (err) {
      // Contract may not be deployed at this address yet on this specific network
      return null;
    }
  }

  // Fetch all tips from contract
  public async fetchAllTips(): Promise<OnChainTip[]> {
    try {
      let contractToRead = this.contract;
      if (!contractToRead) {
        if (this.hasInjectedProvider()) {
          const ethereum = (window as unknown as { ethereum: ethers.Eip1193Provider }).ethereum;
          const readProvider = new ethers.BrowserProvider(ethereum);
          contractToRead = new ethers.Contract(this.contractAddress, TIP_JAR_ABI, readProvider);
        } else {
          const readProvider = this.getFallbackProvider();
          contractToRead = new ethers.Contract(this.contractAddress, TIP_JAR_ABI, readProvider);
        }
      }

      const rawTips = await contractToRead.getAllTips();
      const tips: OnChainTip[] = rawTips.map((tip: any, index: number) => ({
        id: `onchain-${index}-${tip.timestamp}`,
        tipper: tip.tipper,
        amount: ethers.formatEther(tip.amount),
        amountWei: tip.amount.toString(),
        memo: tip.memo,
        timestamp: Number(tip.timestamp) * 1000,
        blockNumber: Number(tip.blockNumber)
      }));
      // Return reverse chronological (newest first)
      return tips.reverse();
    } catch (err) {
      return [];
    }
  }

  // Send tip transaction
  public async sendTip(
    amountEth: string,
    memo: string,
    onStatusUpdate?: (status: string) => void
  ): Promise<{ txHash: string; blockNumber: number; tipId?: number }> {
    if (!this.signer) {
      await this.connectWallet();
    }
    if (!this.signer) {
      throw new Error("ERR_NO_SIGNER: Please connect your MetaMask wallet first.");
    }

    const contractWithSigner = new ethers.Contract(this.contractAddress, TIP_JAR_ABI, this.signer);
    const valueWei = ethers.parseEther(amountEth);

    onStatusUpdate?.("[TX_STEP_1/4] Preparing payload and verifying gas estimates...");
    
    // Estimate gas
    let gasLimit = 300000n;
    try {
      const estimated = await contractWithSigner.sendTip.estimateGas(memo, { value: valueWei });
      gasLimit = (estimated * 120n) / 100n; // 20% buffer
    } catch {
      // Fallback gas limit
    }

    onStatusUpdate?.("[TX_STEP_2/4] Awaiting cryptographic signature in MetaMask...");
    const tx = await contractWithSigner.sendTip(memo, {
      value: valueWei,
      gasLimit
    });

    onStatusUpdate?.(`[TX_STEP_3/4] Broadcasted to mempool: ${tx.hash}. Awaiting block inclusion...`);
    const receipt = await tx.wait(1);

    onStatusUpdate?.(`[TX_STEP_4/4] Block #${receipt.blockNumber} mined! Event 'TipReceived' confirmed.`);

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  }

  // Owner withdraw funds
  public async withdrawFunds(onStatusUpdate?: (status: string) => void): Promise<string> {
    if (!this.signer) {
      throw new Error("ERR_NO_SIGNER: Connect wallet to perform withdrawal.");
    }

    const contractWithSigner = new ethers.Contract(this.contractAddress, TIP_JAR_ABI, this.signer);
    onStatusUpdate?.("[WITHDRAW] Requesting withdrawal signature in MetaMask...");

    const tx = await contractWithSigner.withdraw();
    onStatusUpdate?.(`[WITHDRAW] Mining withdrawal tx: ${tx.hash}...`);
    const receipt = await tx.wait(1);
    onStatusUpdate?.(`[WITHDRAW] Vault balance swept to owner wallet!`);
    return receipt.hash;
  }

  // Switch to BOT Chain Mainnet (ChainID 677 = 0x2a5)
  public async switchToBotchain(): Promise<void> {
    if (!this.hasInjectedProvider()) return;
    const ethereum = (window as unknown as { ethereum: any }).ethereum;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2a5" }], // 677 in hex
      });
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x2a5",
              chainName: "BOT Chain Mainnet",
              rpcUrls: ["https://rpc.botchain.ai"],
              nativeCurrency: {
                name: "BOT",
                symbol: "BOT",
                decimals: 18,
              },
              blockExplorerUrls: ["https://scan.botchain.ai"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Switch to Localhost Hardhat Network (ChainID 31337)
  public async switchToHardhatLocal(): Promise<void> {
    if (!this.hasInjectedProvider()) return;
    const ethereum = (window as unknown as { ethereum: any }).ethereum;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7a69" }], // 31337 in hex
      });
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x7a69",
              chainName: "Hardhat Localhost 8545",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "Ethereum",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Switch to Sepolia Testnet (ChainID 11155111 = 0xaa36a7)
  public async switchToSepolia(): Promise<void> {
    if (!this.hasInjectedProvider()) return;
    const ethereum = (window as unknown as { ethereum: any }).ethereum;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Test Network",
              rpcUrls: ["https://rpc.sepolia.org"],
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }
}

export const ethService = new EthereumService();
