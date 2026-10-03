<div align="center">

**Languages / Idiomas:** **English** · [Español](README.es.md)

</div>

---

# KryptonSeed · BIP-39 Pure Entropy Foundry & Institutional Cold Storage Suite

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standard](https://img.shields.io/badge/Standard-BIP--39%20%7C%20BIP--44%20%7C%20BIP--84-00e676.svg)](https://github.com/bitcoin/bips)
[![Security](https://img.shields.io/badge/Security-Air--Gapped%20%7C%20Zero--Telemetry-22d3ee.svg)](#5-security-audit--test-battery)
[![Offline](https://img.shields.io/badge/Environment-100%25%20Offline-orange.svg)](#6-air-gapped-execution--quick-start)

**KryptonSeed** is an institutional-grade, open-source, and strictly air-gapped cryptographic suite engineered for the verifiable, handcrafted generation of **BIP-39** mnemonic seed phrases, multi-chain master key derivation (**Bitcoin Native SegWit, Ethereum / EVM, Solana**), and **2-of-3 Multisig Vault** management (**Sparrow Wallet & Safe**).

The system eliminates blind reliance on software pseudo-random number generators (*PRNG*), mitigating hardware backdoors, microprocessor-level compromises, and supply-chain firmware attacks through **physical 6-sided dice rolls (D6)**.

---

## Quick Start (Run in 5 Seconds)

No installation, no npm builds, and no external runtime required:

- **Windows**: Double-click `start.bat` (or open `index.html` in your browser).
- **macOS / Linux**: Run `./start.sh` (or `python3 -m http.server 3456`).
- **Air-Gapped Computer**: Copy this repository to a clean USB flash drive, plug it into an offline PC with Wi-Fi/Bluetooth disabled, and open `index.html`.

---

## Table of Contents
1. [Philosophy & Cryptographic Foundations](#1-philosophy--cryptographic-foundations)
   - [Why Physical Dice?](#why-physical-dice)
   - [PRNG Vulnerabilities & Hardware Attack Vectors](#prng-vulnerabilities--hardware-attack-vectors)
   - [Entropy Mathematics (D6)](#entropy-mathematics-d6)
2. [Step-by-Step Pipeline Guide](#2-step-by-step-pipeline-guide)
   - [Step 01: Verifiable D6 Dice Entropy](#step-01-verifiable-d6-dice-entropy)
   - [Step 02: SHA-256 Condensation & Checksum Extraction](#step-02-sha-256-condensation--checksum-extraction)
   - [Step 03: Official BIP-39 Vault & Privacy Mask](#step-03-official-bip-39-vault--privacy-mask)
   - [Step 04: Multi-Chain Derivation, Decoy Wallet & Plausible Deniability](#step-04-multi-chain-derivation-decoy-wallet--plausible-deniability)
3. [Additional Institutional Modules](#3-additional-institutional-modules)
   - [2-of-3 Multisig Vault (Sparrow & Gnosis Safe)](#2-of-3-multisig-vault-sparrow--gnosis-safe)
   - [Seed Recovery Solver (Inverse Checksum Math)](#seed-recovery-solver-inverse-checksum-math)
   - [Laser Engraving & Coldcard Print Suite](#laser-engraving--coldcard-print-suite)
   - [Air-Gapped Optical QR Scanner](#air-gapped-optical-qr-scanner)
4. [Tools, Libraries & Technical Stack](#4-tools-libraries--technical-stack)
5. [Security Audit & Test Battery](#5-security-audit--test-battery)
6. [Air-Gapped Execution & Deployment](#6-air-gapped-execution--deployment)

---

## 1. Philosophy & Cryptographic Foundations

### Why Physical Dice?
Most crypto users generate wallet seeds by clicking a button in a browser extension, mobile app, or hardware wallet (*Coldcard, Trezor, Ledger*). While widely trusted, this requires **blind faith**: you must trust that the system's pseudo-random number generator (*RNG*) has zero bugs, zero mathematical bias, and no covert backdoors.

Rolling genuine 6-sided casino dice (D6) produces **molecular-mechanical entropy**. Air friction, table texture, throwing velocity, and microscopic surface imperfections create a chaotic physical event that no supercomputer can reverse-engineer.

### PRNG Vulnerabilities & Hardware Attack Vectors
Critical failures in pseudo-random generators have repeatedly compromised cryptography:
- **Dual_EC_DRBG**: An NSA-standardized algorithm engineered with a mathematical backdoor.
- **Debian OpenSSL Bug (CVE-2008-0166)**: Removed the entropy source in Debian packages, reducing all generated SSH and crypto keys to only 32,767 predictable values.
- **RNG Hardware Failures & Supply-Chain Attacks**: Voltage glitches and compromised firmware silently biasing random seeds.

With the **Ian Coleman & Coldcard Methodology**, software does not invent randomness: **you supply the randomness with your own hands**. The software strictly executes deterministic BIP-39 mathematics.

### Entropy Mathematics (D6)
Each roll of a balanced 6-sided die contributes:

$$\log_2(6) \approx 2.5849625 \text{ bits of pure entropy}$$

- **12 BIP-39 Words (128 bits of entropy required)**:
  $$50 \text{ D6 rolls} \implies 6^{50} \approx 8.0779 \times 10^{38} \text{ possibilities}$$
  $$2^{128} \approx 3.4028 \times 10^{38} \text{ possibilities}$$
  *50 rolls comfortably exceed the 128-bit threshold.*

- **24 BIP-39 Words (256 bits of entropy required)**:
  $$100 \text{ D6 rolls} \implies 6^{100} \approx 6.533 \times 10^{77} \text{ possibilities}$$
  $$2^{256} \approx 1.1579 \times 10^{77} \text{ possibilities}$$
  *100 rolls satisfy military-grade 256-bit requirements.*

---

## 2. Step-by-Step Pipeline Guide

### Step 01: Verifiable D6 Dice Entropy
- **Action**: Roll real D6 dice and record the numbers (1-6) sequentially using the screen numpad, keyboard numbers, or pasting a pre-recorded sequence. For quick audits, an interactive 3D virtual roller is also available powered by the Web Crypto API (`window.crypto.getRandomValues`).
- **Why it matters**: The raw sequence (e.g., `421653...`) is the permanent physical root. Entering this identical sequence into any other BIP-39 tool reproduces the exact same seed phrase.
- **Quality Control (Zero Modulo Bias)**:
  Virtual rolls use strict **rejection sampling** rather than `rand % 6`:
  ```javascript
  const maxAcceptable = Math.floor(0xFFFFFFFF / 6) * 6; // 4,294,967,292
  let rand;
  do {
    crypto.getRandomValues(buffer);
    rand = buffer[0];
  } while (rand >= maxAcceptable);
  return (rand % 6) + 1;
  ```

---

### Step 02: SHA-256 Condensation & Checksum Extraction
- **Action**:
  1. The ASCII numeric string of rolls is hashed using **SHA-256** via the audited `@noble/hashes` library.
  2. For 12 words, the first **128 bits** (16 bytes) form canonical entropy.
  3. The **Checksum** is computed by hashing the entropy with SHA-256 and taking the initial **4 bits** ($\frac{128}{32} = 4$).
  4. Concatenating 128 entropy bits + 4 checksum bits yields **132 bits**.
  5. The 132 bits are partitioned into **12 blocks of exactly 11 bits each** ($12 \times 11 = 132$).
- **Why it matters**: 11 binary bits yield $2^{11} = 2048$ possibilities (from `00000000000` = `0` to `11111111111` = `2047`), perfectly indexing the official BIP-39 dictionary.

---

### Step 03: Official BIP-39 Vault & Privacy Mask
- **Action**: Each 11-bit index is mapped to its corresponding word in the official English BIP-39 dictionary.
- **Why it matters**: Humans cannot reliably record 128/256 binary bits, but can easily transcribe 12 or 24 natural words onto steel cards.
- **Security Features**:
  - **Anti-Shoulder Surfing Mask**: Instantly blurs all words to protect against nearby cameras or screen-sharing.
  - **Checksum Validation**: Confirms 100% interoperability with MetaMask, Phantom, Ledger, Trezor, BitBox, Keystone, and Coldcard.

---

### Step 04: Multi-Chain Derivation, Decoy Wallet & Plausible Deniability
- **Action**:
  1. **PBKDF2 Derivation**: The mnemonic phrase and optional passphrase undergo **2048 rounds of HMAC-SHA512** to generate the **512-bit Binary Master Seed**.
  2. **Decoy Wallet vs. Secret Vault (Plausible Deniability)**:
     - **Decoy Mode (No Passphrase)**: Standard wallet derivation. Store a modest amount of crypto here to satisfy extortion (*"$5 wrench attack"*).
     - **Secret Vault (Word 25 / With Passphrase)**: Generates an entirely separate, mathematically unlinked 512-bit seed. There is zero cryptographic proof that a passphrase exists; any different passphrase simply produces another valid, independent wallet.
  3. **Live Account Derivations**:
     - **Bitcoin (Native SegWit - BIP-84)**: Path `m/84'/0'/0'/0/0`, `bc1q` addresses, and compressed WIF private keys.
     - **Ethereum & EVM Chains (BIP-44)**: Path `m/44'/60'/0'/0/0`, EIP-55 checksum addresses, and 32-byte hexadecimal private keys.
     - **Solana (SLIP-0010 ed25519)**: Path `m/44'/501'/0'/0'`, public addresses, and Base58 private keys.
  4. **3 Formatted Export Formats**:
     - **Visual HTML Dossier (`.html`)**: Self-contained styled report with tables, verification hashes, and print-to-PDF formatting.
     - **Structured JSON Dossier (`.json`)**: Indented JSON object for developer backups.
     - **Plain Text Dossier (`.txt`)**: Text file formatted with Windows CRLF (`
`) line endings and **UTF-8 BOM (`﻿`)** for perfect Windows Notepad display.

---

## 3. Additional Institutional Modules

### 2-of-3 Multisig Vault (Sparrow & Gnosis Safe)
Eliminates single points of failure (SPOF) by requiring **2 of 3 signatures** to authorize transfers:
- **Signer A**: Physical dice seed (Coldcard / Steel plate).
- **Signer B**: Mobile / Desktop wallet (MetaMask / 2nd device).
- **Signer C**: Backup vault (Phantom / Bank safe deposit box).
- **Features**:
  - Bitcoin output descriptor: `wsh(sortedmulti(2, [keyA], [keyB], [keyC]))` ready for **Sparrow Wallet** and **Electrum**.
  - Contract deployment JSON configuration for **Safe (Gnosis Safe)** on Ethereum, Arbitrum, Polygon, Optimism, and Base.
  - **Live Web3 Quorum Simulator**: Connect live MetaMask and Phantom wallets in-browser and sign simulated withdrawal payloads.

### Seed Recovery Solver (Inverse Checksum Math)
- **Problem Solved**: If you have the first 11 words of a 12-word seed (or 23 of 24) and lost the final word, you cannot guess randomly because only specific words satisfy the SHA-256 checksum.
- **Operation**: The solver iterates through all 2048 dictionary words, hashes candidate entropies, and extracts the **128 mathematically valid candidates** (eliminating 93.75% of the space) with instantaneous multi-chain address derivation.

### Laser Engraving & Coldcard Print Suite
- **Steel Plate Card (85 × 54 mm)**: Standard credit-card dimensions with 4-letter punch guidance (the first 4 letters uniquely identify any BIP-39 word).
- **A4 Audit Certificate**: Formal paper custody sheet for safe deposit storage.
- **Vector SVG Export**: Laser-engraver ready curves for CNC fiber-laser cutting on titanium or stainless steel.

### Air-Gapped Optical QR Scanner
- Generates high-density optical QR codes on canvas/SVG via `qrcode.js`.
- Enables camera-to-camera optical air-gap data transfers without USB, Bluetooth, or network cables.

---

## 4. Tools, Libraries & Technical Stack

Engineered with **zero build tools, zero external runtimes, and zero remote CDNs (Zero Bundler Architecture)**:

| Library / Tool | Role in Application | Reason for Selection |
| :--- | :--- | :--- |
| **`@noble/hashes` (v1.3.0)** | SHA-256, HMAC-SHA512, PBKDF2 | Formally audited by *Cure53*, zero dependencies, pure JavaScript. |
| **`@noble/secp256k1` (v2.0.0)** | Elliptic curve arithmetic | Bitcoin and Ethereum public key derivation and ECDSA signatures. |
| **`qrcode.js`** | Offline QR code rendering | Self-contained vector canvas generator with zero remote API calls. |
| **`bip39-wordlist.js`** | Official 2048 BIP-39 dictionary | Canonical wordlist from `bitcoin/bips/bip-0039` embedded locally. |
| **Web Crypto API** | Operating-system CSPRNG | `crypto.getRandomValues` with rejection sampling. |
| **Inter & JetBrains Mono** | Typography | High-contrast readability; monospace tabular numerals (`tabular-nums`) for hashes. |
| **Vanilla HTML5 & CSS3** | UI & Architecture | Native CSS tokens for **Dark / Light mode**, responsive layout, and smooth animations. |
| **Native i18n Engine (`i18n.js`)** | Bilingual support (ES / EN) | Client-side dictionary engine with `localStorage` persistence. |

---

## 5. Security Audit & Test Battery

Audited using the repository's dedicated **`crypto-security-audit`** skill (`python .agents/skills/crypto-security-audit/scripts/audit_codebase.py`):

1. **Entropy & PRNG Bias Audit**: Rejection sampling verified over 100,000 rolls with uniform $\frac{1}{6}$ probability. All instances of `Math.random()` removed from sensitive key paths.
2. **DOM XSS Injection Testing**: User inputs sanitized using `escapeHTML()` before any DOM insertion.
3. **Network Isolation & Content Security Policy (CSP)**: Strict `default-src 'self'` and `no-referrer` policies prevent external data exfiltration.
4. **Memory Hygiene & Secret Leakage**: Zero `console.log` statements; master seeds, passphrases, and private keys reside exclusively in volatile memory and are cleared when the tab closes.
5. **BIP-39 RFC Test Vectors**: 100% agreement with official Bitcoin Core and Ian Coleman test vectors.

---

## 6. Air-Gapped Execution & Deployment

For maximum security (*Fort Knox Standard*), run on an offline computer:

1. **Download Repository**: Clone or download the repository to a clean USB drive.
2. **Connect to Air-Gapped Laptop**: Plug into an offline laptop with Wi-Fi/Bluetooth physically turned off (or a Tails OS / Ubuntu Live USB session).
3. **Launch**:
   - Double click `start.bat` (Windows) or run `./start.sh` (Linux/macOS).
   - Or open `index.html` directly in any modern browser.
4. **Record Seed & Power Off**: Stamp words into steel, then power down the PC to wipe RAM.

---

## License
Distributed under the **MIT License**. Free to audit, inspect, modify, and use for personal or institutional financial sovereignty.
