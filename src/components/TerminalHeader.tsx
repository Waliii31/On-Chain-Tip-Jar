import React from "react";
import { terminalAudio } from "../utils/audio";

interface TerminalHeaderProps {
  theme: "amber" | "green";
  setTheme: (t: "amber" | "green") => void;
  scanlines: boolean;
  setScanlines: (s: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  connectedAddress: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  theme,
  setTheme,
  scanlines,
  setScanlines,
  soundEnabled,
  setSoundEnabled,
  activeSection,
  setActiveSection,
  connectedAddress,
  onConnect,
  onDisconnect,
}) => {
  const toggleTheme = () => {
    terminalAudio.playSubmitChirp();
    setTheme(theme === "amber" ? "green" : "amber");
  };

  const toggleScanlines = () => {
    terminalAudio.playKeyTick();
    setScanlines(!scanlines);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    terminalAudio.setEnabled(next);
    if (next) terminalAudio.playSubmitChirp();
  };

  const navItems = [
    { id: "status", label: "[1] SYS_STATUS" },
    { id: "dispatch", label: "[2] TRANSMIT_TIP" },
    { id: "events", label: "[3] EVENT_STREAM" },
    { id: "vault", label: "[4] MEMO_VAULT" },
    { id: "whales", label: "[5] LEADERBOARD" },
    { id: "contract", label: "[6] CONTRACT_SPEC" },
  ];

  return (
    <header className="border-b border-[var(--term-color)] pb-3 mb-6">
      {/* Top Bar with System Meta & Controls */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-[var(--term-color)] text-black px-2 py-0.5 font-bold">
            HOST: TIPJAR_NODE_01
          </span>
          <span className="dim-text">TTY: /dev/pts/4</span>
          <span className="hidden sm:inline dim-text">KERNEL: EVM_0.8.24</span>
          <span className="text-[var(--term-color)] animate-pulse">● LIVE</span>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleTheme}
            title="Toggle Amber VT220 / Matrix Green"
            className="text-xs"
          >
            THEME: {theme === "amber" ? "AMBER (#FFB000)" : "GREEN (#00FF41)"}
          </button>

          <button
            onClick={toggleScanlines}
            title="Toggle CRT Scanline Simulation"
            className="text-xs"
          >
            SCANLINES: {scanlines ? "[ON]" : "[OFF]"}
          </button>

          <button
            onClick={toggleSound}
            title="Toggle 8-bit Synthesizer Audio"
            className="text-xs"
          >
            AUDIO: {soundEnabled ? "[ON]" : "[MUTED]"}
          </button>

          {connectedAddress ? (
            <button
              onClick={onDisconnect}
              className="text-xs border-red-500 text-red-400 hover:bg-red-500 hover:text-black"
            >
              DISCONNECT [{connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}]
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="text-xs font-bold bg-[var(--term-color)] text-black"
            >
              [+] CONNECT_METAMASK
            </button>
          )}
        </div>
      </div>

      {/* ASCII Logo Banner */}
      <pre className="text-xs sm:text-sm font-bold leading-none select-none text-[var(--term-color)] overflow-x-auto my-2 py-1">
{`  ___  _  _        ___ _  _   _   ___ _  _   _____ ___ ___       _   _   ___ 
 / _ \\| \\| | ___  / __| || | /_\\ |_ _| \\| | |_   _|_ _| _ \\ ___ | | /_\\ | _ \\
| (_) | .\` | ___ | (__| __ |/ _ \\ | || .\` |   | |  | ||  _/ ___ | |/ _ \\|   /
 \\___/|_|\\_|      \\___|_||_/_/ \\_\\___|_|\\_|   |_| |___|_|       |_/_/ \\_\\_|_\\`}
      </pre>

      <div className="flex justify-between items-center text-xs dim-text mt-1">
        <span>ON-CHAIN ETHEREUM TIP JAR // EVENT LOG EMISSION TELEMETRY SYSTEM</span>
        <span>VERSION: 1.0.4-PROD</span>
      </div>

      {/* Navigation Jumper Tabs */}
      <nav className="flex flex-wrap gap-2 mt-4 text-xs">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                terminalAudio.playKeyTick();
                setActiveSection(item.id);
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-3 py-1 ${
                isActive
                  ? "bg-[var(--term-color)] text-black font-bold"
                  : "border border-[var(--term-dim)] text-[var(--term-color)] hover:border-[var(--term-color)]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
