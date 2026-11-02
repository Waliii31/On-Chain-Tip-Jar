# ⚡ ON-CHAIN TIP JAR // HACKER CLI TERMINAL dAPP
### 🤖 POWERED BY BOTCHAIN (MAINNET CHAIN ID: 677)

```
  ___  _  _        ___ _  _   _   ___ _  _   _____ ___ ___       _   _   ___ 
 / _ \| \| | ___  / __| || | /_\ |_ _| \| | |_   _|_ _| _ \ ___ | | /_\ | _ \
| (_) | .` | ___ | (__| __ |/ _ \ | || .` |   | |  | ||  _/ ___ | |/ _ \|   /
 \___/|_|\_|      \___|_||_/_/ \_\___|_|\_|   |_| |___|_|       |_/_/ \_\_|_|
```

> **A retro cyberdeck / terminal-based dApp built on BOT Chain Mainnet where patrons broadcast native BOT token tips and permanent text memos emitted into verifiable blockchain event logs.**

---

## 🌐 BOT CHAIN MAINNET SPECIFICATIONS

| Parameter | Value |
|---|---|
| **Network Name** | `BOT Chain Mainnet` |
| **RPC URL** | `https://rpc.botchain.ai` |
| **Chain ID** | `677` (`0x2a5`) |
| **Currency Symbol** | `BOT` |
| **Currency Decimals** | `18` |
| **Block Explorer** | [https://scan.botchain.ai](https://scan.botchain.ai) |
| **Target Contract** | [`0xFD51797C48f75aF10761F92Bdd639e4518358324`](https://scan.botchain.ai/address/0xFD51797C48f75aF10761F92Bdd639e4518358324) |
| **Ecosystem & Infrastructure** | [Powered by Botchain](https://botchain.ai) |
| **Community / X (Twitter)** | [@site_proof__](https://x.com/site_proof__) |

---

## 🖥️ AESTHETIC & PHILOSOPHY
Built with a **strict Hacker CLI / CRT Terminal aesthetic**:
- **Pure Black Background** (`#000000`).
- **Pure Amber (`#FFB000`) or Matrix Green (`#00FF41`)** monospace phosphor glow with real-time toggle (`[THEME: AMBER / GREEN]`).
- **Terminal Prompt Input Fields** (e.g., `user@botchain:~$`, `memo@event_log:~$`, `operator@grep:~$`) with **blinking CSS block cursors (`█`)**.
- **Keyboard-Focused UI & Interactive `/bin/sh` Shell**: Users can interact via graphical terminal buttons or by typing raw commands (`help`, `tip`, `botchain`, `status`, `events`, `theme`, `clear`, etc.).
- **CRT Scanlines & Subtle Phosphor Screen Flicker** (toggleable).
- **8-Bit Web Audio API Sound Synthesizer**: Realistic mechanical keyboard clicks, transmit chirps, and transaction completion chimes.

---

## 📋 1. ALL THE FEATURES OF THIS WEB APP (WHAT CAN IT DO?)

### 🔹 1. Native BOT Token Tips with On-Chain Text Memos
- Send any native BOT amount (e.g., `0.5 BOT`, `1.0 BOT`, `5.0 BOT`, `10.0 BOT`, or custom values).
- Attach an on-chain text memo (up to 280 characters) encoded into the contract call.
- The smart contract (`TipJar.sol`) records the tip and emits a standardized EVM event log:
  ```solidity
  event TipReceived(
      address indexed tipper,
      uint256 amount,
      string memo,
      uint256 timestamp,
      uint256 indexed tipId
  );
  ```
- **Real-Time Calldata Hex Encoder**: Displays the exact UTF-8 bytecode representation (`0x...`) of the memo in real time.
- **Dry-Run Simulation Mode**: Checkbox toggle allowing instant tip broadcasting and UI testing without spending gas or requiring testnet faucets.

### 🔹 2. Six (6) Dedicated Landing Page Sections

#### **[SECTION 01] SYS_BOOT // TELEMETRY NODE & STATUS MONITOR**
- **ASCII Art Banner**: Retro boot logo and BOT Chain system kernel info.
- **Network Telemetry**: Live Chain ID detector (BOT Chain Mainnet `677`, Hardhat Local `31337`, Sepolia `11155111`), RPC ping latency monitor (`~15ms`), and EVM block height tracker.
- **Real-Time Vault Balance**: Displays accumulated BOT in the smart contract treasury.
- **Protocol Metrics**: Cumulative tips emitted counter and total volume transferred in BOT.
- **RPC Gateway Controls**: One-click network switcher for MetaMask (`[CONNECT_BOTCHAIN_MAINNET (677)]` / `[LOCALHOST_8545]`).

#### **[SECTION 02] TIP DISPATCH CONSOLE (`/bin/transmit`)**
- Formatted as an interactive terminal session: `user@botchain:~$ tip --value=1.0` and `memo@event_log:~$`.
- **Quick-Tier Presets**: `[0.5 BOT: MICRO_NODE]`, `[1.0 BOT: COFFEE.SH]`, `[5.0 BOT: PIZZA.BIN]`, `[10.0 BOT: CYBER_WHALE]`.
- **Dynamic Character & Byte Counter**: `LENGTH: XX / 280 BYTES`.
- **Live Transmission Telemetry Log**: A FIFO terminal screen tracking each step: ABI serialization → MetaMask signature prompt → Mempool broadcasting → Block inclusion → Event log receipt.
- **Cyber Confetti Celebration**: Terminal burst on confirmed blockchain inclusion.

#### **[SECTION 03] REAL-TIME ON-CHAIN EVENT STREAM (`tail -f /dev/events`)**
- Live event listener attached to `TipReceived` logs emitted by the smart contract.
- Stream output format:
  `[2026-11-02 18:42:01 UTC] [BLOCK #4892011] FROM: 0x71C...B001 VALUE: 5.000 BOT MEMO: "Keep hacking the planet!"`
- **Terminal Grep Search**: Interactive search prompt (`operator@grep:~$ grep -i <query>`) to filter logs by address, memo keyword, or block number.
- **Stream Controls**: `[PAUSE_STREAM]`, `[RESUME_STREAM]`, `[CLEAR_BUFFER]`, and `[EXPORT_JSON]` to download logs as a file.
- **Decoded Log Inspector**: Click any event line to view the full transaction hash (with direct link to [scan.botchain.ai](https://scan.botchain.ai)), raw Wei value, sender address, and event signature.

#### **[SECTION 04] THE ON-CHAIN MEMO VAULT (`cat /mnt/vault/memos.db`)**
- Structured terminal card catalog of all permanent on-chain messages.
- Filter views: `[ALL_MEMOS]`, `[WHALE_TIPS >= 5 BOT]`, and `[MY_TRANSMISSIONS]` (filters by connected wallet address).
- Instant one-click clipboard copy for both the memo message and the transaction hash, and direct link to block explorer.

#### **[SECTION 05] CYBER WHALE & PATRON LEADERBOARD (`ps aux --sort=-%bot`)**
- Live top tipper leaderboard dynamically calculated from on-chain event history.
- Linux-style process table displaying:
  - `RANK`: `#01 ★`, `#02`, `#03`...
  - `TIER_BADGE`: `[APEX_BOTCHAIN_WHALE]`, `[SYS_NODE_OPERATOR]`, `[CIPHERPUNK_ELITE]`, `[CODE_PATRON]`, `[AUTONOMOUS_RUNNER]`.
  - `ACCOUNT_ADDRESS`: Checksummed shortened address linking directly to `scan.botchain.ai`.
  - `CUMULATIVE_BOT`: Total BOT contributed.
  - `TRANSACTIONS`: Total tips sent.
  - `POOL_SHARE`: Visual percentage bar of overall tips volume.

#### **[SECTION 06] SMART CONTRACT SPECIFICATIONS & GOVERNANCE (`/etc/contracts/TipJar.sol`)**
- Contract metadata: Solidity version `^0.8.20`, EVM target `Paris`, compiled with Hardhat optimizer.
- Target mainnet contract: `0xFD51797C48f75aF10761F92Bdd639e4518358324` on BOT Chain Mainnet.
- **Contract Owner Privileges Verification**: Detects if connected wallet is the contract owner (`[ROOT PRIVILEGES DETECTED]`).
- **Owner Sudo Treasury Sweep (`sudo ./withdraw.sh`)**: Direct button to withdraw accumulated contract balance to the owner's wallet. Automatically prevents non-owners with an `ERR_PERMISSION_DENIED` notice.
- **Interactive ABI Inspector**: View the raw Solidity Application Binary Interface.
- **Sample Event Injector**: One-click button to simulate mock on-chain events for rapid UI testing.

### 🔹 3. Terminal Footer Links (Required Governance & Ecosystem)
- **Twitter / X Community**: [https://x.com/site_proof__](https://x.com/site_proof__) (`𝕏 @site_proof__`)
- **Infrastructure / Powered By**: [https://botchain.ai](https://botchain.ai) (`POWERED BY BOTCHAIN`)
- **Contract Address Verification**: [https://scan.botchain.ai/address/0xFD51797C48f75aF10761F92Bdd639e4518358324](https://scan.botchain.ai/address/0xFD51797C48f75aF10761F92Bdd639e4518358324)

### 🔹 4. Bottom Interactive Terminal Shell (`/bin/sh`)
A persistent expandable command-line tray at the bottom of the screen. You can type commands directly using your keyboard:
- `help` - Lists all available commands and syntax.
- `tip <amount> <memo>` - Broadcasts a tip transaction (e.g. `tip 1.0 "Awesome project!"`).
- `connect` - Requests MetaMask connection.
- `disconnect` - Disconnects active wallet.
- `botchain` - Switches MetaMask to BOT Chain Mainnet (Chain ID 677).
- `status` - Prints current contract vault balance, lifetime volume, and active account.
- `events` - Lists the most recent 3 tips from the event buffer.
- `theme amber` / `theme green` - Switches CRT phosphor color palette.
- `sound on` / `sound off` - Toggles 8-bit synthesizer audio.
- `scanlines on` / `scanlines off` - Toggles CRT cathode scanline overlay.
- `withdraw` - Triggers contract owner treasury sweep.
- `demo` - Injects a random sample tip into the event stream.
- `matrix` - Toggles background digital rain animation.
- `clear` - Clears the terminal output buffer.
- **Command History**: Navigate previous commands using `ArrowUp` (↑) and `ArrowDown` (↓).

---

## 🛠️ 2. HOW TO RUN LOCALLY AND TEST WITH METAMASK WALLET

### Prerequisites
- **Node.js** (v18, v20, or v22+)
- **npm** (v9+)
- **MetaMask** browser extension installed in Chrome, Brave, Edge, or Firefox.

---

### Step 1: Clone & Install Dependencies
Open your terminal inside the project directory:
```bash
npm install
```

---

### Step 2: Compile the Smart Contract
Compile `contracts/TipJar.sol` using Hardhat:
```bash
npm run compile
```
*Expected output: `Compiled 1 Solidity file successfully (evm target: paris)`.*

---

### Step 3: Run Contract Unit Tests
Verify that all 6 smart contract tests pass:
```bash
npm test
```
*Expected output: `6 passing`.*

---

### Step 4: Deploy Contract on BOT Chain Mainnet (or Local Node)

#### Option A: Deploy to BOT Chain Mainnet
1. In `hardhat.config.cjs`, configure your private key (or set environment variable):
   ```bash
   export PRIVATE_KEY="0x_YOUR_PRIVATE_KEY_HERE"
   ```
2. Deploy to BOT Chain:
   ```bash
   npm run deploy:botchain
   ```
   *The deployment script automatically updates `src/contract-config.json` with the deployed address!*

#### Option B: Test with Local Node (Fast local offline testing)
In a dedicated terminal:
```bash
npm run node
```
In a second terminal:
```bash
npm run deploy:local
```

---

### Step 5: Start the Frontend React dApp
Run the Vite development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🦊 HOW TO CONFIGURE METAMASK FOR BOT CHAIN MAINNET

1. In the dApp header (Section 1), simply click the button:
   **`[CONNECT_BOTCHAIN_MAINNET (677)]`**
   MetaMask will automatically prompt you to add and switch to BOT Chain Mainnet!

2. **Manual Network Configuration (if adding manually in MetaMask)**:
   - **Network Name**: `BOT Chain Mainnet`
   - **New RPC URL**: `https://rpc.botchain.ai`
   - **Chain ID**: `677`
   - **Currency Symbol**: `BOT`
   - **Currency Decimals**: `18`
   - **Block Explorer URL**: `https://scan.botchain.ai`

---

## 🧪 STEP-BY-STEP MANUAL TESTING GUIDE

Follow these steps to manually test every single feature:

### Test 1: Connect MetaMask Wallet & Check System Diagnostics
1. Click **`[+] CONNECT_METAMASK`** in the top navigation bar (or type `connect` in the `/bin/sh` shell at the bottom).
2. Approve the connection request in MetaMask.
3. Observe **Section 1 (SYS_BOOT & TELEMETRY NODE)**:
   - `CONNECTED_NETWORK` displays `BOT_CHAIN_MAINNET (677) ★ ACTIVE`.
   - `ACTIVE_CLIENT_ACCOUNT` displays your MetaMask address and current BOT balance.
   - `NODE_LATENCY` shows active ping response to `rpc.botchain.ai`.

---

### Test 2: Send a Tip with Text Memo (On-Chain Transaction)
1. Navigate to **Section 2 (TIP DISPATCH CONSOLE)**.
2. In `tip --value=`, choose a preset (e.g., `1.0 BOT [COFFEE.SH]`) or type custom amount `0.5`.
3. In `memo@event_log:~$`, type a custom memo:
   `"Powered by Botchain! Autonomous agent micro-transaction."`
4. Observe the **`CALLDATA_HEX`** field dynamically updating with your string's hex bytes.
5. Click **`>>> EXECUTE_ON_CHAIN_TRANSACTION <<<`** (or type `tip 1.0 "Powered by Botchain"` in the CLI shell).
6. MetaMask will pop up asking for confirmation:
   - Notice the BOT amount and low gas fee.
   - Click **Confirm**.
7. Observe the **TRANSMISSION_TELEMETRY_LOGS** box:
   - Step 1: Preparing payload.
   - Step 2: Requesting cryptographic signature.
   - Step 3: Broadcasted to mempool with Tx Hash.
   - Step 4: Block mined! Event `TipReceived` confirmed!
8. Enjoy the audio success chime and cyber confetti burst!

---

### Test 3: Verify Real-Time Event Log Stream & Grep Filter
1. Scroll down to **Section 3 (REAL-TIME ON-CHAIN EVENT STREAM)**.
2. The newly mined tip is displayed at the top with timestamp, block number, tipper address, BOT amount, and memo string.
3. Click on the log row:
   - It expands to show the raw transaction hash (linking to `https://scan.botchain.ai/tx/0x...`), event signature, and full Wei amount.
4. Test the **Grep Search Filter**:
   - In `operator@grep:~$`, type a keyword from your memo (e.g. `Botchain` or part of your address).
   - Only matching event logs remain visible in real time. Click `[RESET]` to clear the filter.
5. Click **`[EXPORT_JSON]`**: A `.json` file containing all decoded event logs is downloaded to your machine.

---

### Test 4: Inspect the Memo Vault
1. Scroll to **Section 4 (THE ON-CHAIN MEMO VAULT)**.
2. Locate the record card corresponding to your tip.
3. Test the filter tabs:
   - Click **`[WHALE_TIPS >= 5 BOT]`** to view high-value tips.
   - Click **`[MY_TRANSMISSIONS]`** to isolate memos sent specifically by your connected MetaMask account.
4. Click **`[COPY_MEMO]`** and **`[SCAN ↗]`** to verify clipboard copy and block explorer redirection.

---

### Test 5: Verify the Cyber Whale Leaderboard
1. Scroll to **Section 5 (CYBER WHALE & PATRON LEADERBOARD)**.
2. Check the rankings:
   - Your account is ranked based on cumulative BOT sent.
   - Review your tier badge (e.g., `[APEX_BOTCHAIN_WHALE]` or `[CODE_PATRON]`).
   - The `POOL_SHARE` bar shows your percentage contribution to the tip jar.
3. Click on any row to copy the tipper's address or click the address link to view on `scan.botchain.ai`.

---

### Test 6: Test Owner Treasury Sweep (`sudo withdraw`)
1. Connect a wallet that is **not** the contract owner:
   - Scroll to **Section 6 (SMART CONTRACT SPECIFICATIONS & GOVERNANCE)**.
   - Notice `CALLER_PRIVILEGES: [FALSE - REGULAR CALLER]`.
   - The withdraw button displays `[ WITHDRAW_LOCKED (REQUIRES OWNER WALLET) ]`.
   - Attempting to click it alerts you that root owner privileges are required.
2. Connect with the registered contract owner address:
   - Notice `CALLER_PRIVILEGES` flips to **`[TRUE - ROOT PRIVILEGES DETECTED]`**!
   - The withdraw button turns green: **`[ SUDO_WITHDRAW_VAULT (OWNER) ]`**.
3. Click **`[ SUDO_WITHDRAW_VAULT (OWNER) ]`** (or type `withdraw` in the `/bin/sh` shell):
   - Confirm the transaction in MetaMask.
   - The contract balance is swept directly into the owner's personal wallet.

---

### Test 7: Verify Footer Links
1. Scroll to the footer at the bottom of the page.
2. Verify all 3 required links:
   - **`𝕏 @site_proof__`** opens `https://x.com/site_proof__` in a new tab.
   - **`POWERED BY BOTCHAIN`** opens `https://botchain.ai` in a new tab.
   - **`SCAN CONTRACT`** opens `https://scan.botchain.ai/address/0xFD51797C48f75aF10761F92Bdd639e4518358324` on Botchain Scan in a new tab.

---

### Test 8: Test the Bottom Interactive CLI Shell (`/bin/sh`)
1. Click the terminal prompt at the bottom: `user@botchain:~$`.
2. Try typing the following commands:
   - `help` → Prints the complete CLI manual.
   - `botchain` → Prompts MetaMask to switch to BOT Chain Mainnet.
   - `status` → Prints current contract vault balance, tip count, and connected account.
   - `events` → Prints the last 3 events directly inside the shell.
   - `tip 1.0 "CLI Tip"` → Prompts MetaMask to send 1.0 BOT with the memo.
   - `theme green` → Switches the whole terminal to Matrix Green `#00FF41`.
   - `theme amber` → Switches back to Amber VT220 `#FFB000`.
   - `sound off` / `sound on` → Mutes or enables mechanical keystroke sounds.
   - `scanlines off` / `scanlines on` → Toggles CRT scanline overlay.
   - `matrix` → Toggles the digital falling code animation in the background.
   - `demo` → Injects a simulated tip.
   - `clear` → Clears the shell history.
3. Press the **Up Arrow (↑)** key to recall previously entered commands.

---

### Test 9: Test Dry-Run Simulation Mode (No Gas / Offline Testing)
1. In Section 2, check the box:
   `[X] SIMULATION_MODE (Dry-run without spending BOT / testing offline)`.
2. Type any tip amount and memo.
3. Click **`EXECUTE_ON_CHAIN_TRANSACTION`**.
4. The transaction executes instantly without requiring MetaMask approval, emitting a simulated event into the live stream, updating the stats, and refreshing the leaderboard.

---

## 🔒 SECURITY & GAS CONSIDERATIONS
- **Input Sanitization**: Memos are restricted to a maximum length of 280 bytes to prevent unbounded calldata gas spikes.
- **Pull over Push Pattern**: Funds accumulate in the contract balance and can only be withdrawn by the owner using `withdraw()`.
- **Zero-Value Guard**: The contract reverts if a transaction sends 0 tokens.
- **Fail-Safe Fallback**: Includes a `receive()` fallback function that accepts direct transfers and automatically emits a `TipReceived` event log with `[DIRECT_TRANSFER_NO_MEMO]`.

---

**Developed for the Hacker Terminal dApp Ecosystem.**  
*Powered by [Botchain](https://botchain.ai) // Follow [@site_proof__](https://x.com/site_proof__)* ⚡
