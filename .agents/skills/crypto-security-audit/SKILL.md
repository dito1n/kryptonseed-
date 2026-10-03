---
name: crypto-security-audit
description: >-
  Expert security audit and automated vulnerability remediation skill for cryptographic,
  BIP-39, and Web3 air-gapped web applications. Audits entropy generation, PRNG bias,
  DOM XSS injection, sensitive memory leakage, and air-gapped offline integrity.
---

# Cryptographic & Web3 Security Audit Skill

## Purpose
This skill provides an institutional-grade, multi-vector security audit workflow specifically tailored for client-side cryptographic key generators, hardware wallet seed tools, BIP-39 mnemonic vaults, and Web3 live signers. It detects, analyzes, and automatically fixes vulnerabilities to maintain an uncompromised air-gapped standard.

--------------------------------------------------------------------------------

## 1. Core Audit Vectors & Invariants

When auditing a cryptographic or key generation codebase, systematically evaluate these 6 attack vectors:

### Vector 1: Cryptographic Entropy & PRNG Modulo Bias
- **Invariant**: All random sampling from `window.crypto.getRandomValues` must use rejection sampling if the pool size is not a power of 2.
- **Flaw**: Simple modulo operations like `rand % 6` on a 32-bit integer introduce a slight statistical bias towards lower values.
- **Check**:
  ```javascript
  // Correct rejection sampling for D6 (values 1 to 6):
  const maxAcceptable = Math.floor(0xFFFFFFFF / 6) * 6; // 4,294,967,292
  let rand;
  do {
    crypto.getRandomValues(buffer);
    rand = buffer[0];
  } while (rand >= maxAcceptable);
  return (rand % 6) + 1;
  ```

### Vector 2: DOM Injection & Cross-Site Scripting (XSS)
- **Invariant**: No user input (mnemonic words, passphrases, pasted keys, or query params) may be concatenated into `.innerHTML`, `.outerHTML`, or template literals without entity escaping.
- **Fix**: Always sanitize user input or use `.textContent` / `escapeHTML()`:
  ```javascript
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
  ```

### Vector 3: Memory Hygiene & Secret Leakage
- **Invariant**: Mnemonic phrases, 512-bit master seeds, private keys, and passphrases must **never** be printed via `console.log`, stored in unencrypted `localStorage`, or broadcast over network sockets.
- **Check**: Verify that `console.log` is absent from all crypto routines and that only non-sensitive configuration (e.g. `lang`, `theme`) is stored in `localStorage`.

### Vector 4: Air-Gapped Network Isolation (Zero Exfiltration)
- **Invariant**: The application must function 100% offline without relying on remote API calls, external CDN scripts, analytics beacons, or telemetry.
- **Check**:
  - All crypto libraries (`noble-hashes`, `noble-secp256k1`, `qrcode`, wordlists) must be locally hosted.
  - Implement a defensive Content Security Policy (CSP):
    `<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline'; font-src https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;">`

### Vector 5: BIP-39 & Checksum Mathematical Invariants
- **Invariant**: The SHA-256 hash must be computed strictly on the raw entropy bytes, and the checksum bits must match the initial N / 32 bits of the SHA-256 digest:
  - 12 words: 128 bits entropy + 4 bits checksum = 132 bits = 12 × 11 bits.
  - 24 words: 256 bits entropy + 8 bits checksum = 264 bits = 24 × 11 bits.
- **Check**: Verify that the Inverse Checksum Solver correctly filters only candidates whose entropy + index SHA-256 checksum reproduces the exact trailing bits.

### Vector 6: Defensive Input Normalization
- **Invariant**: User text input for mnemonic words must handle Unicode normalization (NFKD / NFC), non-breaking spaces (`\u00A0`), multiple whitespace separators, and case sensitivity.
- **Check**: `input.replace(/[\u00A0\r\n\t]/g, ' ').trim().toLowerCase().split(/\s+/)`.

--------------------------------------------------------------------------------

## 2. Automated Audit Runbook

To run an automated audit across the codebase:

1. **Execute Security Scanner**:
   ```bash
   python scripts/audit_codebase.py
   ```
2. **Review Identified Warnings**:
   - Classify findings into Critical, High, Medium, or Low severity.
3. **Apply Automated Hardening**:
   - Escape any raw interpolation in DOM updates.
   - Insert strict CSP meta tags.
   - Sanitize all input fields.
   - Clear any potential secret leakage paths.
4. **Run Unit & Cryptographic Test Suite**:
   - Verify that all BIP-39 vectors, live Web3 connection flows, and QR generation pass.
