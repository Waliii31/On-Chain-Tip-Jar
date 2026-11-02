import React from "react";
import { terminalAudio } from "../utils/audio";

interface TerminalFooterProps {
  contractAddress: string;
}

export const TerminalFooter: React.FC<TerminalFooterProps> = ({ contractAddress }) => {
  const scanUrl = `https://scan.botchain.ai/address/${contractAddress}`;
  const shortAddress = `${contractAddress.slice(0, 8)}...${contractAddress.slice(-6)}`;

  return (
    <footer className="mt-12 mb-20 border-t-2 border-[var(--term-dim)] pt-6 font-mono text-xs">
      <div className="term-box-dim p-4 bg-black space-y-4">
        {/* Terminal Header Bar */}
        <div className="term-header-dim text-xs font-bold">
          <span>[SYSTEM_METADATA // BOT CHAIN MAINNET GOVERNANCE & TELEMETRY]</span>
          <span className="text-[11px] dim-text">KERNEL_HASH: 0x677_BOT_PROD</span>
        </div>

        {/* 3 Core Required Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Link 1: Twitter / X */}
          <a
            href="https://x.com/site_proof__"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => terminalAudio.playKeyTick()}
            className="term-box-dim p-3 block hover:border-[var(--term-color)] hover:bg-[var(--term-bg-dim)] transition-colors group"
          >
            <div className="dim-text text-[11px] mb-1">X_COMMUNITY // TWITTER</div>
            <div className="font-bold text-sm text-[var(--term-color)] group-hover:underline flex items-center justify-between">
              <span>𝕏 @site_proof__</span>
              <span className="text-[10px] dim-text">[EXTERNAL_LINK ↗]</span>
            </div>
            <div className="text-[10px] dim-text mt-1">https://x.com/site_proof__</div>
          </a>

          {/* Link 2: Powered by Botchain */}
          <a
            href="https://botchain.ai"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => terminalAudio.playKeyTick()}
            className="term-box-dim p-3 block hover:border-[var(--term-color)] hover:bg-[var(--term-bg-dim)] transition-colors group"
          >
            <div className="dim-text text-[11px] mb-1">NETWORK_INFRASTRUCTURE</div>
            <div className="font-bold text-sm text-[var(--term-color)] group-hover:underline flex items-center justify-between">
              <span>POWERED BY BOTCHAIN</span>
              <span className="text-[10px] dim-text">[BOTCHAIN.AI ↗]</span>
            </div>
            <div className="text-[10px] dim-text mt-1">Autonomous Agent Layer (Chain ID: 677)</div>
          </a>

          {/* Link 3: Contract Address on Botchain Scan */}
          <a
            href={scanUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => terminalAudio.playKeyTick()}
            className="term-box-dim p-3 block hover:border-[var(--term-color)] hover:bg-[var(--term-bg-dim)] transition-colors group"
          >
            <div className="dim-text text-[11px] mb-1">BLOCK_EXPLORER_VERIFICATION</div>
            <div className="font-bold text-sm text-[var(--term-color)] group-hover:underline flex items-center justify-between">
              <span>SCAN CONTRACT ({shortAddress})</span>
              <span className="text-[10px] dim-text">[SCAN.BOTCHAIN.AI ↗]</span>
            </div>
            <div className="text-[10px] dim-text mt-1 truncate">{scanUrl}</div>
          </a>
        </div>

        {/* Network Spec Console Line */}
        <div className="border-t border-dashed border-[var(--term-dim)] pt-3 text-[11px] space-y-1">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="dim-text">TARGET_NETWORK:</span>
            <span className="font-bold">BOT Chain Mainnet (Chain ID: 677 // Currency: BOT)</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="dim-text">RPC_ENDPOINT:</span>
            <span>https://rpc.botchain.ai</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
            <span className="dim-text">OFFICIAL_EXPLORER:</span>
            <span>https://scan.botchain.ai</span>
          </div>
        </div>

        {/* Copyright & Terminal Prompt Outro */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] dim-text pt-2 border-t border-[var(--term-dim)]">
          <span className="select-none">
            bot@tipjar:~$ cat /dev/banner &gt; &quot;Built for Autonomous On-Chain Micro-Tipping&quot;
          </span>
          <span>© 2026 ON-CHAIN TIP JAR // POWERED BY BOTCHAIN</span>
        </div>
      </div>
    </footer>
  );
};
