import React, { useState } from "react";
import { TipJarStats, TIP_JAR_ABI } from "../contracts/TipJarABI";
import { terminalAudio } from "../utils/audio";

interface SectionContractSpecsProps {
  stats: TipJarStats;
  currencySymbol: string;
  connectedAddress: string | null;
  onWithdraw: () => Promise<void>;
  onInjectMockTip: () => void;
  contractAddress: string;
}

export const SectionContractSpecs: React.FC<SectionContractSpecsProps> = ({
  stats,
  currencySymbol,
  connectedAddress,
  onWithdraw,
  onInjectMockTip,
  contractAddress,
}) => {
  const [showAbi, setShowAbi] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const isOwner =
    connectedAddress &&
    stats.ownerAddress &&
    connectedAddress.toLowerCase() === stats.ownerAddress.toLowerCase();

  const handleWithdrawClick = async () => {
    if (!connectedAddress) {
      terminalAudio.playErrorBuzz();
      alert("ERR: Connect wallet first. Only the contract owner can withdraw funds.");
      return;
    }

    if (!isOwner) {
      terminalAudio.playErrorBuzz();
      alert(
        `ERR_PERMISSION_DENIED (EACCES):\nCaller ${connectedAddress} is not the contract owner.\nOwner is: ${stats.ownerAddress}`
      );
      return;
    }

    if (parseFloat(stats.vaultBalanceEth) <= 0) {
      terminalAudio.playErrorBuzz();
      alert(`ERR: Contract vault balance is currently 0 ${currencySymbol}. Nothing to sweep.`);
      return;
    }

    setIsWithdrawing(true);
    terminalAudio.playSubmitChirp();
    try {
      await onWithdraw();
    } catch (err: any) {
      terminalAudio.playErrorBuzz();
      console.error(err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const scanUrl = `https://scan.botchain.ai/address/${contractAddress}`;

  return (
    <section id="contract" className="term-box mb-6 p-4">
      {/* Title Bar */}
      <div className="term-header-bar mb-3">
        <span>[SECTION 06 // SMART CONTRACT SPECIFICATIONS & GOVERNANCE // BOT CHAIN]</span>
        <span className="text-xs">FILE: /etc/contracts/TipJar.sol</span>
      </div>

      <div className="dim-text text-xs mb-3 font-mono">
        EXEC: objdump -d --disassemble-all TipJar.bin | grep -E &quot;BOTCHAIN|EVM&quot;
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs font-mono">
        {/* Left column: Contract Metadata */}
        <div className="term-box-dim p-3 space-y-2">
          <div className="border-b border-[var(--term-dim)] pb-1 font-bold">
            BOT_CHAIN_CONTRACT_INFO
          </div>
          <div>
            <span className="dim-text">SOLIDITY_COMPILER: </span>
            <span>^0.8.20 (Paris EVM / Optimization: 200 runs)</span>
          </div>
          <div>
            <span className="dim-text">MAINNET_CONTRACT: </span>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="underline font-bold break-all text-[var(--term-color)]">{contractAddress}</span>
              <a
                href={scanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] underline text-emerald-400"
              >
                [SCAN.BOTCHAIN.AI ↗]
              </a>
            </div>
          </div>
          <div>
            <span className="dim-text">REGISTERED_OWNER: </span>
            <span className="break-all">{stats.ownerAddress || contractAddress}</span>
          </div>
          <div>
            <span className="dim-text">CALLER_PRIVILEGES: </span>
            <span className={isOwner ? "text-emerald-400 font-bold" : "dim-text"}>
              {isOwner ? "[TRUE - ROOT PRIVILEGES DETECTED]" : "[FALSE - REGULAR CALLER]"}
            </span>
          </div>
          <div>
            <span className="dim-text">NETWORK_SPEC: </span>
            <span>BOT Chain Mainnet (Chain ID: 677 // Currency: BOT)</span>
          </div>
          <div>
            <span className="dim-text">PRIMARY_EVENT: </span>
            <span>TipReceived(address,uint256,string,uint256,uint256)</span>
          </div>
        </div>

        {/* Right column: Governance & Sweep Action */}
        <div className="term-box-dim p-3 space-y-3 flex flex-col justify-between">
          <div>
            <div className="border-b border-[var(--term-dim)] pb-1 font-bold">
              TREASURY_SWEEP_GOVERNANCE
            </div>
            <p className="dim-text text-[11px] mt-2">
              The contract accumulates native {currencySymbol} from incoming tips. Only the registered contract owner
              can trigger the withdraw() routine to transfer funds into their personal wallet.
            </p>
            <div className="my-2 p-2 border border-dashed border-[var(--term-dim)] text-center">
              <span className="dim-text">CURRENT_CONTRACT_TREASURY: </span>
              <span className="text-base font-bold text-emerald-400">
                {stats.vaultBalanceEth} {currencySymbol}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleWithdrawClick}
              disabled={isWithdrawing}
              className={`w-full py-2 text-xs font-bold border-2 ${
                isOwner
                  ? "bg-emerald-600 text-black border-emerald-400 hover:bg-black hover:text-emerald-400"
                  : "border-[var(--term-dim)] text-[var(--term-dim)] cursor-not-allowed"
              }`}
            >
              {isWithdrawing
                ? "[SWEEPING TREASURY FUNDS...]"
                : isOwner
                ? `[ SUDO_WITHDRAW_VAULT (OWNER) ]`
                : `[ WITHDRAW_LOCKED (REQUIRES OWNER WALLET) ]`}
            </button>

            <button
              onClick={() => {
                terminalAudio.playSubmitChirp();
                onInjectMockTip();
              }}
              className="w-full text-[11px] py-1 border border-dashed border-[var(--term-color)]"
              title="Add a sample tip event to test UI components"
            >
              [+] INJECT_SAMPLE_EVENT (Fast UI & Stream Testing)
            </button>
          </div>
        </div>
      </div>

      {/* ABI Inspector Accordion */}
      <div className="term-box-dim p-2 text-xs font-mono">
        <div className="flex justify-between items-center">
          <span className="font-bold">APPLICATION_BINARY_INTERFACE (ABI)</span>
          <button
            onClick={() => {
              terminalAudio.playKeyTick();
              setShowAbi(!showAbi);
            }}
            className="text-[11px]"
          >
            {showAbi ? "[HIDE_SPEC]" : "[INSPECT_ABI]"}
          </button>
        </div>

        {showAbi && (
          <div className="mt-3 max-h-56 overflow-y-auto bg-black p-2 border border-[var(--term-dim)] text-[11px]">
            <pre className="whitespace-pre-wrap">{JSON.stringify(TIP_JAR_ABI, null, 2)}</pre>
          </div>
        )}
      </div>
    </section>
  );
};
