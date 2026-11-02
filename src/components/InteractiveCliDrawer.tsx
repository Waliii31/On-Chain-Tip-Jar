import React, { useState, useRef, useEffect } from "react";
import { terminalAudio } from "../utils/audio";
import { OnChainTip, TipJarStats } from "../contracts/TipJarABI";

interface InteractiveCliDrawerProps {
  onSendTip: (amountEth: string, memo: string, isSimulated: boolean) => Promise<OnChainTip | null>;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onToggleTheme: (t: "amber" | "green") => void;
  onToggleSound: (s: boolean) => void;
  onToggleScanlines: (s: boolean) => void;
  onWithdraw: () => Promise<void>;
  onInjectMockTip: () => void;
  onSwitchNetwork: (network: "botchain" | "localhost" | "sepolia") => void;
  currencySymbol: string;
  stats: TipJarStats;
  connectedAddress: string | null;
  tips: OnChainTip[];
  onToggleMatrixRain?: () => void;
}

interface CommandLine {
  type: "input" | "output" | "error" | "success";
  text: string;
}

export const InteractiveCliDrawer: React.FC<InteractiveCliDrawerProps> = ({
  onSendTip,
  onConnectWallet,
  onDisconnectWallet,
  onToggleTheme,
  onToggleSound,
  onToggleScanlines,
  onWithdraw,
  onInjectMockTip,
  onSwitchNetwork,
  currencySymbol,
  stats,
  connectedAddress,
  tips,
  onToggleMatrixRain,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<CommandLine[]>([
    { type: "output", text: "BOT CHAIN KERNEL v1.0.4 READY (CHAIN ID: 677). Type 'help' for command manual." },
    { type: "output", text: `Try: tip 1.0 "Keep building autonomous agents!" or use interactive buttons above.` }
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const handleCommand = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    terminalAudio.playSubmitChirp();
    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const newHistory: CommandLine[] = [
      ...history,
      { type: "input", text: `user@botchain:~$ ${trimmed}` }
    ];

    const tokens = trimmed.split(" ");
    const cmd = tokens[0].toLowerCase();
    const args = tokens.slice(1);

    switch (cmd) {
      case "help":
        newHistory.push({
          type: "output",
          text: `AVAILABLE TERMINAL COMMANDS:
  help                     - Show this command reference
  tip <amount> <"memo">    - Transmit native ${currencySymbol} tip on-chain (e.g., tip 1.0 "Awesome dApp!")
  connect                  - Connect MetaMask wallet
  disconnect               - Disconnect connected wallet
  botchain                 - Switch MetaMask to BOT Chain Mainnet (Chain ID 677)
  status                   - Display current contract vault balance & node telemetry
  events                   - Display recent on-chain TipReceived logs
  theme <amber|green>      - Switch CRT phosphor palette
  sound <on|off>           - Enable/disable 8-bit sound effects
  scanlines <on|off>       - Toggle CRT cathode scanline overlay
  withdraw                 - Sweeps vault balance to contract owner wallet
  demo                     - Inject a simulated sample tip
  matrix                   - Toggle background Matrix digital rain
  clear                    - Clear terminal screen buffer`
        });
        break;

      case "botchain":
        newHistory.push({ type: "output", text: "Switching network to BOT Chain Mainnet (Chain ID 677)..." });
        onSwitchNetwork("botchain");
        break;

      case "tip": {
        if (args.length < 1) {
          newHistory.push({
            type: "error",
            text: `SYNTAX: tip <amount_${currencySymbol}> ["memo text"]\nExample: tip 1.0 "Powered by Botchain!"`
          });
          break;
        }
        const amt = args[0];
        const memoText = args.slice(1).join(" ").replace(/^["']|["']$/g, "") || "CLI Terminal Tip Transmission";

        newHistory.push({
          type: "output",
          text: `[CLI_TX] Preparing tip of ${amt} ${currencySymbol} with memo "${memoText}"...`
        });

        try {
          const res = await onSendTip(amt, memoText, false);
          if (res) {
            newHistory.push({
              type: "success",
              text: `[CLI_TX SUCCESS] Tip confirmed! TxHash: ${res.txHash || "0x_LOCAL_SUCCESS"}`
            });
          }
        } catch (err: any) {
          newHistory.push({
            type: "error",
            text: `[CLI_TX FAILED] ${err.message || String(err)}`
          });
        }
        break;
      }

      case "connect":
        newHistory.push({ type: "output", text: "Requesting MetaMask connection..." });
        onConnectWallet();
        break;

      case "disconnect":
        onDisconnectWallet();
        newHistory.push({ type: "output", text: "Wallet disconnected. Operating in anonymous guest mode." });
        break;

      case "status":
        newHistory.push({
          type: "output",
          text: `VAULT BALANCE: ${stats.vaultBalanceEth} ${currencySymbol} | TOTAL TIPS: ${stats.totalTips} | VOLUME: ${stats.totalVolumeEth} ${currencySymbol}\nCONNECTED WALLET: ${connectedAddress || "NONE"}\nNETWORK: BOT Chain Mainnet (Chain ID 677)`
        });
        break;

      case "events":
        if (tips.length === 0) {
          newHistory.push({ type: "output", text: "No events logged in buffer." });
        } else {
          const recent = tips.slice(0, 3);
          const lines = recent.map(
            (t, i) => `#${i + 1} [${t.amount} ${currencySymbol}] [${t.tipper.slice(0, 8)}...] Memo: "${t.memo}"`
          );
          newHistory.push({ type: "output", text: lines.join("\n") });
        }
        break;

      case "theme": {
        const choice = args[0]?.toLowerCase();
        if (choice === "green" || choice === "matrix") {
          onToggleTheme("green");
          newHistory.push({ type: "output", text: "Theme set to: MATRIX CRT GREEN (#00FF41)" });
        } else if (choice === "amber") {
          onToggleTheme("amber");
          newHistory.push({ type: "output", text: "Theme set to: AMBER VT220 (#FFB000)" });
        } else {
          newHistory.push({ type: "error", text: "Usage: theme amber | theme green" });
        }
        break;
      }

      case "sound": {
        const choice = args[0]?.toLowerCase();
        if (choice === "on") {
          onToggleSound(true);
          newHistory.push({ type: "output", text: "8-bit audio enabled." });
        } else if (choice === "off") {
          onToggleSound(false);
          newHistory.push({ type: "output", text: "Audio muted." });
        } else {
          newHistory.push({ type: "error", text: "Usage: sound on | sound off" });
        }
        break;
      }

      case "scanlines": {
        const choice = args[0]?.toLowerCase();
        if (choice === "on") {
          onToggleScanlines(true);
          newHistory.push({ type: "output", text: "Scanlines enabled." });
        } else if (choice === "off") {
          onToggleScanlines(false);
          newHistory.push({ type: "output", text: "Scanlines disabled." });
        } else {
          newHistory.push({ type: "error", text: "Usage: scanlines on | scanlines off" });
        }
        break;
      }

      case "withdraw":
        newHistory.push({ type: "output", text: "Triggering owner withdraw routine..." });
        try {
          await onWithdraw();
          newHistory.push({ type: "success", text: "Treasury funds swept successfully!" });
        } catch (err: any) {
          newHistory.push({ type: "error", text: err.message || "Withdrawal failed." });
        }
        break;

      case "demo":
        onInjectMockTip();
        newHistory.push({ type: "success", text: "[DEMO] Injected random sample tip and emitted event." });
        break;

      case "matrix":
        if (onToggleMatrixRain) onToggleMatrixRain();
        newHistory.push({ type: "output", text: "Toggled Matrix rain overlay." });
        break;

      case "clear":
        setHistory([]);
        setInputVal("");
        return;

      default:
        newHistory.push({
          type: "error",
          text: `bash: ${cmd}: command not found. Type 'help' for command manual.`
        });
        break;
    }

    setHistory(newHistory);
    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIndex !== -1) {
        const nextIdx = historyIndex + 1;
        if (nextIdx >= cmdHistory.length) {
          setHistoryIndex(-1);
          setInputVal("");
        } else {
          setHistoryIndex(nextIdx);
          setInputVal(cmdHistory[nextIdx]);
        }
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t-2 border-[var(--term-color)] shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
      {/* CLI Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="term-header-bar cursor-pointer text-xs select-none"
      >
        <span>[TERMINAL SHELL // /bin/sh // BOT CHAIN (ID: 677)]</span>
        <div className="flex items-center gap-3">
          <span className="dim-text hidden sm:inline text-black font-normal">
            TYPE: help, tip 1.0 &quot;msg&quot;, botchain, clear
          </span>
          <span className="font-bold">{isOpen ? "[_ MINIMIZE]" : "[^ EXPAND_SHELL]"}</span>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 font-mono text-xs max-w-7xl mx-auto">
          {/* Scrollable command output history */}
          <div
            ref={scrollRef}
            className="max-h-40 overflow-y-auto mb-2 space-y-1 bg-black p-2 border border-[var(--term-dim)]"
          >
            {history.map((item, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-wrap ${
                  item.type === "input"
                    ? "font-bold text-[var(--term-color)]"
                    : item.type === "error"
                    ? "text-red-400"
                    : item.type === "success"
                    ? "text-emerald-400 font-bold"
                    : "dim-text"
                }`}
              >
                {item.text}
              </div>
            ))}
          </div>

          {/* Prompt line with Blinking block cursor */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="flex items-center bg-black p-2 border border-[var(--term-color)] focus-within:ring-1 focus-within:ring-[var(--term-color)] cursor-text"
          >
            <span className="text-[var(--term-color)] font-bold mr-2 select-none whitespace-nowrap">
              user@botchain:~$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => {
                terminalAudio.playKeyTick();
                setInputVal(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder={"Type 'help' or 'tip 1.0 memo'..."}
              className="w-full text-xs font-mono font-bold"
              autoFocus
            />
            <span className="block-cursor" />
          </div>
        </div>
      )}
    </div>
  );
};
