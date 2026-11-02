import React, { useState, useEffect, useCallback } from "react";
import { TerminalHeader } from "./components/TerminalHeader";
import { SectionSystemStatus } from "./components/SectionSystemStatus";
import { SectionTipDispatch } from "./components/SectionTipDispatch";
import { SectionEventStream } from "./components/SectionEventStream";
import { SectionMemoVault } from "./components/SectionMemoVault";
import { SectionLeaderboard } from "./components/SectionLeaderboard";
import { SectionContractSpecs } from "./components/SectionContractSpecs";
import { TerminalFooter } from "./components/TerminalFooter";
import { InteractiveCliDrawer } from "./components/InteractiveCliDrawer";
import { MatrixDigitalRain } from "./components/MatrixDigitalRain";
import { ethService, INITIAL_MOCK_TIPS, DEFAULT_CONTRACT_ADDRESS } from "./utils/ethereum";
import { OnChainTip, TipJarStats } from "./contracts/TipJarABI";
import contractConfig from "./contract-config.json";
import { ethers } from "ethers";

export function App() {
  const [theme, setTheme] = useState<"amber" | "green">("amber");
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showMatrixRain, setShowMatrixRain] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("status");

  // Wallet & Blockchain State (Configured for BOT Chain Mainnet)
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0.0000");
  const [chainId, setChainId] = useState<number | null>(677); // Default to BOT Chain
  const [contractAddress, setContractAddress] = useState<string>(
    contractConfig.address || DEFAULT_CONTRACT_ADDRESS
  );

  // Currency Symbol (Defaults to BOT for BOT Chain Mainnet)
  const currencySymbol = chainId === 11155111 || chainId === 1 ? "ETH" : "BOT";

  // Tips & Stats
  const [tips, setTips] = useState<OnChainTip[]>(INITIAL_MOCK_TIPS);
  const [stats, setStats] = useState<TipJarStats>({
    totalTips: INITIAL_MOCK_TIPS.length,
    totalVolumeEth: INITIAL_MOCK_TIPS.reduce((acc, t) => acc + parseFloat(t.amount), 0).toFixed(3),
    vaultBalanceEth: "16.500",
    ownerAddress: contractConfig.owner || "0xFD51797C48f75aF10761F92Bdd639e4518358324",
  });

  // Telemetry logs
  const [txLogs, setTxLogs] = useState<string[]>([
    "BOTCHAIN_KERNEL_INITIALIZED: Target Network: BOT Chain Mainnet (Chain ID: 677)",
    `CONTRACT_LOADED: ${contractConfig.address || DEFAULT_CONTRACT_ADDRESS}`,
    "EVENT_SUBSCRIPTION_READY: TipReceived(address,uint256,string,uint256,uint256)"
  ]);
  const [isStreamLive, setIsStreamLive] = useState<boolean>(true);

  // Apply theme to root html element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const addTxLog = (msg: string) => {
    const timestamp = new Date().toISOString().split("T")[1].slice(0, 8);
    setTxLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 20)]);
  };

  // Sync on-chain tips and stats from contract
  const syncContractState = useCallback(async () => {
    try {
      const liveStats = await ethService.fetchStats();
      if (liveStats) {
        setStats(liveStats);
      }

      const liveTips = await ethService.fetchAllTips();
      if (liveTips && liveTips.length > 0) {
        setTips((prev) => {
          const ids = new Set(liveTips.map((t) => t.id));
          const mockNonOverlap = prev.filter((t) => !ids.has(t.id));
          return [...liveTips, ...mockNonOverlap];
        });
      }
    } catch (err) {
      console.warn("Contract sync error:", err);
    }
  }, []);

  // Check initial wallet connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const acc = await ethService.getConnectedAccount();
        if (acc) {
          const res = await ethService.connectWallet();
          setConnectedAddress(res.address);
          setChainId(res.chainId);
          setWalletBalance(res.balanceEth);
          addTxLog(`WALLET_ATTACHED: ${res.address} (Chain ID: ${res.chainId})`);
          await syncContractState();
        }
      } catch (err) {
        console.warn("Initial connect check:", err);
      }
    };
    checkConnection();
  }, [syncContractState]);

  // Connect wallet handler
  const handleConnectWallet = async () => {
    try {
      addTxLog("INITIALIZING_WALLET_HANDSHAKE: Requesting accounts via EIP-1193...");
      const res = await ethService.connectWallet();
      setConnectedAddress(res.address);
      setChainId(res.chainId);
      setWalletBalance(res.balanceEth);
      addTxLog(`SUCCESS_ATTACHED: ${res.address} | BALANCE: ${res.balanceEth} ${res.chainId === 677 ? "BOT" : "ETH"}`);
      await syncContractState();
    } catch (err: any) {
      addTxLog(`ERROR_WALLET_CONNECT: ${err.message || String(err)}`);
      alert(err.message || "Failed to connect wallet.");
    }
  };

  // Disconnect wallet handler
  const handleDisconnectWallet = () => {
    setConnectedAddress(null);
    setWalletBalance("0.0000");
    addTxLog("WALLET_DETACHED: Operating in anonymous guest CLI mode.");
  };

  // Network switcher
  const handleSwitchNetwork = async (net: "botchain" | "localhost" | "sepolia") => {
    try {
      if (net === "botchain") {
        addTxLog("NETWORK_SWITCH: Requesting BOT Chain Mainnet (Chain ID 677)...");
        await ethService.switchToBotchain();
        setChainId(677);
      } else if (net === "localhost") {
        addTxLog("NETWORK_SWITCH: Requesting Hardhat Localhost (Chain ID 31337)...");
        await ethService.switchToHardhatLocal();
        setChainId(31337);
      } else {
        addTxLog("NETWORK_SWITCH: Requesting Sepolia Testnet (Chain ID 11155111)...");
        await ethService.switchToSepolia();
        setChainId(11155111);
      }
      addTxLog(`NETWORK_SWITCHED: Switched to ${net.toUpperCase()}`);
      await syncContractState();
    } catch (err: any) {
      addTxLog(`ERROR_NETWORK_SWITCH: ${err.message || String(err)}`);
    }
  };

  // Send tip handler (Live on-chain or Simulated)
  const handleSendTip = async (
    amountEth: string,
    memo: string,
    isSimulated: boolean
  ): Promise<OnChainTip | null> => {
    addTxLog(`TRANSMIT_REQUEST: ${amountEth} ${currencySymbol} with memo "${memo}" [SIM=${isSimulated}]`);

    if (isSimulated || !connectedAddress) {
      // Create simulated on-chain tip
      const mockTip: OnChainTip = {
        id: `sim-${Date.now()}`,
        tipper: connectedAddress || `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
        amount: parseFloat(amountEth).toFixed(3),
        amountWei: ethers.parseEther(amountEth).toString(),
        memo: memo,
        timestamp: Date.now(),
        blockNumber: 4892040 + Math.floor(Math.random() * 10),
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      };

      setTips((prev) => [mockTip, ...prev]);

      setStats((prev) => {
        const nextVolume = (parseFloat(prev.totalVolumeEth) + parseFloat(amountEth)).toFixed(3);
        const nextBalance = (parseFloat(prev.vaultBalanceEth) + parseFloat(amountEth)).toFixed(3);
        return {
          ...prev,
          totalTips: prev.totalTips + 1,
          totalVolumeEth: nextVolume,
          vaultBalanceEth: nextBalance,
        };
      });

      addTxLog(`[SIMULATION_COMPLETE] Block #${mockTip.blockNumber} mined! Event emitted.`);
      addTxLog(`LOG_EMITTED: TipReceived(tipper: ${mockTip.tipper}, memo: "${memo}")`);
      return mockTip;
    }

    // Direct Live Blockchain execution via MetaMask!
    try {
      const res = await ethService.sendTip(amountEth, memo, (status) => {
        addTxLog(status);
      });

      const liveTip: OnChainTip = {
        id: `onchain-${Date.now()}`,
        tipper: connectedAddress,
        amount: parseFloat(amountEth).toFixed(3),
        amountWei: ethers.parseEther(amountEth).toString(),
        memo: memo,
        timestamp: Date.now(),
        blockNumber: res.blockNumber,
        txHash: res.txHash,
      };

      setTips((prev) => [liveTip, ...prev]);
      await syncContractState();
      return liveTip;
    } catch (err: any) {
      addTxLog(`TRANSMIT_EXCEPTION: ${err.message || String(err)}`);
      throw err;
    }
  };

  // Withdraw funds handler
  const handleWithdraw = async () => {
    addTxLog("WITHDRAW_INVOCATION: Initiating owner treasury sweep on BOT Chain...");
    try {
      if (!connectedAddress) {
        throw new Error("ERR_AUTH: Connect owner wallet first.");
      }
      const txHash = await ethService.withdrawFunds((status) => addTxLog(status));
      addTxLog(`WITHDRAW_SUCCESS: Swept to ${connectedAddress}. TxHash: ${txHash}`);
      setStats((prev) => ({ ...prev, vaultBalanceEth: "0.000" }));
    } catch (err: any) {
      addTxLog(`WITHDRAW_FAILED: ${err.message || String(err)}`);
      throw err;
    }
  };

  // Inject sample mock tip for instant testing
  const handleInjectMockTip = () => {
    const sampleMemos = [
      "Powered by Botchain! Keep autonomous AI agents alive 🤖",
      "root@botchain:~$ Tip transmitted via BOT Chain node 677.",
      "Awesome smart contract architecture on Botchain! ⚡",
      "Terminal aesthetics + Botchain = perfection. 💾",
      "Donation from autonomous agent sub-routine #9 on Botchain.",
      "Verified on scan.botchain.ai. LFG!"
    ];
    const randomMemo = sampleMemos[Math.floor(Math.random() * sampleMemos.length)];
    const randomAmount = (0.5 + Math.random() * 5).toFixed(3);
    handleSendTip(randomAmount, randomMemo, true);
  };

  return (
    <div className={`min-h-screen bg-black text-[var(--term-color)] ${scanlines ? "scanlines" : ""}`}>
      {/* Optional Matrix Digital Rain Background */}
      {showMatrixRain && (
        <MatrixDigitalRain color={theme === "amber" ? "#FFB000" : "#00FF41"} />
      )}

      {/* Main Terminal Container */}
      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-6 pb-48">
        {/* Terminal Header */}
        <TerminalHeader
          theme={theme}
          setTheme={setTheme}
          scanlines={scanlines}
          setScanlines={setScanlines}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          connectedAddress={connectedAddress}
          onConnect={handleConnectWallet}
          onDisconnect={handleDisconnectWallet}
        />

        {/* SECTION 1: System Boot & Node Telemetry (BOT Chain Mainnet) */}
        <SectionSystemStatus
          stats={stats}
          connectedAddress={connectedAddress}
          walletBalance={walletBalance}
          chainId={chainId}
          contractAddress={contractAddress}
          currencySymbol={currencySymbol}
          onRefresh={syncContractState}
          onSwitchNetwork={handleSwitchNetwork}
        />

        {/* SECTION 2: Tip Dispatch Console */}
        <SectionTipDispatch
          onSendTip={handleSendTip}
          connectedAddress={connectedAddress}
          currencySymbol={currencySymbol}
          onConnectWallet={handleConnectWallet}
          txLogs={txLogs}
        />

        {/* SECTION 3: Real-Time Event Log Stream */}
        <SectionEventStream
          tips={tips}
          currencySymbol={currencySymbol}
          isLive={isStreamLive}
          onToggleLive={() => setIsStreamLive(!isStreamLive)}
          onClearLogs={() => setTips([])}
        />

        {/* SECTION 4: Immutable Memo Vault */}
        <SectionMemoVault
          tips={tips}
          currencySymbol={currencySymbol}
          connectedAddress={connectedAddress}
        />

        {/* SECTION 5: Cyber Whale & Patron Leaderboard */}
        <SectionLeaderboard
          tips={tips}
          currencySymbol={currencySymbol}
        />

        {/* SECTION 6: Smart Contract Specifications & Governance */}
        <SectionContractSpecs
          stats={stats}
          currencySymbol={currencySymbol}
          connectedAddress={connectedAddress}
          onWithdraw={handleWithdraw}
          onInjectMockTip={handleInjectMockTip}
          contractAddress={contractAddress}
        />

        {/* FOOTER: Twitter X, Powered by Botchain, Contract Scan */}
        <TerminalFooter contractAddress={contractAddress} />
      </div>

      {/* Interactive Terminal CLI Bottom Shell */}
      <InteractiveCliDrawer
        onSendTip={handleSendTip}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onToggleTheme={(t) => setTheme(t)}
        onToggleSound={(s) => setSoundEnabled(s)}
        onToggleScanlines={(s) => setScanlines(s)}
        onWithdraw={handleWithdraw}
        onInjectMockTip={handleInjectMockTip}
        onSwitchNetwork={handleSwitchNetwork}
        currencySymbol={currencySymbol}
        stats={stats}
        connectedAddress={connectedAddress}
        tips={tips}
        onToggleMatrixRain={() => setShowMatrixRain((prev) => !prev)}
      />
    </div>
  );
}

export default App;
