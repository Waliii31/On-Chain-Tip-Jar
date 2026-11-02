import React, { useState } from "react";
import confetti from "canvas-confetti";
import { terminalAudio } from "../utils/audio";
import { OnChainTip } from "../contracts/TipJarABI";

interface SectionTipDispatchProps {
  onSendTip: (amountEth: string, memo: string, isSimulated: boolean) => Promise<OnChainTip | null>;
  connectedAddress: string | null;
  currencySymbol: string;
  onConnectWallet: () => void;
  txLogs: string[];
}

export const SectionTipDispatch: React.FC<SectionTipDispatchProps> = ({
  onSendTip,
  connectedAddress,
  currencySymbol,
  onConnectWallet,
  txLogs,
}) => {
  const [amount, setAmount] = useState<string>("1.0");
  const [memo, setMemo] = useState<string>("Powered by Botchain! Keep autonomous smart agents alive 🤖");
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<"amount" | "memo" | null>(null);

  // Quick preset native token amounts
  const presets = [
    { label: `0.5 ${currencySymbol} [MICRO_NODE]`, value: "0.5" },
    { label: `1.0 ${currencySymbol} [COFFEE.SH]`, value: "1.0" },
    { label: `5.0 ${currencySymbol} [PIZZA.BIN]`, value: "5.0" },
    { label: `10.0 ${currencySymbol} [CYBER_WHALE]`, value: "10.0" },
  ];

  // Convert memo to raw hex representation for authentic hacker aesthetic
  const getMemoHex = (text: string) => {
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return "0x";
    }
  };

  const handlePreset = (val: string) => {
    terminalAudio.playKeyTick();
    setAmount(val);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      terminalAudio.playErrorBuzz();
      alert(`ERR: Tip amount must be greater than 0 ${currencySymbol}`);
      return;
    }
    if (!memo.trim()) {
      terminalAudio.playErrorBuzz();
      alert("ERR: Memo cannot be empty. It must be emitted as an on-chain event log.");
      return;
    }

    if (!connectedAddress && !isSimulated) {
      terminalAudio.playSubmitChirp();
      const confirmSim = window.confirm(
        `MetaMask wallet is not connected.\n\nWould you like to connect MetaMask now, or transmit in SIMULATED DRY-RUN mode?\n\nPress OK to Connect MetaMask, or Cancel to use Simulation Mode.`
      );
      if (confirmSim) {
        onConnectWallet();
        return;
      } else {
        setIsSimulated(true);
      }
    }

    setIsSubmitting(true);
    terminalAudio.playSubmitChirp();

    try {
      const result = await onSendTip(amount, memo, isSimulated);
      if (result) {
        terminalAudio.playSuccessChime();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FFB000", "#00FF41", "#FFFFFF"],
        });
        setMemo("");
      }
    } catch (err: any) {
      terminalAudio.playErrorBuzz();
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="dispatch" className="term-box mb-6 p-4">
      {/* Title Bar */}
      <div className="term-header-bar mb-3">
        <span>[SECTION 02 // TIP DISPATCH CONSOLE // NATIVE {currencySymbol} EMISSION]</span>
        <span className="text-xs">
          MODE: {isSimulated ? "SIMULATED_TESTNET" : "BOT_CHAIN_MAINNET_DIRECT"}
        </span>
      </div>

      <div className="dim-text text-xs mb-3 font-mono">
        EXEC: ./broadcast_tip --target 0xFD51...8324 --token {currencySymbol} --emit-event TipReceived
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input 1: Tip Amount */}
        <div className="term-box-dim p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[var(--term-color)]">
              [PARAMETER: {currencySymbol}_VALUE]
            </span>
            <div className="flex flex-wrap gap-1">
              {presets.map((p) => (
                <button
                  type="button"
                  key={p.value}
                  onClick={() => handlePreset(p.value)}
                  className={`text-[11px] py-0.5 px-2 ${
                    amount === p.value
                      ? "bg-[var(--term-color)] text-black font-bold"
                      : "border border-[var(--term-dim)] text-[var(--term-color)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal Prompt Input for Amount */}
          <div className="flex items-center text-sm sm:text-base font-mono bg-black p-2 border border-[var(--term-dim)] focus-within:border-[var(--term-color)]">
            <span className="text-[var(--term-color)] font-bold mr-2 select-none">
              user@botchain:~$ tip --value=
            </span>
            <input
              type="number"
              step="0.01"
              min="0.0001"
              value={amount}
              onChange={(e) => {
                terminalAudio.playKeyTick();
                setAmount(e.target.value);
              }}
              onFocus={() => setFocusedField("amount")}
              onBlur={() => setFocusedField(null)}
              placeholder="1.0"
              className="w-40 font-mono font-bold"
              required
            />
            <span className="text-xs dim-text mr-2">{currencySymbol}</span>
            {focusedField === "amount" && <span className="block-cursor" />}
          </div>
        </div>

        {/* Input 2: On-Chain Memo Text */}
        <div className="term-box-dim p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[var(--term-color)]">
              [PARAMETER: ON_CHAIN_EVENT_MEMO]
            </span>
            <span className="text-xs dim-text font-mono">
              BYTES: {memo.length} / 280
            </span>
          </div>

          {/* Terminal Prompt Input for Memo */}
          <div className="flex items-start text-sm sm:text-base font-mono bg-black p-2 border border-[var(--term-dim)] focus-within:border-[var(--term-color)]">
            <span className="text-[var(--term-color)] font-bold mr-2 select-none whitespace-nowrap">
              memo@event_log:~$
            </span>
            <input
              type="text"
              maxLength={280}
              value={memo}
              onChange={(e) => {
                terminalAudio.playKeyTick();
                setMemo(e.target.value);
              }}
              onFocus={() => setFocusedField("memo")}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter text message to emit permanently onto BOT Chain..."
              className="w-full font-mono font-bold"
              required
            />
            {focusedField === "memo" && <span className="block-cursor" />}
          </div>

          {/* Real-time Hex Representation Output */}
          <div className="mt-2 text-[11px] dim-text font-mono overflow-x-auto whitespace-nowrap">
            <span className="font-bold">CALLDATA_HEX: </span>
            <span>{getMemoHex(memo) || "0x"}</span>
          </div>
        </div>

        {/* Simulation / Dry-Run Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSimulated}
              onChange={(e) => {
                terminalAudio.playKeyTick();
                setIsSimulated(e.target.checked);
              }}
              className="accent-[var(--term-color)]"
            />
            <span className={isSimulated ? "font-bold text-[var(--term-color)]" : "dim-text"}>
              [X] SIMULATION_MODE (Dry-run without spending {currencySymbol} / testing offline)
            </span>
          </label>

          <span className="dim-text text-[11px]">
            EST_GAS: ~45,210 WEI | RPC: rpc.botchain.ai
          </span>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 text-sm sm:text-base font-bold bg-[var(--term-color)] text-black border-2 border-[var(--term-color)] hover:bg-black hover:text-[var(--term-color)] transition-all flex items-center justify-center gap-2 tracking-wider"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⚙</span>
                <span>[TRANSMITTING RAW CALL TO BOT CHAIN RPC...]</span>
              </>
            ) : (
              <>
                <span>&gt;&gt;&gt;</span>
                <span>EXECUTE_ON_CHAIN_TRANSACTION ({amount} {currencySymbol})</span>
                <span>&lt;&lt;&lt;</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Terminal Broadcast Progress & Telemetry Log Window */}
      <div className="mt-4 term-box-dim p-3 bg-black">
        <div className="border-b border-[var(--term-dim)] pb-1 mb-2 text-xs font-bold flex justify-between">
          <span>TRANSMISSION_TELEMETRY_LOGS</span>
          <span className="dim-text">FIFO_BUFFER</span>
        </div>
        <div className="text-xs font-mono space-y-1 max-h-32 overflow-y-auto">
          {txLogs.length === 0 ? (
            <div className="dim-text italic">
              [READY] Awaiting user prompt execution. Type tip parameters and press ENTER.
            </div>
          ) : (
            txLogs.map((log, idx) => (
              <div key={idx} className="leading-tight">
                <span className="text-[var(--term-color)]">&gt; </span>
                <span>{log}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
