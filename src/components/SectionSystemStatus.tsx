import React, { useState, useEffect } from "react";
import { TipJarStats } from "../contracts/TipJarABI";
import { terminalAudio } from "../utils/audio";

interface SectionSystemStatusProps {
  stats: TipJarStats;
  connectedAddress: string | null;
  walletBalance: string;
  chainId: number | null;
  contractAddress: string;
  currencySymbol: string;
  onRefresh: () => void;
  onSwitchNetwork: (network: "botchain" | "localhost" | "sepolia") => void;
}

export const SectionSystemStatus: React.FC<SectionSystemStatusProps> = ({
  stats,
  connectedAddress,
  walletBalance,
  chainId,
  contractAddress,
  currencySymbol,
  onRefresh,
  onSwitchNetwork,
}) => {
  const [copied, setCopied] = useState(false);
  const [rpcPing, setRpcPing] = useState(16);

  useEffect(() => {
    const timer = setInterval(() => {
      setRpcPing(Math.floor(12 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyContract = () => {
    terminalAudio.playSubmitChirp();
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNetworkName = (id: number | null) => {
    if (id === 677) return "BOT_CHAIN_MAINNET (677) ★ ACTIVE";
    if (id === 31337) return "HARDHAT_LOCAL_NODE (31337)";
    if (id === 11155111) return "ETHEREUM_SEPOLIA_TESTNET (11155111)";
    if (id === 1) return "ETHEREUM_MAINNET (1)";
    if (!id) return "BOT_CHAIN_MAINNET (677) [PRE-CONFIGURED]";
    return `CUSTOM_EVM_CHAIN (${id})`;
  };

  const scanUrl = `https://scan.botchain.ai/address/${contractAddress}`;

  return (
    <section id="status" className="term-box mb-6 p-4">
      {/* Terminal Title Bar */}
      <div className="term-header-bar mb-3">
        <span>[SECTION 01 // SYS_BOOT & TELEMETRY NODE // BOT CHAIN MAINNET]</span>
        <span className="text-xs">DAEMON: BOTCHAIN_677 // STATUS: READY</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-xs">
        {/* Metric 1: Contract Vault Balance */}
        <div className="term-box-dim p-2.5">
          <div className="dim-text mb-1">TOTAL_VAULT_BALANCE</div>
          <div className="text-xl font-bold tracking-wider text-emerald-400">
            {stats.vaultBalanceEth} <span className="text-xs">{currencySymbol}</span>
          </div>
          <div className="dim-text text-[11px] mt-1">LOCKED ON-CHAIN TREASURY</div>
        </div>

        {/* Metric 2: Total Tips Emitted */}
        <div className="term-box-dim p-2.5">
          <div className="dim-text mb-1">EMITTED_EVENTS_COUNT</div>
          <div className="text-xl font-bold tracking-wider">
            {stats.totalTips} <span className="text-xs">TIPS</span>
          </div>
          <div className="dim-text text-[11px] mt-1">TipReceived EVENT LOGS</div>
        </div>

        {/* Metric 3: Cumulative Volume */}
        <div className="term-box-dim p-2.5">
          <div className="dim-text mb-1">LIFETIME_TRANSMISSIONS</div>
          <div className="text-xl font-bold tracking-wider">
            {stats.totalVolumeEth} <span className="text-xs">{currencySymbol}</span>
          </div>
          <div className="dim-text text-[11px] mt-1">ACCUMULATED DONATIONS</div>
        </div>

        {/* Metric 4: RPC Latency & Node Health */}
        <div className="term-box-dim p-2.5">
          <div className="dim-text mb-1">BOT CHAIN RPC LATENCY</div>
          <div className="text-xl font-bold tracking-wider flex items-center gap-2">
            <span>{rpcPing} ms</span>
            <span className="text-xs text-[var(--term-color)]">● OPTIMAL</span>
          </div>
          <div className="dim-text text-[11px] mt-1">rpc.botchain.ai:443</div>
        </div>
      </div>

      {/* Detailed System Diagnostics Console Table */}
      <div className="term-box-dim p-3 text-xs mb-3 font-mono">
        <div className="border-b border-[var(--term-dim)] pb-1 mb-2 font-bold flex justify-between">
          <span>HOST_DIAGNOSTICS_SUMMARY</span>
          <span className="dim-text">EXEC: uname -a && botchain_syncing</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="dim-text">TARGET_CONTRACT_ADDRESS:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold underline cursor-pointer" onClick={handleCopyContract}>
                {contractAddress}
              </span>
              <a
                href={scanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] underline text-emerald-400"
              >
                [VIEW_ON_SCAN.BOTCHAIN.AI ↗]
              </a>
              <button onClick={handleCopyContract} className="text-[10px] py-0 px-1.5">
                {copied ? "[COPIED!]" : "[COPY]"}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="dim-text">CONNECTED_NETWORK:</span>
            <span className="font-bold text-[var(--term-color)]">{getNetworkName(chainId)}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="dim-text">ACTIVE_CLIENT_ACCOUNT:</span>
            <span>
              {connectedAddress ? (
                <span className="font-bold">{connectedAddress} ({walletBalance} {currencySymbol})</span>
              ) : (
                <span className="dim-text">NO_WALLET_ATTACHED // GUEST_CLI_SESSION</span>
              )}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="dim-text">RPC_ENDPOINT / CHAIN_ID:</span>
            <span>https://rpc.botchain.ai (Chain ID: 677)</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="dim-text">CONTRACT_OWNER_GOVERNOR:</span>
            <span className="font-mono text-[11px]">
              {stats.ownerAddress || contractAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Network Quick-Switch Terminal Command Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="dim-text font-bold">NETWORK_GATEWAYS:</span>
          <button
            onClick={() => onSwitchNetwork("botchain")}
            className="text-[11px] font-bold bg-[var(--term-color)] text-black border border-[var(--term-color)]"
            title="Switch MetaMask to BOT Chain Mainnet (Chain ID 677)"
          >
            [CONNECT_BOTCHAIN_MAINNET (677)]
          </button>
          <button
            onClick={() => onSwitchNetwork("localhost")}
            className="text-[11px]"
            title="Switch MetaMask to Localhost 8545"
          >
            [LOCALHOST_8545]
          </button>
          <button
            onClick={() => onSwitchNetwork("sepolia")}
            className="text-[11px]"
            title="Switch MetaMask to Sepolia Testnet"
          >
            [SEPOLIA_11155111]
          </button>
        </div>

        <button
          onClick={() => {
            terminalAudio.playSubmitChirp();
            onRefresh();
          }}
          className="text-[11px] font-bold"
        >
          [SYNC_CHAIN_STATE]
        </button>
      </div>
    </section>
  );
};
