import React, { useState } from "react";
import { OnChainTip } from "../contracts/TipJarABI";
import { terminalAudio } from "../utils/audio";

interface SectionMemoVaultProps {
  tips: OnChainTip[];
  currencySymbol: string;
  connectedAddress: string | null;
}

export const SectionMemoVault: React.FC<SectionMemoVaultProps> = ({
  tips,
  currencySymbol,
  connectedAddress,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "whales" | "mine">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTips = tips.filter((t) => {
    if (filterMode === "whales") {
      return parseFloat(t.amount) >= 5.0; // 5 BOT threshold for whales
    }
    if (filterMode === "mine") {
      if (!connectedAddress) return false;
      return t.tipper.toLowerCase() === connectedAddress.toLowerCase();
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    terminalAudio.playSubmitChirp();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="vault" className="term-box mb-6 p-4">
      {/* Title Bar */}
      <div className="term-header-bar mb-3">
        <span>[SECTION 04 // THE ON-CHAIN MEMO VAULT // IMMUTABLE BOT CHAIN STORAGE]</span>
        <span className="text-xs">STORAGE: BOT_CHAIN_EVENT_TRIE</span>
      </div>

      <div className="dim-text text-xs mb-3 font-mono">
        EXEC: cat /mnt/vault/memos.db | grep -E &quot;BOT|MEMO&quot;
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              terminalAudio.playKeyTick();
              setFilterMode("all");
            }}
            className={filterMode === "all" ? "bg-[var(--term-color)] text-black font-bold" : ""}
          >
            [ALL_MEMOS ({tips.length})]
          </button>
          <button
            onClick={() => {
              terminalAudio.playKeyTick();
              setFilterMode("whales");
            }}
            className={filterMode === "whales" ? "bg-[var(--term-color)] text-black font-bold" : ""}
          >
            [WHALE_TIPS &ge; 5 {currencySymbol}]
          </button>
          <button
            onClick={() => {
              terminalAudio.playKeyTick();
              setFilterMode("mine");
            }}
            className={filterMode === "mine" ? "bg-[var(--term-color)] text-black font-bold" : ""}
          >
            [MY_TRANSMISSIONS]
          </button>
        </div>

        <div className="dim-text text-xs">
          DECODED_RECORDS: {filteredTips.length}
        </div>
      </div>

      {/* Grid of Memo Vault Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTips.length === 0 ? (
          <div className="col-span-full term-box-dim p-8 text-center text-xs dim-text">
            {filterMode === "mine"
              ? "[NO MEMOS SENT FROM YOUR CURRENT CONNECTED WALLET ADDRESS]"
              : "[NO MEMO RECORDS MATCHING QUERY]"}
          </div>
        ) : (
          filteredTips.map((tip, idx) => {
            const shortTipper = `${tip.tipper.slice(0, 8)}...${tip.tipper.slice(-6)}`;
            const isCopied = copiedId === tip.id;
            const dateStr = new Date(tip.timestamp).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={tip.id || idx}
                className="term-box-dim p-3 bg-black hover:border-[var(--term-color)] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top card metadata */}
                  <div className="flex items-center justify-between border-b border-[var(--term-dim)] pb-2 mb-2 text-xs">
                    <span className="font-bold">
                      RECORD #{String(idx + 1).padStart(3, "0")}
                    </span>
                    <span className="bg-[var(--term-color)] text-black px-1.5 py-0.5 text-[11px] font-bold">
                      {tip.amount} {currencySymbol}
                    </span>
                  </div>

                  {/* Memo Message Body */}
                  <div className="text-sm font-mono my-2 break-words text-[var(--term-color)] leading-relaxed">
                    &ldquo;{tip.memo}&rdquo;
                  </div>
                </div>

                {/* Footer metadata & buttons */}
                <div className="mt-3 pt-2 border-t border-[var(--term-dim)] text-[11px] space-y-1 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="dim-text">SENDER:</span>
                    <a
                      href={`https://scan.botchain.ai/address/${tip.tipper}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline hover:text-[var(--term-color)]"
                    >
                      {shortTipper}
                    </a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="dim-text">BLOCK_TIME:</span>
                    <span className="dim-text">{dateStr}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="dim-text">BLOCK #{tip.blockNumber}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopy(tip.memo, tip.id)}
                        className="text-[10px] px-1 py-0"
                      >
                        {isCopied ? "[COPIED!]" : "[COPY_MEMO]"}
                      </button>
                      {tip.txHash && (
                        <a
                          href={`https://scan.botchain.ai/tx/${tip.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] px-1 py-0 border border-[var(--term-dim)] hover:border-[var(--term-color)]"
                        >
                          [SCAN ↗]
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
