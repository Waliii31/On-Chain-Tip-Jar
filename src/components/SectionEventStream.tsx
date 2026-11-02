import React, { useState } from "react";
import { OnChainTip } from "../contracts/TipJarABI";
import { terminalAudio } from "../utils/audio";

interface SectionEventStreamProps {
  tips: OnChainTip[];
  currencySymbol: string;
  isLive: boolean;
  onToggleLive: () => void;
  onClearLogs: () => void;
}

export const SectionEventStream: React.FC<SectionEventStreamProps> = ({
  tips,
  currencySymbol,
  isLive,
  onToggleLive,
  onClearLogs,
}) => {
  const [grepQuery, setGrepQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTip, setSelectedTip] = useState<OnChainTip | null>(null);

  const filteredTips = tips.filter((t) => {
    if (!grepQuery) return true;
    const q = grepQuery.toLowerCase();
    return (
      t.memo.toLowerCase().includes(q) ||
      t.tipper.toLowerCase().includes(q) ||
      t.amount.includes(q) ||
      (t.txHash && t.txHash.toLowerCase().includes(q))
    );
  });

  const handleExport = () => {
    terminalAudio.playSubmitChirp();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tips, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TipReceived_events_botchain_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <section id="events" className="term-box mb-6 p-4">
      {/* Title Bar */}
      <div className="term-header-bar mb-3">
        <span>[SECTION 03 // REAL-TIME ON-CHAIN EVENT STREAM // BOT CHAIN]</span>
        <div className="flex items-center gap-2 text-xs">
          <span className={isLive ? "animate-pulse font-bold" : "text-red-500"}>
            ● {isLive ? "STREAM_ACTIVE" : "STREAM_PAUSED"}
          </span>
          <span className="hidden sm:inline">FD: /dev/events/TipReceived</span>
        </div>
      </div>

      <div className="dim-text text-xs mb-3 font-mono">
        COMMAND: tail -f --lines=50 /var/log/TipJar_botchain.log | grep --line-buffered
      </div>

      {/* Terminal Grep Search Prompt */}
      <div className="term-box-dim p-2 mb-3 flex items-center text-xs font-mono">
        <span className="text-[var(--term-color)] font-bold mr-2 select-none">
          operator@grep:~$ grep -i
        </span>
        <input
          type="text"
          value={grepQuery}
          onChange={(e) => {
            terminalAudio.playKeyTick();
            setGrepQuery(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="filter by address, memo keyword, block number..."
          className="w-full text-xs"
        />
        {isFocused && <span className="block-cursor" />}
        {grepQuery && (
          <button
            onClick={() => {
              terminalAudio.playKeyTick();
              setGrepQuery("");
            }}
            className="text-[10px] ml-2 px-1 py-0"
          >
            [RESET]
          </button>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
        <div className="flex items-center gap-2">
          <button onClick={onToggleLive} className="text-xs">
            {isLive ? "[PAUSE_STREAM]" : "[RESUME_STREAM]"}
          </button>
          <button onClick={onClearLogs} className="text-xs">
            [CLEAR_BUFFER]
          </button>
          <button onClick={handleExport} className="text-xs">
            [EXPORT_JSON]
          </button>
        </div>

        <div className="dim-text text-xs">
          BUFFER_COUNT: {filteredTips.length} / {tips.length} EVENTS
        </div>
      </div>

      {/* Live Stream Terminal Screen */}
      <div className="term-box-dim bg-black p-3 font-mono text-xs max-h-72 overflow-y-auto space-y-2">
        {filteredTips.length === 0 ? (
          <div className="dim-text italic text-center py-6">
            [NO_MATCHING_EVENT_LOGS_FOUND_IN_STREAM]
          </div>
        ) : (
          filteredTips.map((tip, idx) => {
            const formattedTime = new Date(tip.timestamp).toISOString().replace("T", " ").replace("Z", " UTC");
            const shortTipper = `${tip.tipper.slice(0, 6)}...${tip.tipper.slice(-4)}`;
            const isSelected = selectedTip?.id === tip.id;

            return (
              <div
                key={tip.id || idx}
                onClick={() => {
                  terminalAudio.playKeyTick();
                  setSelectedTip(isSelected ? null : tip);
                }}
                className={`p-2 border transition-colors cursor-pointer ${
                  isSelected
                    ? "border-[var(--term-color)] bg-[var(--term-bg-dim)]"
                    : "border-transparent hover:border-[var(--term-dim)]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] mb-1">
                  <span className="dim-text">[{formattedTime}]</span>
                  <span className="bg-[var(--term-color)] text-black px-1 font-bold">
                    BLOCK #{tip.blockNumber}
                  </span>
                  <span className="font-bold underline text-[var(--term-color)]">
                    FROM: {shortTipper}
                  </span>
                  <span className="text-emerald-400 font-bold ml-auto">
                    +{tip.amount} {currencySymbol}
                  </span>
                </div>

                {/* Event Memo */}
                <div className="pl-3 border-l-2 border-[var(--term-color)] my-1">
                  <span className="dim-text font-bold">EVENT_LOG_MEMO: </span>
                  <span className="font-bold">&ldquo;{tip.memo}&rdquo;</span>
                </div>

                {/* Expanded Details when clicked */}
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-dashed border-[var(--term-dim)] text-[11px] space-y-1">
                    <div>
                      <span className="dim-text">TX_HASH: </span>
                      {tip.txHash && tip.txHash.startsWith("0x") && tip.txHash.length === 66 ? (
                        <a
                          href={`https://scan.botchain.ai/tx/${tip.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all underline text-emerald-400 hover:text-emerald-300"
                        >
                          {tip.txHash} [EXPLORER ↗]
                        </a>
                      ) : (
                        <span className="break-all">{tip.txHash || "0x_LOCAL_MINED_EVENT"}</span>
                      )}
                    </div>
                    <div>
                      <span className="dim-text">EVENT_SIGNATURE: </span>
                      <span>TipReceived(address indexed tipper, uint256 amount, string memo, uint256 timestamp, uint256 indexed tipId)</span>
                    </div>
                    <div>
                      <span className="dim-text">RAW_AMOUNT_WEI: </span>
                      <span>{tip.amountWei} WEI</span>
                    </div>
                    <div>
                      <span className="dim-text">FULL_SENDER_ADDR: </span>
                      <a
                        href={`https://scan.botchain.ai/address/${tip.tipper}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {tip.tipper} [SCAN ↗]
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
