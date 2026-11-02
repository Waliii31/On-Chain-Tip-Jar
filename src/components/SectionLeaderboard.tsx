import React from "react";
import { OnChainTip } from "../contracts/TipJarABI";
import { terminalAudio } from "../utils/audio";

interface SectionLeaderboardProps {
  tips: OnChainTip[];
  currencySymbol: string;
}

interface TipperStats {
  address: string;
  totalEth: number;
  tipCount: number;
  lastTipTimestamp: number;
}

export const SectionLeaderboard: React.FC<SectionLeaderboardProps> = ({ tips, currencySymbol }) => {
  // Aggregate tips by tipper
  const tipperMap: { [key: string]: TipperStats } = {};
  let totalAggEth = 0;

  tips.forEach((t) => {
    const addr = t.tipper.toLowerCase();
    const eth = parseFloat(t.amount) || 0;
    totalAggEth += eth;

    if (!tipperMap[addr]) {
      tipperMap[addr] = {
        address: t.tipper,
        totalEth: eth,
        tipCount: 1,
        lastTipTimestamp: t.timestamp,
      };
    } else {
      tipperMap[addr].totalEth += eth;
      tipperMap[addr].tipCount += 1;
      if (t.timestamp > tipperMap[addr].lastTipTimestamp) {
        tipperMap[addr].lastTipTimestamp = t.timestamp;
      }
    }
  });

  const sortedTippers = Object.values(tipperMap).sort((a, b) => b.totalEth - a.totalEth);

  const getTier = (rank: number) => {
    switch (rank) {
      case 0:
        return "[APEX_BOTCHAIN_WHALE]";
      case 1:
        return "[SYS_NODE_OPERATOR]";
      case 2:
        return "[CIPHERPUNK_ELITE]";
      case 3:
        return "[CODE_PATRON]";
      default:
        return "[AUTONOMOUS_RUNNER]";
    }
  };

  return (
    <section id="whales" className="term-box mb-6 p-4">
      {/* Title Bar */}
      <div className="term-header-bar mb-3">
        <span>[SECTION 05 // CYBER WHALE & PATRON LEADERBOARD // BOT CHAIN]</span>
        <span className="text-xs">PROCESS_TABLE: /usr/bin/top-tippers</span>
      </div>

      <div className="dim-text text-xs mb-3 font-mono">
        EXEC: ps aux --sort=-%bot | head -n 15
      </div>

      <div className="overflow-x-auto term-box-dim bg-black p-2 font-mono text-xs">
        <table className="mono-table">
          <thead>
            <tr>
              <th>RANK</th>
              <th>TIER_BADGE</th>
              <th>ACCOUNT_ADDRESS</th>
              <th>CUMULATIVE_{currencySymbol}</th>
              <th>TRANSACTIONS</th>
              <th>POOL_SHARE</th>
            </tr>
          </thead>
          <tbody>
            {sortedTippers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center dim-text py-6">
                  [NO_TIPPERS_LOGGED_YET]
                </td>
              </tr>
            ) : (
              sortedTippers.map((t, idx) => {
                const shortAddr = `${t.address.slice(0, 8)}...${t.address.slice(-6)}`;
                const sharePercent =
                  totalAggEth > 0 ? ((t.totalEth / totalAggEth) * 100).toFixed(1) : "0.0";
                const isWhale = idx === 0;

                return (
                  <tr
                    key={t.address}
                    onClick={() => {
                      terminalAudio.playSubmitChirp();
                      navigator.clipboard.writeText(t.address);
                    }}
                    className="cursor-pointer"
                    title="Click to copy full address"
                  >
                    <td className="font-bold">
                      #{String(idx + 1).padStart(2, "0")}
                      {isWhale && " ★"}
                    </td>
                    <td className="text-[11px] font-bold text-[var(--term-color)]">
                      {getTier(idx)}
                    </td>
                    <td className="font-mono">
                      <a
                        href={`https://scan.botchain.ai/address/${t.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-[var(--term-color)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {shortAddr}
                      </a>
                    </td>
                    <td className="font-bold text-emerald-400">
                      {t.totalEth.toFixed(4)} {currencySymbol}
                    </td>
                    <td>{t.tipCount} TX{t.tipCount > 1 ? "s" : ""}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span>{sharePercent}%</span>
                        <div className="hidden sm:block w-16 bg-gray-900 h-1.5 border border-[var(--term-dim)]">
                          <div
                            className="bg-[var(--term-color)] h-full"
                            style={{ width: `${Math.min(100, parseFloat(sharePercent))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex justify-between items-center text-xs dim-text">
        <span>* RANKINGS COMPUTED LIVE FROM DECODED ON-CHAIN EVENT LOGS</span>
        <span>CLICK ROW TO COPY ADDRESS</span>
      </div>
    </section>
  );
};
