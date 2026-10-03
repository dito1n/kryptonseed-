// KryptonSeed · Master Engine (Full Pipeline: Steps 1, 2, 3 & 4 Multichain HD)
(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

  'use strict';

  // State Management
  let currentStep = 1;
  let targetRolls = 50; // 50 for 12 words, 100 for 24 words
  let targetWords = 12;
  let rollsHistory = [];
  let isSoundEnabled = localStorage.getItem('krypton_audio_fx') !== 'false';
  let currentRotX = -20;
  let currentRotY = -30;
  let isTumbling = false;
  let clearConfirmTimeout = null;
  let isSeedMasked = false;

  // Step 4 Passphrase & Derivation State
  let currentPassphrase = '';
  let computedCryptoData = null;
  let computedWords = [];
  let computedMnemonicString = '';
  let derivedChainsData = null;

  // Privacy reveal states for Step 4 private keys
  let isBtcWifRevealed = false;
  let isEthPrivRevealed = false;
  let isSolPrivRevealed = false;

  // DOM Elements - Stepper & Global
  const globalStatusText = document.getElementById('global-status-text');
  const globalStatusDot = document.getElementById('global-status-dot');
  const pipelineStep1 = document.getElementById('pipeline-step-1');
  const pipelineStep2 = document.getElementById('pipeline-step-2');
  const pipelineStep3 = document.getElementById('pipeline-step-3');
  const pipelineStep4 = document.getElementById('pipeline-step-4');
  const connector12 = document.getElementById('connector-1-2');
  const connector23 = document.getElementById('connector-2-3');
  const connector34 = document.getElementById('connector-3-4');

  const viewStep1 = document.getElementById('view-step-1');
  const viewStep2 = document.getElementById('view-step-2');
  const viewStep3 = document.getElementById('view-step-3');
  const viewStep4 = document.getElementById('view-step-4');

  const btnAudioToggle = document.getElementById('btn-audio-toggle');
  const toastHub = document.getElementById('toast-hub');

  // DOM Elements - Step 1
  const diceCube = document.getElementById('dice-cube');
  const diceScene = document.querySelector('.dice-scene');
  const displayLastVal = document.getElementById('display-last-val');
  const statCurrentRolls = document.getElementById('stat-current-rolls');
  const statTargetRolls = document.getElementById('stat-target-rolls');
  const statEntropyBits = document.getElementById('stat-entropy-bits');
  const statSecurityBadge = document.getElementById('stat-security-badge');
  const statSecurityLabel = document.getElementById('stat-security-label');
  const gaugeFill = document.getElementById('gauge-fill');
  const gaugePctText = document.getElementById('gauge-pct-text');
  const gaugeStatusText = document.getElementById('gauge-status-text');
  const tapeScrollArena = document.getElementById('tape-scroll-arena');
  const emptyStateNotice = document.getElementById('empty-state-notice');
  const chipCounterBadge = document.getElementById('chip-counter-badge');
  const rawEntropyString = document.getElementById('raw-entropy-string');
  const btnMode12 = document.getElementById('btn-mode-12');
  const btnMode24 = document.getElementById('btn-mode-24');
  const btnRoll1 = document.getElementById('btn-roll-1');
  const btnRoll5 = document.getElementById('btn-roll-5');
  const btnRollComplete = document.getElementById('btn-roll-complete');
  const btnUndoRoll = document.getElementById('btn-undo-roll');
  const btnClearAll = document.getElementById('btn-clear-all');
  const btnProceedStep2 = document.getElementById('btn-proceed-step2');
  const btnCopySeq = document.getElementById('btn-copy-sequence');
  const inputBatch = document.getElementById('input-batch');
  const btnApplyBatch = document.getElementById('btn-apply-batch');
  const keysD6 = document.querySelectorAll('.key-d6');

  // DOM Elements - Step 2
  const btnBackStep1 = document.getElementById('btn-back-to-step1');
  const btnBackFooter = document.getElementById('btn-back-footer');
  const btnProceedStep3 = document.getElementById('btn-proceed-step3');
  const displaySha256Hex = document.getElementById('display-sha256-hex');
  const btnCopySha256 = document.getElementById('btn-copy-sha256');
  const bitsSummaryLabel = document.getElementById('bits-summary-label');
  const legendEntropyText = document.getElementById('legend-entropy-text');
  const legendChecksumText = document.getElementById('legend-checksum-text');
  const displayBitstream = document.getElementById('display-bitstream');
  const chkBitsCount = document.getElementById('chk-bits-count');
  const blockCountBadge = document.getElementById('block-count-badge');
  const elevenBlocksContainer = document.getElementById('eleven-blocks-container');

  // DOM Elements - Step 3
  const btnBackToStep2 = document.getElementById('btn-back-to-step2');
  const btnBackStep2Footer = document.getElementById('btn-back-step2-footer');
  const btnProceedStep4 = document.getElementById('btn-proceed-step4');
  const vaultWordsCountTag = document.getElementById('vault-words-count-tag');
  const btnToggleMask = document.getElementById('btn-toggle-mask');
  const maskBtnText = document.getElementById('mask-btn-text');
  const btnCopySeed = document.getElementById('btn-copy-seed');
  const btnDownloadBackup = document.getElementById('btn-download-backup');
  const wordsGridWrapper = document.getElementById('words-grid-wrapper');
  const bip39WordsGrid = document.getElementById('bip39-words-grid');
  const seedPlaintextContainer = document.getElementById('seed-plaintext-container');
  const seedPlaintextCode = document.getElementById('seed-plaintext-code');

  // DOM Elements - Step 4
  const btnBackToStep3 = document.getElementById('btn-back-to-step3');
  const btnBackStep3Footer = document.getElementById('btn-back-step3-footer');
  const btnRestartFlow = document.getElementById('btn-restart-flow');
  const inputPassphrase = document.getElementById('input-passphrase');
  const btnTogglePassVisibility = document.getElementById('btn-toggle-pass-visibility');
  const btnApplyPassphrase = document.getElementById('btn-apply-passphrase');
  const displayMasterSeed = document.getElementById('display-master-seed');
  const btnCopyMasterSeed = document.getElementById('btn-copy-master-seed');

  const displayBtcAddress = document.getElementById('display-btc-address');
  const btnCopyBtcAddr = document.getElementById('btn-copy-btc-addr');
  const displayBtcWif = document.getElementById('display-btc-wif');
  const btnRevealBtcWif = document.getElementById('btn-reveal-btc-wif');
  const btnCopyBtcWif = document.getElementById('btn-copy-btc-wif');

  const displayEthAddress = document.getElementById('display-eth-address');
  const btnCopyEthAddr = document.getElementById('btn-copy-eth-addr');
  const displayEthPriv = document.getElementById('display-eth-priv');
  const btnRevealEthPriv = document.getElementById('btn-reveal-eth-priv');
  const btnCopyEthPriv = document.getElementById('btn-copy-eth-priv');

  const displaySolAddress = document.getElementById('display-sol-address');
  const btnCopySolAddr = document.getElementById('btn-copy-sol-addr');
  const displaySolPriv = document.getElementById('display-sol-priv');
  const btnRevealSolPriv = document.getElementById('btn-reveal-sol-priv');
  const btnCopySolPriv = document.getElementById('btn-copy-sol-priv');
  const btnExportFullDossier = document.getElementById('btn-export-full-dossier');
  const btnExportFullHtml = document.getElementById('btn-export-full-html');
  const btnExportFullJson = document.getElementById('btn-export-full-json');

  // Audio Context Synthesizer
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playDiceTapSound(isFinal) {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      const startFreq = isFinal ? 200 : (140 + getCryptoRandomInt(0, 80));
      const endFreq = isFinal ? 40 : 30;
      const duration = isFinal ? 0.08 : 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      gain.gain.setValueAtTime(isFinal ? 0.25 : 0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  function playHapticTick() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.02);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.02);
    } catch (e) {}
  }

  // Clean SVG Icons for Toasts & UI Notifications
  const toastSvgIcons = {
    info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    success: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    warning: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    error: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    copy: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    key: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-1-1l-4 4m0 0a5 5 0 1 0-7 7l-5 5v3h3l2-2v-2h2l2-2v-2l1-1a5 5 0 0 0 7-7z"></path></svg>',
    dice: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect><circle cx="8" cy="8" r="1.5" fill="currentColor"></circle><circle cx="16" cy="8" r="1.5" fill="currentColor"></circle><circle cx="12" cy="12" r="1.5" fill="currentColor"></circle><circle cx="8" cy="16" r="1.5" fill="currentColor"></circle><circle cx="16" cy="16" r="1.5" fill="currentColor"></circle></svg>',
    shield: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
    lock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    eye: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    download: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    refresh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>',
    file: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
  };

  // Toast Notification
  function showToast(message, iconKey) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    let iconSvg = toastSvgIcons.info;
    if (iconKey && toastSvgIcons[iconKey]) {
      iconSvg = toastSvgIcons[iconKey];
    } else if (iconKey && iconKey.includes('<svg')) {
      iconSvg = iconKey;
    }
    toast.innerHTML = '<span class="toast-icon">' + iconSvg + '</span><span>' + message + '</span>';
    toastHub.appendChild(toast);

    setTimeout(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      toast.style.transition = 'all 0.25s var(--ease-spring)';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

        if (toastHub.contains(toast)) toastHub.removeChild(toast);
      }, 260);
    }, 2400);
  }

  // Cryptographically Secure D6 Roll
  function getCryptoD6() {
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / 6) * 6;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return (rand % 6) + 1;
  }

  // 3D Rotations mapping
  const faceAngles = {
    1: { x: 0, y: 0 },
    2: { x: 0, y: 180 },
    3: { x: 0, y: -90 },
    4: { x: 0, y: 90 },
    5: { x: -90, y: 0 },
    6: { x: 90, y: 0 }
  };

  function animateDiceTumble(result) {
    if (isTumbling) return;
    isTumbling = true;
    diceScene.classList.add('is-tumbling');

    playDiceTapSound(false);
    setTimeout(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }
 playDiceTapSound(false); }, 100);
    setTimeout(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }
 playDiceTapSound(true); }, 280);

    const targetAngle = faceAngles[result];
    const extraSpinsX = getCryptoRandomInt(1, 2) * 360;
    const extraSpinsY = getCryptoRandomInt(1, 2) * 360;

    currentRotX = targetAngle.x + extraSpinsX;
    currentRotY = targetAngle.y + extraSpinsY;

    diceCube.style.transform = 'rotateX(' + currentRotX + 'deg) rotateY(' + currentRotY + 'deg)';

    setTimeout(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      diceScene.classList.remove('is-tumbling');
      isTumbling = false;
    }, 450);
  }

  // Record single roll with strict capacity validation
  function recordRoll(val) {
    if (rollsHistory.length >= targetRolls) {
      showToast('Capacidad maxima alcanzada (' + targetRolls + ' tiradas)', 'warning');
      return false;
    }
    rollsHistory.push(val);
    displayLastVal.textContent = val;
    renderUI();
    return true;
  }

  // Record multiple rolls with strict capacity truncation
  function recordBulkRolls(values) {
    const remaining = targetRolls - rollsHistory.length;
    if (remaining <= 0) {
      showToast('Ya se completaron las ' + targetRolls + ' tiradas requeridas', 'warning');
      return;
    }

    const toAdd = values.slice(0, remaining);
    rollsHistory = rollsHistory.concat(toAdd);
    const last = toAdd[toAdd.length - 1];
    displayLastVal.textContent = last;
    animateDiceTumble(last);
    renderUI();

    if (values.length > remaining) {
      showToast('Se cargaron ' + remaining + ' tiradas hasta alcanzar el limite de ' + targetRolls, 'ℹ️');
    }
  }

  // Undo Last Roll
  function undoLastRoll() {
    if (rollsHistory.length === 0) return;
    resetClearButton();
    const removed = rollsHistory.pop();
    displayLastVal.textContent = rollsHistory.length > 0 ? rollsHistory[rollsHistory.length - 1] : '—';
    playHapticTick();
    showToast('Tirada #' + (rollsHistory.length + 1) + ' (' + removed + ') deshecha', '↩️');
    renderUI();
  }

  function resetClearButton() {
    if (clearConfirmTimeout) {
      clearTimeout(clearConfirmTimeout);
      clearConfirmTimeout = null;
    }
    btnClearAll.classList.remove('confirm-state');
    btnClearAll.innerHTML = '<span>Limpiar Todo</span>';
  }

  // Render Step 1 UI & Update Control State
  function renderUI() {
    const count = rollsHistory.length;
    statCurrentRolls.textContent = count;
    statTargetRolls.textContent = targetRolls;

    const entropy = (count * 2.58496).toFixed(2);
    statEntropyBits.textContent = entropy;

    const pct = Math.min(100, Math.round((count / targetRolls) * 100));
    gaugeFill.style.width = pct + '%';
    gaugePctText.textContent = pct + '% completado (' + entropy + ' bits)';

    const rem = targetRolls - count;
    const isComplete = (count >= targetRolls);

    btnUndoRoll.disabled = (count === 0);
    btnClearAll.disabled = (count === 0);

    btnRoll1.disabled = isComplete;
    btnRoll5.disabled = isComplete;
    btnRollComplete.disabled = isComplete;
    btnApplyBatch.disabled = isComplete;
    inputBatch.disabled = isComplete;

    keysD6.forEach(function(key) {
      key.disabled = isComplete;
    });

    if (rem > 0) {
      gaugeStatusText.textContent = 'Faltan ' + rem + ' tiradas para completar la entropia BIP-39 (' + targetWords + ' palabras)';
      statSecurityBadge.className = 'security-level-tag level-pending';
      statSecurityLabel.textContent = count > 10 ? 'Recolectando...' : 'Inicializando';
      btnProceedStep2.disabled = true;
    } else {
      gaugeStatusText.textContent = 'Entropia analitica completa. Grado militar ' + (targetWords === 12 ? '128-bit' : '256-bit') + ' alcanzado.';
      statSecurityBadge.className = 'security-level-tag level-secure';
      statSecurityLabel.textContent = 'Listo para SHA-256';
      btnProceedStep2.disabled = false;
    }

    chipCounterBadge.textContent = count + ' / ' + targetRolls + ' registrados';

    if (count === 0) {
      tapeScrollArena.innerHTML = '';
      tapeScrollArena.appendChild(emptyStateNotice);
      rawEntropyString.textContent = '--';
    } else {
      if (tapeScrollArena.contains(emptyStateNotice)) {
        tapeScrollArena.removeChild(emptyStateNotice);
      }
      tapeScrollArena.innerHTML = '';
      rollsHistory.forEach(function(r, idx) {
        const chip = document.createElement('span');
        chip.className = 'entropy-chip';
        chip.textContent = r;
        chip.title = 'Tirada #' + (idx + 1) + ' · Valor: ' + r;
        tapeScrollArena.appendChild(chip);
      });
      tapeScrollArena.scrollTop = tapeScrollArena.scrollHeight;
      rawEntropyString.textContent = rollsHistory.join('');
    }
  }

  // Audio Toggle
  function updateAudioButton() {
    const onIcon = btnAudioToggle.querySelector('.audio-on-icon');
    const offIcon = btnAudioToggle.querySelector('.audio-off-icon');
    const label = btnAudioToggle.querySelector('.audio-label');

    if (isSoundEnabled) {
      btnAudioToggle.classList.add('active');
      onIcon.style.display = 'block';
      offIcon.style.display = 'none';
      label.textContent = 'FX On';
    } else {
      btnAudioToggle.classList.remove('active');
      onIcon.style.display = 'none';
      offIcon.style.display = 'block';
      label.textContent = 'Muted';
    }
  }

  btnAudioToggle.addEventListener('click', function() {
    isSoundEnabled = !isSoundEnabled;
    localStorage.setItem('krypton_audio_fx', isSoundEnabled ? 'true' : 'false');
    updateAudioButton();
    if (isSoundEnabled) playHapticTick();
    showToast(isSoundEnabled ? 'Efectos de sonido activados' : 'Sonido silenciado', 'info');
  });

  // Mode Selection
  btnMode12.addEventListener('click', function() {
    if (targetWords === 12) return;
    resetClearButton();
    targetRolls = 50;
    targetWords = 12;
    btnMode12.classList.add('is-active');
    btnMode24.classList.remove('is-active');
    rollsHistory = [];
    displayLastVal.textContent = '—';
    diceCube.style.transform = 'rotateX(-20deg) rotateY(-30deg)';
    playHapticTick();
    renderUI();
    showToast('Modo 12 palabras activo (50 tiradas D6)', 'dice');
  });

  btnMode24.addEventListener('click', function() {
    if (targetWords === 24) return;
    resetClearButton();
    targetRolls = 100;
    targetWords = 24;
    btnMode24.classList.add('is-active');
    btnMode12.classList.remove('is-active');
    rollsHistory = [];
    displayLastVal.textContent = '—';
    diceCube.style.transform = 'rotateX(-20deg) rotateY(-30deg)';
    playHapticTick();
    renderUI();
    showToast('Modo 24 palabras activo (100 tiradas D6)', 'shield');
  });

  // Action Buttons
  btnRoll1.addEventListener('click', function() {
    if (rollsHistory.length >= targetRolls) {
      showToast('Ya alcanzaste el limite de ' + targetRolls + ' tiradas', 'warning');
      return;
    }
    const res = getCryptoD6();
    animateDiceTumble(res);
    recordRoll(res);
  });

  btnRoll5.addEventListener('click', function() {
    if (rollsHistory.length >= targetRolls) {
      showToast('Ya alcanzaste el limite de ' + targetRolls + ' tiradas', 'warning');
      return;
    }
    const batch = [];
    for (let i = 0; i < 5; i++) batch.push(getCryptoD6());
    recordBulkRolls(batch);
  });

  btnRollComplete.addEventListener('click', function() {
    if (rollsHistory.length >= targetRolls) {
      showToast('Ya alcanzaste el limite de ' + targetRolls + ' tiradas', 'warning');
      return;
    }
    const needed = targetRolls - rollsHistory.length;
    const batch = [];
    for (let i = 0; i < needed; i++) batch.push(getCryptoD6());
    recordBulkRolls(batch);
    showToast('Tiradas completadas (' + targetRolls + ') con Web Crypto API', 'success');
  });

  btnUndoRoll.addEventListener('click', undoLastRoll);

  // Clear All Button (2-step confirmation)
  btnClearAll.addEventListener('click', function() {
    if (rollsHistory.length === 0) return;

    if (!btnClearAll.classList.contains('confirm-state')) {
      btnClearAll.classList.add('confirm-state');
      btnClearAll.innerHTML = '<span>¿Confirmar Borrado?</span>';
      playHapticTick();

      clearConfirmTimeout = setTimeout(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

        resetClearButton();
      }, 3500);
    } else {
      resetClearButton();
      rollsHistory = [];
      displayLastVal.textContent = '—';
      diceCube.style.transform = 'rotateX(-20deg) rotateY(-30deg)';
      playHapticTick();
      renderUI();
      showToast('Cadena de entropia borrada por completo', 'refresh');
    }
  });

  keysD6.forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (rollsHistory.length >= targetRolls) {
        showToast('No se pueden añadir mas tiradas (Limite: ' + targetRolls + ')', 'warning');
        return;
      }
      const val = parseInt(btn.dataset.d6, 10);
      animateDiceTumble(val);
      recordRoll(val);
    });
  });

  btnApplyBatch.addEventListener('click', function() {
    if (rollsHistory.length >= targetRolls) {
      showToast('No se pueden añadir mas tiradas (Limite: ' + targetRolls + ')', 'warning');
      return;
    }
    const raw = inputBatch.value.trim();
    if (!raw) return;
    const valid = raw.split('').filter(function(ch) {
      return ch >= '1' && ch <= '6';
    }).map(Number);

    if (valid.length === 0) {
      showToast('Ingresa solo digitos del 1 al 6', 'warning');
      return;
    }

    recordBulkRolls(valid);
    inputBatch.value = '';
  });

  btnCopySeq.addEventListener('click', function() {
    if (rollsHistory.length === 0) return;
    const seq = rollsHistory.join('');
    navigator.clipboard.writeText(seq).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Cadena copiada al portapapeles', 'copy');
    });
  });

  // ==========================================================================
  // STEP 2: CRYPTOGRAPHIC COMPUTATION (SHA-256 & BIP-39 CHECKSUM)
  // ==========================================================================

  function bufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  function bytesToBinaryString(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) {
      bin += bytes[i].toString(2).padStart(8, '0');
    }
    return bin;
  }

  async function computeBIP39Step2() {
    const diceString = rollsHistory.join('');
    const encoder = new TextEncoder();
    const diceBytes = encoder.encode(diceString);

    const firstHashBuffer = await window.crypto.subtle.digest('SHA-256', diceBytes);
    const fullHex = bufferToHex(firstHashBuffer);
    const fullBytes = new Uint8Array(firstHashBuffer);

    const entropyByteLen = (targetWords === 12) ? 16 : 32;
    const entropyBitsCount = entropyByteLen * 8;
    const checksumBitsCount = entropyBitsCount / 32;

    const entropyBytes = fullBytes.slice(0, entropyByteLen);
    const entropyBinary = bytesToBinaryString(entropyBytes);

    const checksumHashBuffer = await window.crypto.subtle.digest('SHA-256', entropyBytes);
    const checksumHashBytes = new Uint8Array(checksumHashBuffer);
    const checksumFullBinary = bytesToBinaryString(checksumHashBytes);
    const checksumBits = checksumFullBinary.substring(0, checksumBitsCount);

    const totalBinary = entropyBinary + checksumBits;

    const chunks = [];
    for (let i = 0; i < targetWords; i++) {
      const start = i * 11;
      const end = start + 11;
      const chunkBits = totalBinary.substring(start, end);
      const decValue = parseInt(chunkBits, 2);
      const isLastChunk = (i === targetWords - 1);

      chunks.push({
        index: i + 1,
        bits: chunkBits,
        decimal: decValue,
        hasChecksum: isLastChunk,
        chkBitsLength: isLastChunk ? checksumBitsCount : 0
      });
    }

    return {
      rawDiceString: diceString,
      diceSha256Hex: fullHex,
      entropyByteLen: entropyByteLen,
      entropyBitsCount: entropyBitsCount,
      checksumBitsCount: checksumBitsCount,
      entropyBinary: entropyBinary,
      checksumBits: checksumBits,
      totalBinary: totalBinary,
      chunks: chunks
    };
  }

  async function renderStep2View() {
    displaySha256Hex.textContent = 'Procesando algoritmo SHA-256...';
    elevenBlocksContainer.innerHTML = '';

    computedCryptoData = await computeBIP39Step2();

    displaySha256Hex.textContent = computedCryptoData.diceSha256Hex;

    bitsSummaryLabel.textContent = computedCryptoData.entropyBitsCount + ' bits entropia + ' + 
                                  computedCryptoData.checksumBitsCount + ' bits Checksum = ' + 
                                  computedCryptoData.totalBinary.length + ' bits totales';

    legendEntropyText.textContent = 'Entropia (' + computedCryptoData.entropyBitsCount + ' bits)';
    legendChecksumText.textContent = 'Checksum (' + computedCryptoData.checksumBitsCount + ' bits)';
    chkBitsCount.textContent = computedCryptoData.checksumBitsCount;
    blockCountBadge.textContent = computedCryptoData.chunks.length + ' Bloques de 11 bits';

    displayBitstream.innerHTML = '';
    const spanEntropy = document.createElement('span');
    spanEntropy.className = 'bit-entropy';
    spanEntropy.textContent = computedCryptoData.entropyBinary;

    const spanChecksum = document.createElement('span');
    spanChecksum.className = 'bit-checksum';
    spanChecksum.textContent = computedCryptoData.checksumBits;
    spanChecksum.title = 'Checksum criptografico (' + computedCryptoData.checksumBitsCount + ' bits)';

    displayBitstream.appendChild(spanEntropy);
    displayBitstream.appendChild(document.createTextNode(' '));
    displayBitstream.appendChild(spanChecksum);

    computedCryptoData.chunks.forEach(function(chunk) {
      const card = document.createElement('div');
      card.className = 'eleven-card' + (chunk.hasChecksum ? ' has-checksum' : '');

      const head = document.createElement('div');
      head.className = 'eleven-card-head';
      head.innerHTML = '<span class="card-index">Palabra #' + String(chunk.index).padStart(2, '0') + '</span>' + 
                       (chunk.hasChecksum ? '<span class="card-chk-tag">+' + chunk.chkBitsLength + 'b Checksum</span>' : '');

      const bitsRow = document.createElement('div');
      bitsRow.className = 'card-bits-row';

      if (chunk.hasChecksum) {
        const normalPart = chunk.bits.substring(0, 11 - chunk.chkBitsLength);
        const chkPart = chunk.bits.substring(11 - chunk.chkBitsLength);
        bitsRow.innerHTML = normalPart + '<span class="chk-part">' + chkPart + '</span>';
      } else {
        bitsRow.textContent = chunk.bits;
      }

      const decRow = document.createElement('div');
      decRow.className = 'card-decimal-row';
      decRow.innerHTML = '<span class="dec-label">Indice Decimal (0-2047):</span>' +
                         '<span class="dec-val">' + chunk.decimal + '</span>';

      card.appendChild(head);
      card.appendChild(bitsRow);
      card.appendChild(decRow);
      elevenBlocksContainer.appendChild(card);
    });
  }

  // ==========================================================================
  // STEP 3: BIP-39 WORDLIST VAULT TRANSLATION
  // ==========================================================================

  function renderStep3View() {
    if (!computedCryptoData || !window.BIP39_WORDLIST) {
      alert('Error cargando el diccionario BIP-39.');
      return;
    }

    vaultWordsCountTag.textContent = computedCryptoData.chunks.length + ' Palabras (' + (targetWords === 12 ? '128-bit' : '256-bit') + ')';
    bip39WordsGrid.innerHTML = '';
    computedWords = [];

    computedCryptoData.chunks.forEach(function(chunk) {
      const word = window.BIP39_WORDLIST[chunk.decimal];
      computedWords.push(word);

      const card = document.createElement('div');
      card.className = 'word-card' + (chunk.hasChecksum ? ' has-checksum' : '');

      const top = document.createElement('div');
      top.className = 'word-card-top';
      top.innerHTML = '<span class="word-num">#' + String(chunk.index).padStart(2, '0') + '</span>' +
                      (chunk.hasChecksum ? '<span class="word-chk-badge">Checksum Integrado</span>' : '');

      const wordVal = document.createElement('div');
      wordVal.className = 'word-val';
      wordVal.textContent = word;

      const bottom = document.createElement('div');
      bottom.className = 'word-card-bottom';
      bottom.innerHTML = '<span class="word-idx-pill">Idx: ' + chunk.decimal + '</span>' +
                         '<span class="word-bits-pill">' + chunk.bits.substring(0, 6) + '...</span>';

      card.appendChild(top);
      card.appendChild(wordVal);
      card.appendChild(bottom);
      bip39WordsGrid.appendChild(card);
    });

    computedMnemonicString = computedWords.join(' ');
    seedPlaintextCode.textContent = computedMnemonicString;
  }

  // Toggle Mask / Privacy Blur
  btnToggleMask.addEventListener('click', function() {
    isSeedMasked = !isSeedMasked;
    const openIcon = btnToggleMask.querySelector('.eye-open-icon');
    const closedIcon = btnToggleMask.querySelector('.eye-closed-icon');

    if (isSeedMasked) {
      wordsGridWrapper.classList.add('is-masked');
      seedPlaintextContainer.classList.add('is-masked');
      openIcon.style.display = 'none';
      closedIcon.style.display = 'block';
      maskBtnText.textContent = 'Mostrar Semilla';
      showToast('Semilla oculta por privacidad', 'lock');
    } else {
      wordsGridWrapper.classList.remove('is-masked');
      seedPlaintextContainer.classList.remove('is-masked');
      openIcon.style.display = 'block';
      closedIcon.style.display = 'none';
      maskBtnText.textContent = 'Ocultar Semilla';
      showToast('Semilla visible en pantalla', 'eye');
    }
    playHapticTick();
  });

  // Copy Seed
  btnCopySeed.addEventListener('click', function() {
    if (!computedMnemonicString) return;
    navigator.clipboard.writeText(computedMnemonicString).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Frase semilla copiada (' + computedWords.length + ' palabras)', 'copy');
    });
  });

  // Download Safe Backup (.txt)
  btnDownloadBackup.addEventListener('click', function() {
    if (!computedMnemonicString) return;

    let content = '============================================================\n';
    content += '  KRYPTONSEED · RESPALDO DE SEGURIDAD BIP-39 (OFFLINE)\n';
    content += '============================================================\n\n';
    content += 'Fecha de generacion: ' + new Date().toISOString() + '\n';
    content += 'Longitud: ' + computedWords.length + ' palabras (' + (targetWords === 12 ? '128-bit' : '256-bit') + ' entropia)\n';
    content += 'Cadena de Dados D6 Origen: ' + computedCryptoData.rawDiceString + '\n';
    content += 'Hash SHA-256 Dados: ' + computedCryptoData.diceSha256Hex + '\n\n';
    content += '------------------------------------------------------------\n';
    content += 'FRASE SEMILLA MNEMONICA (BIP-39):\n';
    content += '------------------------------------------------------------\n';

    computedWords.forEach(function(w, i) {
      content += String(i + 1).padStart(2, ' ') + '. ' + w.padEnd(14, ' ') + ' (Indice: ' + computedCryptoData.chunks[i].decimal + ')\n';
    });

    content += '\nTexto continuo para importar:\n';
    content += computedMnemonicString + '\n\n';
    content += '============================================================\n';
    content += 'AVISO CRITICO DE SEGURIDAD:\n';
    content += '- Nunca compartas estas palabras con nadie.\n';
    content += '- Ningun soporte tecnico ni exchange te pedira tu semilla.\n';
    content += '- Guardala preferiblemente en papel o placa de metal resistente al fuego.\n';
    content += '============================================================\n';

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kryptonseed-bip39-backup-' + computedWords.length + 'words.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Archivo de respaldo descargado con exito', 'download');
    playHapticTick();
  });

  // ==========================================================================
  // STEP 4: MULTICHAIN DERIVATION (BTC, ETH, SOL)
  // ==========================================================================

  function renderStep4View() {
    if (!window.MultiChainCrypto || !computedMnemonicString) {
      showToast('Error cargando el motor multichain', 'warning');
      return;
    }

    try {
      derivedChainsData = window.MultiChainCrypto.deriveAllChains(computedMnemonicString, currentPassphrase);

      // Display Master Seed
      displayMasterSeed.textContent = derivedChainsData.masterSeedHex;

      // Bitcoin
      displayBtcAddress.textContent = derivedChainsData.bitcoin.nativeSegwit.address;
      displayBtcWif.textContent = derivedChainsData.bitcoin.nativeSegwit.wif;

      // Ethereum & EVM
      displayEthAddress.textContent = derivedChainsData.ethereum.address;
      displayEthPriv.textContent = derivedChainsData.ethereum.privateKey;

      // Solana
      displaySolAddress.textContent = derivedChainsData.solana.address;
      displaySolPriv.textContent = derivedChainsData.solana.privateKeyBase58;

      // Reset Private Key Visibility states to blurred
      isBtcWifRevealed = false;
      isEthPrivRevealed = false;
      isSolPrivRevealed = false;
      updatePrivKeyDisplayState(displayBtcWif, btnRevealBtcWif, isBtcWifRevealed);
      updatePrivKeyDisplayState(displayEthPriv, btnRevealEthPriv, isEthPrivRevealed);
      updatePrivKeyDisplayState(displaySolPriv, btnRevealSolPriv, isSolPrivRevealed);

    } catch (e) {
      console.error(e);
      showToast('Error en la derivacion criptografica: ' + e.message, 'warning');
    }
  }

  function updatePrivKeyDisplayState(el, btn, isRevealed) {
    if (isRevealed) {
      el.classList.remove('is-blurred');
      btn.textContent = 'Ocultar';
    } else {
      el.classList.add('is-blurred');
      btn.textContent = 'Mostrar';
    }
  }

  // Passphrase visibility toggle
  btnTogglePassVisibility.addEventListener('click', function() {
    if (inputPassphrase.type === 'password') {
      inputPassphrase.type = 'text';
      btnTogglePassVisibility.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
    } else {
      inputPassphrase.type = 'password';
      btnTogglePassVisibility.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
    }
  });

  // PLAUSIBLE DENIABILITY & DECOY WALLET SUITE ($5 WRENCH ATTACK DEFENSE)
  const btnGenDicewarePass = document.getElementById('btn-gen-diceware-pass');
  const passphraseStrengthFill = document.getElementById('passphrase-strength-fill');
  const passphraseStrengthLabel = document.getElementById('passphrase-strength-label');

  const vaultWorldTabs = document.querySelectorAll('#vault-world-tabs .vault-world-tab');
  const dualWorldComparisonStage = document.getElementById('dual-world-comparison-stage');

  const decoyBtcAddr = document.getElementById('decoy-btc-addr');
  const decoyEthAddr = document.getElementById('decoy-eth-addr');
  const decoyMasterSeed = document.getElementById('decoy-master-seed');

  const secretBtcAddr = document.getElementById('secret-btc-addr');
  const secretEthAddr = document.getElementById('secret-eth-addr');
  const secretMasterSeed = document.getElementById('secret-master-seed');
  const secretPassphraseDisplay = document.getElementById('secret-passphrase-display');

  let currentActiveWorld = 'secret'; // 'secret' | 'decoy' | 'compare'

  function calculatePassphraseStrength(pass) {
    if (!pass || pass.length === 0) {
      return { pct: 0, text: 'Sin contraseña adicional (Billetera visible por defecto)', color: 'var(--cyan-accent)' };
    }
    const len = pass.length;
    let score = len * 4;
    if (/[A-Z]/.test(pass)) score += 10;
    if (/[0-9]/.test(pass)) score += 10;
    if (/[^A-Za-z0-9]/.test(pass)) score += 15;

    if (score < 35) {
      return { pct: 25, text: 'Débil (Vulnerable a ataques de diccionario GPU)', color: '#ff6b6b' };
    } else if (score < 65) {
      return { pct: 60, text: 'Buena seguridad (~50 bits de entropía)', color: 'var(--amber-gold)' };
    } else {
      return { pct: 100, text: 'Blindaje militar (Inmune a fuerza bruta / Negación plausible plena)', color: '#00e676' };
    }
  }

  function updatePassphraseStrengthUI() {
    const pass = inputPassphrase ? inputPassphrase.value : '';
    const strength = calculatePassphraseStrength(pass);
    if (passphraseStrengthFill) {
      passphraseStrengthFill.style.width = strength.pct + '%';
      passphraseStrengthFill.style.backgroundColor = strength.color;
    }
    if (passphraseStrengthLabel) {
      passphraseStrengthLabel.textContent = strength.text;
      passphraseStrengthLabel.style.color = strength.color;
    }
  }

  function updateDualWorldComparison() {
    if (!window.MultiChainCrypto || !window.MultiChainCrypto.deriveAllChains || !computedMnemonicString) return;

    try {
      // 1. Mundo Señuelo (Decoy: pass = '')
      const decoyData = window.MultiChainCrypto.deriveAllChains(computedMnemonicString, '');
      if (decoyBtcAddr) decoyBtcAddr.textContent = decoyData.bitcoin.nativeSegwit.address;
      if (decoyEthAddr) decoyEthAddr.textContent = decoyData.ethereum.address;
      if (decoyMasterSeed) decoyMasterSeed.textContent = decoyData.masterSeedHex.slice(0, 36) + '...';

      // 2. Mundo Secreto (Secret: pass = currentPassphrase)
      const currentPass = inputPassphrase ? inputPassphrase.value.trim() : currentPassphrase;
      const secretPass = currentPass || 'EjemploPassphrase2026!';
      const secretData = window.MultiChainCrypto.deriveAllChains(computedMnemonicString, secretPass);

      if (secretBtcAddr) secretBtcAddr.textContent = secretData.bitcoin.nativeSegwit.address;
      if (secretEthAddr) secretEthAddr.textContent = secretData.ethereum.address;
      if (secretMasterSeed) secretMasterSeed.textContent = secretData.masterSeedHex.slice(0, 36) + '...';
      if (secretPassphraseDisplay) secretPassphraseDisplay.textContent = `"${secretPass}"`;
    } catch (e) {
      console.error('[Dual World Comparison Error]:', e);
    }
  }

  function setVaultWorld(world) {
    playHapticTick();
    currentActiveWorld = world;
    vaultWorldTabs.forEach(t => {
      if (t.getAttribute('data-world') === world) {
        t.classList.add('is-active');
      } else {
        t.classList.remove('is-active');
      }
    });

    if (world === 'compare') {
      if (dualWorldComparisonStage) dualWorldComparisonStage.style.display = 'grid';
      updateDualWorldComparison();
      showToast('Visualizando comparativa de ambos mundos criptográficos en paralelo', 'info');
    } else if (world === 'decoy') {
      if (dualWorldComparisonStage) dualWorldComparisonStage.style.display = 'none';
      currentPassphrase = '';
      if (inputPassphrase) inputPassphrase.value = '';
      updatePassphraseStrengthUI();
      renderStep4View();
      showToast('Modo Billetera Señuelo activo (Sin Passphrase · Para defensa bajo coacción)', 'success');
    } else if (world === 'secret') {
      if (dualWorldComparisonStage) dualWorldComparisonStage.style.display = 'none';
      if (inputPassphrase && !inputPassphrase.value) {
        inputPassphrase.value = 'MiBovedaSecreta2026!';
      }
      currentPassphrase = inputPassphrase ? inputPassphrase.value.trim() : '';
      updatePassphraseStrengthUI();
      renderStep4View();
      showToast('Modo Bóveda Secreta activo (Con Palabra 25 protegida)', 'success');
    }
  }

  // Bind World Tabs
  vaultWorldTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      setVaultWorld(tab.getAttribute('data-world'));
    });
  });

  // Diceware Passphrase Suggestion
  if (btnGenDicewarePass && inputPassphrase) {
    btnGenDicewarePass.addEventListener('click', function() {
      playHapticTick();
      if (!window.BIP39_WORDLIST) return;
      const r = new Uint32Array(4);
      window.crypto.getRandomValues(r);
      const chosenWords = [
        window.BIP39_WORDLIST[r[0] % 2048],
        window.BIP39_WORDLIST[r[1] % 2048],
        window.BIP39_WORDLIST[r[2] % 2048],
        window.BIP39_WORDLIST[r[3] % 2048]
      ];
      const suggested = chosenWords.join('-') + '!' + getCryptoRandomInt(10, 99);
      inputPassphrase.value = suggested;
      inputPassphrase.type = 'text';
      if (btnTogglePassVisibility) btnTogglePassVisibility.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
      updatePassphraseStrengthUI();
      if (currentActiveWorld === 'compare') {
        updateDualWorldComparison();
      }
      showToast('¡Passphrase segura tipo Diceware generada!', 'success');
    });
  }

  if (inputPassphrase) {
    inputPassphrase.addEventListener('input', function() {
      updatePassphraseStrengthUI();
      if (currentActiveWorld === 'compare') {
        updateDualWorldComparison();
      }
    });
  }

  // Apply Passphrase recalculation
  btnApplyPassphrase.addEventListener('click', function() {
    currentPassphrase = inputPassphrase ? inputPassphrase.value.trim() : '';
    renderStep4View();
    if (currentActiveWorld === 'compare') {
      updateDualWorldComparison();
    }
    playHapticTick();
    showToast(currentPassphrase ? 'Bóveda Secreta derivada con la Palabra 25' : 'Billetera restablecida sin Passphrase (Señuelo)', 'key');
  });

  // Copy Master Seed
  btnCopyMasterSeed.addEventListener('click', function() {
    if (!derivedChainsData) return;
    navigator.clipboard.writeText(derivedChainsData.masterSeedHex).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Semilla Maestra 512-bit copiada al portapapeles', 'copy');
    });
  });

  // Bitcoin Copy & Reveal
  btnCopyBtcAddr.addEventListener('click', function() {
    if (!derivedChainsData) return;
    navigator.clipboard.writeText(derivedChainsData.bitcoin.nativeSegwit.address).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Dirección Bitcoin SegWit copiada', '₿');
    });
  });

  btnRevealBtcWif.addEventListener('click', function() {
    isBtcWifRevealed = !isBtcWifRevealed;
    updatePrivKeyDisplayState(displayBtcWif, btnRevealBtcWif, isBtcWifRevealed);
    playHapticTick();
  });

  btnCopyBtcWif.addEventListener('click', function() {
    if (!derivedChainsData) return;
    navigator.clipboard.writeText(derivedChainsData.bitcoin.nativeSegwit.wif).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Llave Privada WIF de Bitcoin copiada', 'key');
    });
  });

  // Ethereum Copy & Reveal
  btnCopyEthAddr.addEventListener('click', function() {
    if (!derivedChainsData) return;
    navigator.clipboard.writeText(derivedChainsData.ethereum.address).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Dirección Ethereum copiada', 'key');
    });
  });

  btnRevealEthPriv.addEventListener('click', function() {
    isEthPrivRevealed = !isEthPrivRevealed;
    updatePrivKeyDisplayState(displayEthPriv, btnRevealEthPriv, isEthPrivRevealed);
    playHapticTick();
  });

  btnCopyEthPriv.addEventListener('click', function() {
    if (!derivedChainsData) return;
    navigator.clipboard.writeText(derivedChainsData.ethereum.privateKey).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Llave Privada de Ethereum copiada', 'key');
    });
  });

  // Solana Copy & Reveal
  btnCopySolAddr.addEventListener('click', function() {
    if (!derivedChainsData) return;
    navigator.clipboard.writeText(derivedChainsData.solana.address).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Dirección Solana copiada', '◎');
    });
  });

  btnRevealSolPriv.addEventListener('click', function() {
    isSolPrivRevealed = !isSolPrivRevealed;
    updatePrivKeyDisplayState(displaySolPriv, btnRevealSolPriv, isSolPrivRevealed);
    playHapticTick();
  });

  btnCopySolPriv.addEventListener('click', function() {
    if (!derivedChainsData) return;
    navigator.clipboard.writeText(derivedChainsData.solana.privateKeyBase58).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Llave Privada Phantom (Solana) copiada', 'key');
    });
  });

  // ==========================================================================
  // MULTICHAIN DOSSIER EXPORT ENGINE (HTML FORMATEADO, JSON Y TXT CRLF)
  // ==========================================================================

  // 1. Export Formatted Standalone HTML Dossier
  function exportDossierHTML() {
    if (!derivedChainsData || !computedMnemonicString) return;
    playHapticTick();

    const dateStr = new Date().toISOString().slice(0, 10);
    const fullTimeStr = new Date().toUTCString();

    const wordsTableRows = computedWords.map((w, idx) => {
      const chunk = computedCryptoData.chunks ? computedCryptoData.chunks[idx] : null;
      const dec = chunk ? chunk.decimal : '—';
      const bits = chunk ? chunk.bits : '—';
      return `
        <tr>
          <td style="font-weight:700; color:#0284c7; padding:8px 12px; border-bottom:1px solid #eee;">#${idx + 1}</td>
          <td style="font-weight:700; font-size:15px; color:#111; padding:8px 12px; border-bottom:1px solid #eee;">${escapeHTML(w)}</td>
          <td style="font-family:'JetBrains Mono',monospace; font-size:12px; color:#555; padding:8px 12px; border-bottom:1px solid #eee;">${dec}</td>
          <td style="font-family:'JetBrains Mono',monospace; font-size:11px; color:#777; padding:8px 12px; border-bottom:1px solid #eee;">${bits}</td>
        </tr>`;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KryptonSeed - Dossier Multichain BIP-39 (${dateStr})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      padding: 32px 20px;
    }
    .dossier-wrapper {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      padding: 40px;
    }
    .dossier-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #0f172a;
    }
    .brand-sub {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .meta-badge {
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 28px 0 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1e293b;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .field-row {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
    }
    .field-row:last-child { margin-bottom: 0; }
    .field-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      margin-bottom: 3px;
    }
    .field-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #0f172a;
      word-break: break-all;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
    }
    .words-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .words-table th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      padding: 8px 12px;
      border-bottom: 2px solid #e2e8f0;
    }
    .warning-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      border-radius: 8px;
      margin-top: 32px;
      font-size: 13px;
      color: #92400e;
    }
    .print-bar {
      margin-bottom: 24px;
      display: flex;
      justify-content: flex-end;
    }
    .print-btn {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .dossier-wrapper { border: none; box-shadow: none; padding: 0; }
      .print-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF (Ctrl + P)</button>
  </div>
  <div class="dossier-wrapper">
    <div class="dossier-header">
      <div>
        <div class="brand-title">KRYPTONSEED</div>
        <div class="brand-sub">Dossier Criptográfico Multichain · Respaldo en Frío Institucional</div>
      </div>
      <div class="meta-badge">${escapeHTML(dateStr)}</div>
    </div>

    <div class="info-card">
      <div class="field-row">
        <span class="field-label">Fecha y Hora UTC:</span>
        <span class="field-value">${escapeHTML(fullTimeStr)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Longitud de Semilla:</span>
        <span class="field-value">${computedWords.length} Palabras (${targetWords === 12 ? '128 bits de entropía' : '256 bits de entropía'})</span>
      </div>
      <div class="field-row">
        <span class="field-label">Tiradas Físicas de Dados D6:</span>
        <span class="field-value">${escapeHTML(computedCryptoData.rawDiceString)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Hash SHA-256 de Verificación:</span>
        <span class="field-value">${escapeHTML(computedCryptoData.diceSha256Hex)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Passphrase BIP-39 (Palabra 25):</span>
        <span class="field-value">${currentPassphrase ? escapeHTML(currentPassphrase) : '[Ninguna - Cuenta Estándar / Señuelo]'}</span>
      </div>
    </div>

    <div class="section-title">1. Frase Semilla Mnemónica (BIP-39)</div>
    <div class="info-card" style="padding: 10px 14px;">
      <table class="words-table">
        <thead>
          <tr>
            <th>Posición</th>
            <th>Palabra BIP-39</th>
            <th>Índice Decimal</th>
            <th>Representación Binaria (11 bits)</th>
          </tr>
        </thead>
        <tbody>
          ${wordsTableRows}
        </tbody>
      </table>
    </div>

    <div class="section-title">2. Semilla Maestra Binaria (512 bits HMAC-SHA512)</div>
    <div class="info-card">
      <div class="field-row">
        <span class="field-label">Master Seed Hexadecimal:</span>
        <span class="field-value">${escapeHTML(derivedChainsData.masterSeedHex)}</span>
      </div>
    </div>

    <div class="section-title">3. Bitcoin (BTC) · Native SegWit</div>
    <div class="info-card">
      <div class="field-row">
        <span class="field-label">Estándar & Ruta de Derivación:</span>
        <span class="field-value">BIP-84 (prefijo bc1q) · ${escapeHTML(derivedChainsData.bitcoin.nativeSegwit.path)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Dirección Pública de Recepción:</span>
        <span class="field-value">${escapeHTML(derivedChainsData.bitcoin.nativeSegwit.address)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Llave Privada WIF (Formato de Importación):</span>
        <span class="field-value">${escapeHTML(derivedChainsData.bitcoin.nativeSegwit.wif)}</span>
      </div>
    </div>

    <div class="section-title">4. Ethereum & Redes EVM (ETH, Polygon, Arbitrum, Base, Optimism)</div>
    <div class="info-card">
      <div class="field-row">
        <span class="field-label">Estándar & Ruta de Derivación:</span>
        <span class="field-value">BIP-44 · ${escapeHTML(derivedChainsData.ethereum.path)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Dirección Pública EVM:</span>
        <span class="field-value">${escapeHTML(derivedChainsData.ethereum.address)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Llave Privada Hexadecimal (Para MetaMask / Rabby):</span>
        <span class="field-value">${escapeHTML(derivedChainsData.ethereum.privateKey)}</span>
      </div>
    </div>

    <div class="section-title">5. Solana (SOL)</div>
    <div class="info-card">
      <div class="field-row">
        <span class="field-label">Estándar & Ruta de Derivación:</span>
        <span class="field-value">SLIP-0010 ed25519 · ${escapeHTML(derivedChainsData.solana.path)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Dirección Pública Solana:</span>
        <span class="field-value">${escapeHTML(derivedChainsData.solana.address)}</span>
      </div>
      <div class="field-row">
        <span class="field-label">Llave Privada Base58 (Formato Phantom / CLI):</span>
        <span class="field-value">${escapeHTML(derivedChainsData.solana.privateKeyBase58)}</span>
      </div>
    </div>

    <div class="warning-box">
      <strong>REGLAS DE SEGURIDAD PARA ALMACENAMIENTO EN FRÍO:</strong>
      <ul style="margin-left: 20px; margin-top: 8px;">
        <li>Este documento contiene claves privadas que otorgan acceso total a tus fondos.</li>
        <li>Nunca subas este archivo a la nube, Google Drive, iCloud ni lo envíes por mensajería.</li>
        <li>Imprime este archivo en una impresora sin conexión a internet y guarda la copia física en una caja de seguridad resistente al fuego y agua.</li>
      </ul>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kryptonseed-dossier-multichain-${dateStr}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Dossier Visual (.html) descargado con éxito', 'download');
  }

  // 2. Export Structured JSON Dossier
  function exportDossierJSON() {
    if (!derivedChainsData || !computedMnemonicString) return;
    playHapticTick();

    const dateStr = new Date().toISOString().slice(0, 10);
    const jsonObj = {
      generator: 'KryptonSeed Institutional BIP-39 Entropy Foundry',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      entropy: {
        rawDiceString: computedCryptoData.rawDiceString,
        diceRollsCount: computedCryptoData.rawDiceString.length,
        sha256Hash: computedCryptoData.diceSha256Hex,
        entropyBits: targetWords === 12 ? 128 : 256
      },
      mnemonic: {
        wordCount: computedWords.length,
        words: computedWords,
        phrasePlaintext: computedMnemonicString,
        passphraseApplied: Boolean(currentPassphrase),
        passphrase: currentPassphrase || null
      },
      masterSeed512Hex: derivedChainsData.masterSeedHex,
      derivedAccounts: {
        bitcoin: {
          standard: 'BIP-84 Native SegWit',
          derivationPath: derivedChainsData.bitcoin.nativeSegwit.path,
          address: derivedChainsData.bitcoin.nativeSegwit.address,
          privateKeyWif: derivedChainsData.bitcoin.nativeSegwit.wif,
          compatibleWallets: ['Electrum', 'Sparrow', 'Trezor', 'Ledger', 'BlueWallet']
        },
        ethereum: {
          standard: 'BIP-44 EVM Multi-Chain',
          derivationPath: derivedChainsData.ethereum.path,
          address: derivedChainsData.ethereum.address,
          privateKeyHex: derivedChainsData.ethereum.privateKey,
          compatibleWallets: ['MetaMask', 'Rabby', 'Rainbow', 'Trust Wallet', 'Ledger']
        },
        solana: {
          standard: 'SLIP-0010 ed25519',
          derivationPath: derivedChainsData.solana.path,
          address: derivedChainsData.solana.address,
          privateKeyBase58: derivedChainsData.solana.privateKeyBase58,
          compatibleWallets: ['Phantom', 'Solflare', 'Backpack']
        }
      },
      securityNotice: 'CRITICAL: Contains private keys. Keep strictly offline.'
    };

    const jsonStr = JSON.stringify(jsonObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kryptonseed-dossier-multichain-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Dossier Estructurado (.json) descargado con éxito', 'download');
  }

  // 3. Export Formatted Plain Text Dossier (CRLF + UTF-8 BOM)
  function exportDossierTXT() {
    if (!derivedChainsData || !computedMnemonicString) return;
    playHapticTick();

    const dateStr = new Date().toISOString().slice(0, 10);
    const crlf = '\r\n';

    let content = '========================================================================' + crlf;
    content += '  KRYPTONSEED · DOSSIER CRIPTOGRAFICO MULTICHAIN COMPLETO (BIP-39 / BIP-44)' + crlf;
    content += '========================================================================' + crlf + crlf;
    content += 'Fecha de generacion: ' + new Date().toISOString() + crlf;
    content += 'Longitud mnemónica: ' + computedWords.length + ' palabras (' + (targetWords === 12 ? '128-bit' : '256-bit') + ')' + crlf;
    content += 'Tiradas de Dados D6: ' + computedCryptoData.rawDiceString + crlf;
    content += 'Hash SHA-256 Dados: ' + computedCryptoData.diceSha256Hex + crlf;
    content += 'Passphrase BIP-39 utilizada: ' + (currentPassphrase ? '"' + currentPassphrase + '"' : '[Ninguna - Por defecto]') + crlf + crlf;

    content += '------------------------------------------------------------------------' + crlf;
    content += '1. FRASE SEMILLA (BIP-39 MNEMONIC SEED):' + crlf;
    content += '------------------------------------------------------------------------' + crlf;
    content += computedMnemonicString + crlf + crlf;

    content += '------------------------------------------------------------------------' + crlf;
    content += '2. SEMILLA MAESTRA BINARIA (512 BITS PBKDF2 HMAC-SHA512):' + crlf;
    content += '------------------------------------------------------------------------' + crlf;
    content += derivedChainsData.masterSeedHex + crlf + crlf;

    content += '------------------------------------------------------------------------' + crlf;
    content += '3. BITCOIN (BTC):' + crlf;
    content += '------------------------------------------------------------------------' + crlf;
    content += '  Estándar: Native SegWit (BIP-84, prefijo bc1q)' + crlf;
    content += '  Derivation Path: ' + derivedChainsData.bitcoin.nativeSegwit.path + crlf;
    content += '  Dirección Pública: ' + derivedChainsData.bitcoin.nativeSegwit.address + crlf;
    content += '  Llave Privada WIF: ' + derivedChainsData.bitcoin.nativeSegwit.wif + crlf;
    content += '  Billeteras compatibles: Electrum, Sparrow, Trezor, Ledger, BlueWallet' + crlf + crlf;

    content += '------------------------------------------------------------------------' + crlf;
    content += '4. ETHEREUM & REDES EVM (ETH, BNB, MATIC, ARB, OP, BASE, AVAX):' + crlf;
    content += '------------------------------------------------------------------------' + crlf;
    content += '  Estándar: BIP-44 (EIP-55 Checksum Address)' + crlf;
    content += '  Derivation Path: ' + derivedChainsData.ethereum.path + crlf;
    content += '  Dirección Pública: ' + derivedChainsData.ethereum.address + crlf;
    content += '  Llave Privada Hex: ' + derivedChainsData.ethereum.privateKey + crlf;
    content += '  Billeteras compatibles: MetaMask, Rabby, Rainbow, Trust Wallet, Ledger' + crlf + crlf;

    content += '------------------------------------------------------------------------' + crlf;
    content += '5. SOLANA (SOL):' + crlf;
    content += '------------------------------------------------------------------------' + crlf;
    content += '  Estándar: SLIP-0010 (ed25519)' + crlf;
    content += '  Derivation Path: ' + derivedChainsData.solana.path + crlf;
    content += '  Dirección Pública: ' + derivedChainsData.solana.address + crlf;
    content += '  Llave Privada Base58 (Formato Phantom CLI): ' + derivedChainsData.solana.privateKeyBase58 + crlf;
    content += '  Billeteras compatibles: Phantom, Solflare, Backpack' + crlf + crlf;

    content += '========================================================================' + crlf;
    content += 'ADVERTENCIA DE SEGURIDAD CRITICA:' + crlf;
    content += 'Este archivo contiene claves privadas para transferir fondos reales.' + crlf;
    content += 'NUNCA lo envies por email, chat o almacenamiento en la nube no cifrado.' + crlf;
    content += '========================================================================' + crlf;

    // Use UTF-8 BOM (﻿) and CRLF for perfect Windows Notepad compatibility
    const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kryptonseed-dossier-multichain-${dateStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Dossier de Texto (.txt) descargado con éxito', 'download');
  }

  // Event Listeners for Export Options
  if (btnExportFullHtml) btnExportFullHtml.addEventListener('click', exportDossierHTML);
  if (btnExportFullJson) btnExportFullJson.addEventListener('click', exportDossierJSON);
  if (btnExportFullDossier) btnExportFullDossier.addEventListener('click', exportDossierTXT);


  // Restart flow
  btnRestartFlow.addEventListener('click', function() {
    if (confirm('¿Deseas reiniciar y generar una nueva semilla con dados? Asegúrate de haber guardado tu respaldo.')) {
      rollsHistory = [];
      displayLastVal.textContent = '—';
      diceCube.style.transform = 'rotateX(-20deg) rotateY(-30deg)';
      inputPassphrase.value = '';
      currentPassphrase = '';
      switchStep(1);
      renderUI();
      showToast('Flujo reiniciado. ¡Lanza tus dados!', 'dice');
    }
  });

  // Step Switching Navigator
  function switchStep(step) {
    currentStep = step;
    playHapticTick();

    viewStep1.style.display = 'none';
    viewStep2.style.display = 'none';
    viewStep3.style.display = 'none';
    viewStep4.style.display = 'none';

    if (step === 1) {
      viewStep1.style.display = 'block';

      pipelineStep1.className = 'pipeline-step is-active';
      pipelineStep2.className = 'pipeline-step is-idle';
      pipelineStep3.className = 'pipeline-step is-idle';
      pipelineStep4.className = 'pipeline-step is-idle';
      connector12.className = 'pipeline-connector';
      connector23.className = 'pipeline-connector';
      connector34.className = 'pipeline-connector';

      globalStatusText.textContent = 'Paso 1 · Entropía Cruda';
      globalStatusDot.style.background = 'var(--krypton-cyan)';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      viewStep2.style.display = 'block';

      pipelineStep1.className = 'pipeline-step is-completed';
      pipelineStep2.className = 'pipeline-step is-active';
      pipelineStep3.className = 'pipeline-step is-idle';
      pipelineStep4.className = 'pipeline-step is-idle';
      connector12.className = 'pipeline-connector is-active';
      connector23.className = 'pipeline-connector';
      connector34.className = 'pipeline-connector';

      globalStatusText.textContent = 'Paso 2 · SHA-256 & Checksum';
      globalStatusDot.style.background = 'var(--emerald-safe)';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      renderStep2View();
    } else if (step === 3) {
      viewStep3.style.display = 'block';

      pipelineStep1.className = 'pipeline-step is-completed';
      pipelineStep2.className = 'pipeline-step is-completed';
      pipelineStep3.className = 'pipeline-step is-active';
      pipelineStep4.className = 'pipeline-step is-idle';
      connector12.className = 'pipeline-connector is-active';
      connector23.className = 'pipeline-connector is-active';
      connector34.className = 'pipeline-connector';

      globalStatusText.textContent = 'Paso 3 · Diccionario BIP-39';
      globalStatusDot.style.background = 'var(--emerald-safe)';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      renderStep3View();
    } else if (step === 4) {
      viewStep4.style.display = 'block';

      pipelineStep1.className = 'pipeline-step is-completed';
      pipelineStep2.className = 'pipeline-step is-completed';
      pipelineStep3.className = 'pipeline-step is-completed';
      pipelineStep4.className = 'pipeline-step is-active';
      connector12.className = 'pipeline-connector is-active';
      connector23.className = 'pipeline-connector is-active';
      connector34.className = 'pipeline-connector is-active';

      globalStatusText.textContent = 'Paso 4 · Derivación Multichain';
      globalStatusDot.style.background = 'var(--krypton-cyan)';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      renderStep4View();
    }
  }

  // Navigation Event Handlers
  btnProceedStep2.addEventListener('click', function() {
    switchStep(2);
    showToast('Calculando SHA-256 y Checksum...', 'info');
  });

  btnBackStep1.addEventListener('click', function() { switchStep(1); });
  btnBackFooter.addEventListener('click', function() { switchStep(1); });

  btnProceedStep3.addEventListener('click', function() {
    switchStep(3);
    showToast('Mapeando palabras en el Diccionario Oficial...', 'info');
  });

  btnBackToStep2.addEventListener('click', function() { switchStep(2); });
  btnBackStep2Footer.addEventListener('click', function() { switchStep(2); });

  btnProceedStep4.addEventListener('click', function() {
    switchStep(4);
    showToast('Derivando billeteras multichain...', 'info');
  });

  btnBackToStep3.addEventListener('click', function() { switchStep(3); });
  btnBackStep3Footer.addEventListener('click', function() { switchStep(3); });

  btnCopySha256.addEventListener('click', function() {
    if (!computedCryptoData) return;
    navigator.clipboard.writeText(computedCryptoData.diceSha256Hex).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('Hash SHA-256 copiado al portapapeles', 'copy');
    });
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (currentStep === 1) {
      if (e.code === 'Space') {
        e.preventDefault();
        btnRoll1.click();
      } else if (e.key >= '1' && e.key <= '6') {
        if (rollsHistory.length >= targetRolls) {
          showToast('Límite alcanzado (' + targetRolls + '). Usa Deshacer o Limpiar para cambiar.', 'warning');
          return;
        }
        const val = parseInt(e.key, 10);
        animateDiceTumble(val);
        recordRoll(val);
      } else if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey) {
        undoLastRoll();
      }
    }

    if (e.key === 'm' || e.key === 'M') {
      btnAudioToggle.click();
    }
  });

  // Initialization
  updateAudioButton();
  renderUI();

  // ==========================================================================
  // MODULE NAVIGATION: SINGLE SEED VS MULTISIG VAULT
  // ==========================================================================
  const tabSingleSeed = document.getElementById('tab-single-seed');
  const tabMultisigVault = document.getElementById('tab-multisig-vault');
  const viewMultisigVault = document.getElementById('view-multisig-vault');
  const pipelineStepper = document.querySelector('.pipeline-stepper');

  function switchMainModule(moduleName) {
    playHapticTick();

    const tabSingle = document.getElementById('tab-single-seed');
    const tabMulti = document.getElementById('tab-multisig-vault');
    const tabRec = document.getElementById('tab-recovery-solver');
    const viewMulti = document.getElementById('view-multisig-vault');
    const viewRec = document.getElementById('view-recovery-solver');

    // Desactivar todas las pestañas
    if (tabSingle) {
      tabSingle.classList.remove('is-active');
      tabSingle.setAttribute('aria-selected', 'false');
    }
    if (tabMulti) {
      tabMulti.classList.remove('is-active');
      tabMulti.setAttribute('aria-selected', 'false');
    }
    if (tabRec) {
      tabRec.classList.remove('is-active');
      tabRec.setAttribute('aria-selected', 'false');
    }

    // Ocultar vistas de módulos independientes
    if (viewMulti) viewMulti.style.display = 'none';
    if (viewRec) viewRec.style.display = 'none';

    if (moduleName === 'single') {
      if (tabSingle) {
        tabSingle.classList.add('is-active');
        tabSingle.setAttribute('aria-selected', 'true');
      }
      if (pipelineStepper) pipelineStepper.style.display = 'flex';
      switchStep(currentStep);
    } else if (moduleName === 'multisig') {
      if (tabMulti) {
        tabMulti.classList.add('is-active');
        tabMulti.setAttribute('aria-selected', 'true');
      }

      viewStep1.style.display = 'none';
      viewStep2.style.display = 'none';
      viewStep3.style.display = 'none';
      viewStep4.style.display = 'none';
      if (pipelineStepper) pipelineStepper.style.display = 'none';

      if (viewMulti) viewMulti.style.display = 'block';
      if (globalStatusText) globalStatusText.textContent = 'Módulo · Bóveda Multifirma 2-de-3';
      if (globalStatusDot) globalStatusDot.style.background = 'var(--emerald-safe)';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      computeMultisigAddresses();
    } else if (moduleName === 'recovery') {
      if (tabRec) {
        tabRec.classList.add('is-active');
        tabRec.setAttribute('aria-selected', 'true');
      }

      viewStep1.style.display = 'none';
      viewStep2.style.display = 'none';
      viewStep3.style.display = 'none';
      viewStep4.style.display = 'none';
      if (pipelineStepper) pipelineStepper.style.display = 'none';

      if (viewRec) viewRec.style.display = 'block';
      if (globalStatusText) globalStatusText.textContent = 'Módulo · Recuperador de Checksum Inverso';
      if (globalStatusDot) globalStatusDot.style.background = 'var(--cyan-accent)';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const tabSingleSeedBtn = document.getElementById('tab-single-seed');
  const tabMultisigVaultBtn = document.getElementById('tab-multisig-vault');
  const tabRecoverySolverBtn = document.getElementById('tab-recovery-solver');

  if (tabSingleSeedBtn) {
    tabSingleSeedBtn.addEventListener('click', function() { switchMainModule('single'); });
  }
  if (tabMultisigVaultBtn) {
    tabMultisigVaultBtn.addEventListener('click', function() { switchMainModule('multisig'); });
  }
  if (tabRecoverySolverBtn) {
    tabRecoverySolverBtn.addEventListener('click', function() { switchMainModule('recovery'); });
  }

  // ==========================================================================
  // MULTISIG VAULT LOGIC & P2WSH ENGINE
  // ==========================================================================
  const btnSyncSigner1 = document.getElementById('btn-sync-signer-1');
  const btnRollSigner2 = document.getElementById('btn-roll-signer-2');
  const btnRollSigner3 = document.getElementById('btn-roll-signer-3');
  const btnComputeMultisig = document.getElementById('btn-compute-multisig');

  const signer1BtcPub = document.getElementById('signer-1-btc-pub');
  const signer1EthAddr = document.getElementById('signer-1-eth-addr');
  const signer2BtcPub = document.getElementById('signer-2-btc-pub');
  const signer2EthAddr = document.getElementById('signer-2-eth-addr');
  const signer3BtcPub = document.getElementById('signer-3-btc-pub');
  const signer3EthAddr = document.getElementById('signer-3-eth-addr');

  const displayBtcMultisigAddr = document.getElementById('display-btc-multisig-addr');
  const displayBtcDescriptor = document.getElementById('display-btc-descriptor');
  const displaySafeJson = document.getElementById('display-safe-json');
  const btnCopyBtcMultiAddr = document.getElementById('btn-copy-btc-multisig-addr');
  const btnCopyDescriptor = document.getElementById('btn-copy-descriptor');
  const btnCopySafeJson = document.getElementById('btn-copy-safe-json');
  const btnDownloadSparrowConfig = document.getElementById('btn-download-sparrow-config');

  let currentMultisigResult = null;

  if (btnSyncSigner1) {
    btnSyncSigner1.addEventListener('click', function() {
      if (derivedChainsData) {
        signer1BtcPub.value = derivedChainsData.bitcoin.nativeSegwit.pubKeyHex;
        signer1EthAddr.value = derivedChainsData.ethereum.address;
        showToast('Firmante 1 sincronizado con tu semilla de dados', 'refresh');
        computeMultisigAddresses();
      } else {
        showToast('Completa primero los pasos de dados para sincronizar tu clave', 'ℹ️');
      }
    });
  }

  function generateRandomD6DiceString(len) {
    const arr = [];
    for (let i = 0; i < len; i++) arr.push(getCryptoD6());
    return arr.join('');
  }

  async function rollKeyForSigner(btcInput, ethInput, label) {
    const dice = generateRandomD6DiceString(50);
    const enc = new TextEncoder();
    const hash = await window.crypto.subtle.digest('SHA-256', enc.encode(dice));
    const bytes = new Uint8Array(hash);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const pub = '02' + hex.substring(0, 64);
    const ethRaw = '0x' + hex.substring(24, 64);
    const ethChecksum = window.MultiChainCrypto ? window.MultiChainCrypto.toChecksumAddress(ethRaw) : ethRaw;

    btcInput.value = pub;
    ethInput.value = ethChecksum;
    showToast(label + ' generado con nueva tirada de dados', 'dice');
    computeMultisigAddresses();
  }

  if (btnRollSigner2) {
    btnRollSigner2.addEventListener('click', function() {
      rollKeyForSigner(signer2BtcPub, signer2EthAddr, 'Firmante B');
    });
  }

  if (btnRollSigner3) {
    btnRollSigner3.addEventListener('click', function() {
      rollKeyForSigner(signer3BtcPub, signer3EthAddr, 'Firmante C');
    });
  }

  function computeMultisigAddresses() {
    if (!window.MultiChainCrypto || !window.MultiChainCrypto.createBitcoinMultisig2of3) return;

    try {
      const p1 = signer1BtcPub.value.trim();
      const p2 = signer2BtcPub.value.trim();
      const p3 = signer3BtcPub.value.trim();

      const eth1 = signer1EthAddr.value.trim();
      const eth2 = signer2EthAddr.value.trim();
      const eth3 = signer3EthAddr.value.trim();

      currentMultisigResult = window.MultiChainCrypto.createBitcoinMultisig2of3([p1, p2, p3]);
      if (displayBtcMultisigAddr) displayBtcMultisigAddr.textContent = currentMultisigResult.address;
      if (displayBtcDescriptor) displayBtcDescriptor.textContent = currentMultisigResult.descriptor;

      const safeConfig = {
        name: "KryptonSeed Vault (2-of-3)",
        threshold: 2,
        owners: [eth1, eth2, eth3],
        networks: ["Arbitrum One", "Polygon", "Base", "Optimism", "Ethereum Mainnet"],
        quorum: "2 de 3 firmas requeridas",
        compatibleWallets: ["MetaMask", "Phantom (Modo EVM)", "Rabby", "Ledger"]
      };

      if (displaySafeJson) displaySafeJson.textContent = JSON.stringify(safeConfig, null, 2);

    } catch (e) {
      console.error(e);
      showToast('Error en el cálculo multifirma: ' + e.message, 'warning');
    }
  }

  if (btnComputeMultisig) {
    btnComputeMultisig.addEventListener('click', function() {
      computeMultisigAddresses();
      playHapticTick();
      showToast('Direcciones multifirma 2-de-3 recalculadas con éxito', 'info');
    });
  }

  if (btnCopyBtcMultiAddr) {
    btnCopyBtcMultiAddr.addEventListener('click', function() {
      if (!currentMultisigResult) return;
      navigator.clipboard.writeText(currentMultisigResult.address).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

        showToast('Dirección Bitcoin P2WSH copiada al portapapeles', '₿');
      });
    });
  }

  if (btnCopyDescriptor) {
    btnCopyDescriptor.addEventListener('click', function() {
      if (!currentMultisigResult) return;
      navigator.clipboard.writeText(currentMultisigResult.descriptor).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

        showToast('Descriptor copiado para Sparrow / Electrum', 'copy');
      });
    });
  }

  if (btnCopySafeJson) {
    btnCopySafeJson.addEventListener('click', function() {
      navigator.clipboard.writeText(displaySafeJson.textContent).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

        showToast('Configuración Safe copiada en formato JSON', 'key');
      });
    });
  }

  if (btnDownloadSparrowConfig) {
    btnDownloadSparrowConfig.addEventListener('click', function() {
      if (!currentMultisigResult) return;

      let conf = '====================================================================\n';
      conf += '  CONFIGURACION MULTIFIRMA BITCOIN 2-DE-3 (SPARROW / ELECTRUM)\n';
      conf += '====================================================================\n\n';
      conf += 'Fecha de exportación: ' + new Date().toISOString() + '\n';
      conf += 'Tipo de Script: P2WSH (Native SegWit Multisig)\n';
      conf += 'Quórum de firmas: 2 de 3\n\n';
      conf += 'DIRECCION MULTIFIRMA DE DEPOSITO:\n';
      conf += currentMultisigResult.address + '\n\n';
      conf += 'DESCRIPTOR DE SALIDA (OUTPUT DESCRIPTOR):\n';
      conf += currentMultisigResult.descriptor + '\n\n';
      conf += 'CLAVES PUBLICAS ORDENADAS (BIP-67):\n';
      currentMultisigResult.sortedPubKeys.forEach(function(pub, i) {
        conf += '  Cosigner #' + (i + 1) + ': ' + pub + '\n';
      });
      conf += '\nWITNESS SCRIPT (HEX):\n';
      conf += currentMultisigResult.witnessScriptHex + '\n\n';
      conf += '====================================================================\n';
      conf += 'INSTRUCCIONES DE IMPORTACION EN SPARROW WALLET:\n';
      conf += '1. Abre Sparrow Wallet -> File -> New Wallet.\n';
      conf += '2. Selecciona "Multi Signature" y Policy: 2 of 3.\n';
      conf += '3. Script Type: Native Segwit (P2WSH).\n';
      conf += '4. Pega los datos de cada cosigner de este archivo.\n';
      conf += '====================================================================\n';

      const blob = new Blob([conf], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kryptonseed-sparrow-multisig-2of3.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Configuración para Sparrow Wallet descargada con éxito', 'download');
      playHapticTick();
    });
  }

  // ==========================================================================
  // INTERACTIVE PSBT SIGNING SIMULATOR & WEB3 LIVE INTEGRATION (METAMASK + PHANTOM)
  const btnConnectMetamask = document.getElementById('btn-connect-metamask');
  const badgeMetamaskConn = document.getElementById('badge-metamask-conn');
  const btnConnectPhantom = document.getElementById('btn-connect-phantom');
  const badgePhantomConn = document.getElementById('badge-phantom-conn');

  const simSignaturesLog = document.getElementById('sim-signatures-log');
  const sigLogEntries = document.getElementById('sig-log-entries');
  const sigLogQuorumBadge = document.getElementById('sig-log-quorum-badge');

  let web3State = {
    metaMaskAccount: null,
    phantomAccount: null,
    collectedSignatures: {}
  };

  async function connectMetaMaskWallet() {
    playHapticTick();
    if (typeof window.ethereum === 'undefined') {
      showToast('MetaMask no detectado. Puedes instalarlo desde metamask.io o usar las llaves simuladas.', 'warning');
      return;
    }

    try {
      showToast('Solicitando conexión a MetaMask...', 'info');
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || !accounts.length) return;

      web3State.metaMaskAccount = accounts[0];
      const signer2EthAddr = document.getElementById('signer-2-eth-addr');
      if (signer2EthAddr) signer2EthAddr.value = accounts[0];

      if (btnConnectMetamask) {
        btnConnectMetamask.classList.add('is-connected');
        btnConnectMetamask.innerHTML = '<span class="wallet-icon"><svg class="wallet-icon-svg" width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M28.4 4.3L17.5 12.2l2.3-5.5L28.4 4.3z" fill="#E17726"/><path d="M3.6 4.3l10.8 7.9-2.3-5.5L3.6 4.3z" fill="#E27625"/><path d="M24.7 22.3l-2.9 4.4 6.1 1.7 1.8-6-5-0.1z" fill="#E27625"/><path d="M2.3 22.4l1.8 6 6.1-1.7-2.9-4.4-5 0.1z" fill="#E27625"/></svg></span><span>Conectado</span>';
      }

      if (badgeMetamaskConn) {
        badgeMetamaskConn.style.display = 'inline-block';
        badgeMetamaskConn.textContent = `● Conectado: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;
      }

      if (btnSimSign2) {
        const span = btnSimSign2.querySelector('span');
        if (span) span.innerHTML = '<svg class="wallet-icon-svg" width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M28.4 4.3L17.5 12.2l2.3-5.5L28.4 4.3z" fill="#E17726"/><path d="M3.6 4.3l10.8 7.9-2.3-5.5L3.6 4.3z" fill="#E27625"/><path d="M24.7 22.3l-2.9 4.4 6.1 1.7 1.8-6-5-0.1z" fill="#E27625"/><path d="M2.3 22.4l1.8 6 6.1-1.7-2.9-4.4-5 0.1z" fill="#E27625"/></svg> <span>Firmar con MetaMask Real</span>';
      }

      computeMultisigAddresses();
      showToast('¡MetaMask conectado exitosamente como Cosignatario B!', 'success');
    } catch (err) {
      console.error('[MetaMask Connect Error]:', err);
      showToast(`Conexión cancelada: ${err.message || 'Rechazado'}`, 'error');
    }
  }

  async function connectPhantomWallet() {
    playHapticTick();
    const phantomProvider = window.phantom?.ethereum || (window.ethereum?.isPhantom ? window.ethereum : null) || window.solana;

    if (!phantomProvider) {
      showToast('Phantom no detectado. Puedes instalarlo desde phantom.app o usar las llaves simuladas.', 'warning');
      return;
    }

    try {
      showToast('Solicitando conexión a Phantom...', 'info');
      const signer3EthAddr = document.getElementById('signer-3-eth-addr');

      if (window.phantom?.ethereum) {
        const accounts = await window.phantom.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length) {
          web3State.phantomAccount = accounts[0];
          if (signer3EthAddr) signer3EthAddr.value = accounts[0];
        }
      } else if (window.solana) {
        const resp = await window.solana.connect();
        web3State.phantomAccount = resp.publicKey.toString();
        if (signer3EthAddr) signer3EthAddr.value = web3State.phantomAccount;
      }

      if (btnConnectPhantom) {
        btnConnectPhantom.classList.add('is-connected');
        btnConnectPhantom.innerHTML = '<span class="wallet-icon"><svg class="wallet-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path></svg></span><span>Conectado</span>';
      }

      if (badgePhantomConn) {
        badgePhantomConn.style.display = 'inline-block';
        const str = web3State.phantomAccount;
        badgePhantomConn.textContent = `● Conectado: ${str.slice(0, 6)}...${str.slice(-4)}`;
      }

      if (btnSimSign3) {
        const span = btnSimSign3.querySelector('span');
        if (span) span.innerHTML = '<svg class="wallet-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path></svg> <span>Firmar con Phantom Real</span>';
      }

      computeMultisigAddresses();
      showToast('¡Phantom conectado exitosamente como Cosignatario C!', 'success');
    } catch (err) {
      console.error('[Phantom Connect Error]:', err);
      showToast(`Conexión cancelada: ${err.message || 'Rechazado'}`, 'error');
    }
  }

  if (btnConnectMetamask) {
    btnConnectMetamask.addEventListener('click', connectMetaMaskWallet);
  }
  if (btnConnectPhantom) {
    btnConnectPhantom.addEventListener('click', connectPhantomWallet);
  }

  const btnSimSign1 = document.getElementById('btn-sim-sign-1');
  const btnSimSign2 = document.getElementById('btn-sim-sign-2');
  const btnSimSign3 = document.getElementById('btn-sim-sign-3');
  const simKey1Status = document.getElementById('sim-key-1-status');
  const simKey2Status = document.getElementById('sim-key-2-status');
  const simKey3Status = document.getElementById('sim-key-3-status');
  const simStatusPill = document.getElementById('sim-status-pill');
  const simStatusText = document.getElementById('sim-status-text');
  const simRadar = document.getElementById('sim-radar');
  const simGaugeFill = document.getElementById('sim-gauge-fill');
  const simOutcomeBanner = document.getElementById('sim-outcome-banner');
  const btnResetSimulator = document.getElementById('btn-reset-simulator');

  let activeSignatures = new Set();

  function renderSignaturesAuditLog() {
    if (!simSignaturesLog || !sigLogEntries) return;
    const count = activeSignatures.size;
    if (count === 0) {
      simSignaturesLog.style.display = 'none';
      return;
    }

    simSignaturesLog.style.display = 'flex';
    sigLogEntries.innerHTML = '';

    if (sigLogQuorumBadge) {
      if (count >= 2) {
        sigLogQuorumBadge.className = 'sig-log-quorum-badge approved';
        sigLogQuorumBadge.textContent = '¡Quórum Criptográfico 2/2 Válido!';
      } else {
        sigLogQuorumBadge.className = 'sig-log-quorum-badge';
        sigLogQuorumBadge.textContent = 'Falta 1 firma para el quórum';
      }
    }

    Object.keys(web3State.collectedSignatures).forEach(keyNum => {
      const sigData = web3State.collectedSignatures[keyNum];
      const card = document.createElement('div');
      card.className = 'sig-log-card';
      card.innerHTML = `
        <div class="sig-log-card-top">
          <span class="sig-author">${sigData.author}</span>
          <span class="sig-type-tag">${sigData.type}</span>
        </div>
        <div class="sig-hash-line">
          <strong>Firma Criptográfica:</strong> ${sigData.sig}
        </div>
      `;
      sigLogEntries.appendChild(card);
    });
  }

  function updateSimulatorUI() {
    const count = activeSignatures.size;
    const isQuorumMet = (count >= 2);

    const pct = isQuorumMet ? 100 : (count === 1 ? 50 : 0);
    if (simGaugeFill) simGaugeFill.style.width = pct + '%';

    if (simStatusPill && simStatusText && simRadar) {
      if (isQuorumMet) {
        simStatusPill.className = 'tx-status-pill ready';
        simStatusText.textContent = count + ' de 2 firmas recibidas (¡Quórum Autorizado!)';
        simRadar.style.background = 'var(--emerald-safe)';
        if (simOutcomeBanner) simOutcomeBanner.style.display = 'flex';
        playDiceTapSound(true);
      } else if (count === 1) {
        simStatusPill.className = 'tx-status-pill';
        simStatusText.textContent = '1 de 2 firmas recibidas (Esperando 2da firma)';
        simRadar.style.background = 'var(--amber-gold)';
        if (simOutcomeBanner) simOutcomeBanner.style.display = 'none';
        playDiceTapSound(false);
      } else {
        simStatusPill.className = 'tx-status-pill';
        simStatusText.textContent = '0 de 2 firmas recibidas (Bloqueada)';
        simRadar.style.background = 'var(--amber-gold)';
        if (simOutcomeBanner) simOutcomeBanner.style.display = 'none';
      }
    }

    renderSignaturesAuditLog();
  }

  async function signSimulatorKey(keyNum, btn, statusEl) {
    if (activeSignatures.has(keyNum)) return;
    playHapticTick();

    const vaultAddr = (currentMultisigResult && currentMultisigResult.address) ? currentMultisigResult.address : 'bc1q...';

    // CASO 1: Cosignatario 2 con MetaMask real conectado
    if (keyNum === 2 && web3State.metaMaskAccount && window.ethereum) {
      try {
        showToast('Solicitando firma criptográfica en MetaMask...', 'info');
        const txMsg = `KryptonSeed Vault Authorization\nBóveda: ${vaultAddr}\nCosignatario: 2 de 3 (MetaMask)\nAcción: Autorizar Retiro\nNonce: 0x${Date.now().toString(16)}`;
        const msgHex = '0x' + Array.from(new TextEncoder().encode(txMsg)).map(b => b.toString(16).padStart(2, '0')).join('');

        const realSig = await window.ethereum.request({
          method: 'personal_sign',
          params: [msgHex, web3State.metaMaskAccount]
        });

        web3State.collectedSignatures['2'] = {
          author: `Llave 2 · MetaMask (${web3State.metaMaskAccount.slice(0, 6)}...${web3State.metaMaskAccount.slice(-4)})`,
          type: 'ECDSA secp256k1 (personal_sign)',
          sig: realSig
        };

        showToast('¡Firma criptográfica de MetaMask registrada exitosamente!', 'success');
      } catch (err) {
        console.warn('[MetaMask Sign Rejected]:', err);
        showToast('Firma cancelada en MetaMask. Se usará firma simulada.', 'warning');
        web3State.collectedSignatures['2'] = {
          author: 'Llave 2 (Cosignatario B / Móvil)',
          type: 'ECDSA secp256k1 (Simulada)',
          sig: '0x' + getCryptoSecureHex(32) + '1b'
        };
      }
    } else if (keyNum === 3 && web3State.phantomAccount && (window.phantom?.ethereum || window.solana)) {
      // CASO 2: Cosignatario 3 con Phantom real conectado
      try {
        showToast('Solicitando firma criptográfica en Phantom...', 'info');
        const txMsg = `KryptonSeed Vault Authorization\nBóveda: ${vaultAddr}\nCosignatario: 3 de 3 (Phantom)\nAcción: Autorizar Retiro\nNonce: 0x${Date.now().toString(16)}`;

        let realSig = '';
        if (window.phantom?.ethereum) {
          const msgHex = '0x' + Array.from(new TextEncoder().encode(txMsg)).map(b => b.toString(16).padStart(2, '0')).join('');
          realSig = await window.phantom.ethereum.request({
            method: 'personal_sign',
            params: [msgHex, web3State.phantomAccount]
          });
        } else if (window.solana) {
          const encoded = new TextEncoder().encode(txMsg);
          const signed = await window.solana.signMessage(encoded);
          realSig = Array.from(signed.signature).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        web3State.collectedSignatures['3'] = {
          author: `Llave 3 · Phantom (${web3State.phantomAccount.slice(0, 6)}...${web3State.phantomAccount.slice(-4)})`,
          type: 'Ed25519 / ECDSA (Phantom en Vivo)',
          sig: realSig.startsWith('0x') ? realSig : ('0x' + realSig)
        };

        showToast('¡Firma criptográfica de Phantom registrada exitosamente!', 'success');
      } catch (err) {
        console.warn('[Phantom Sign Rejected]:', err);
        showToast('Firma cancelada en Phantom. Se usará firma simulada.', 'warning');
        web3State.collectedSignatures['3'] = {
          author: 'Llave 3 (Cosignatario C / Respaldo)',
          type: 'ECDSA secp256k1 (Simulada)',
          sig: '0x' + getCryptoSecureHex(32) + '1c'
        };
      }
    } else {
      // CASO 3: Llave 1 (Dados locales) o sin billetera conectada
      const signerName = keyNum === 1 ? 'Llave 1 (Bóveda Fría / Dados)' : (keyNum === 2 ? 'Llave 2 (Cosignatario B)' : 'Llave 3 (Cosignatario C)');
      web3State.collectedSignatures[String(keyNum)] = {
        author: signerName,
        type: 'Schnorr / ECDSA (Hardware Air-Gapped)',
        sig: '0x' + getCryptoSecureHex(32) + '1b'
      };
      showToast(`¡Firma de ${signerName} registrada!`, 'success');
    }

    activeSignatures.add(keyNum);

    if (btn) {
      btn.classList.add('signed');
      const label = keyNum === 2 && web3State.metaMaskAccount ? 'MetaMask' : (keyNum === 3 && web3State.phantomAccount ? 'Phantom' : `Llave ${keyNum}`);
      btn.innerHTML = `<span>Firmado por ${label}</span>`;
      btn.style.borderColor = 'var(--emerald-safe)';
      btn.style.color = 'var(--emerald-safe)';
    }

    if (statusEl) {
      statusEl.textContent = 'Firmada';
      statusEl.className = 'sim-key-status signed';
    }

    updateSimulatorUI();
  }

  if (btnSimSign1) {
    btnSimSign1.addEventListener('click', function() {
      signSimulatorKey(1, btnSimSign1, simKey1Status);
    });
  }

  if (btnSimSign2) {
    btnSimSign2.addEventListener('click', function() {
      signSimulatorKey(2, btnSimSign2, simKey2Status);
    });
  }

  if (btnSimSign3) {
    btnSimSign3.addEventListener('click', function() {
      signSimulatorKey(3, btnSimSign3, simKey3Status);
    });
  }

  if (btnResetSimulator) {
    btnResetSimulator.addEventListener('click', function() {
      activeSignatures.clear();
      web3State.collectedSignatures = {};

      if (btnSimSign1) {
        btnSimSign1.classList.remove('signed');
        btnSimSign1.style.borderColor = '';
        btnSimSign1.style.color = '';
        btnSimSign1.innerHTML = '<span><svg class="inline-svg-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Firmar con Llave 1 (Coldcard / Papel)</span>';
      }
      if (simKey1Status) {
        simKey1Status.classList.remove('signed');
        simKey1Status.textContent = 'Pendiente';
      }

      if (btnSimSign2) {
        btnSimSign2.classList.remove('signed');
        btnSimSign2.style.borderColor = '';
        btnSimSign2.style.color = '';
        const label2 = web3State.metaMaskAccount ? '<svg class="wallet-icon-svg" width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M28.4 4.3L17.5 12.2l2.3-5.5L28.4 4.3z" fill="#E17726"/><path d="M3.6 4.3l10.8 7.9-2.3-5.5L3.6 4.3z" fill="#E27625"/><path d="M24.7 22.3l-2.9 4.4 6.1 1.7 1.8-6-5-0.1z" fill="#E27625"/><path d="M2.3 22.4l1.8 6 6.1-1.7-2.9-4.4-5 0.1z" fill="#E27625"/></svg> Firmar con MetaMask Real' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Firmar con Llave 2 (Phantom / Móvil)';
        btnSimSign2.innerHTML = `<span>${label2}</span>`;
      }
      if (simKey2Status) {
        simKey2Status.classList.remove('signed');
        simKey2Status.textContent = 'Pendiente';
      }

      if (btnSimSign3) {
        btnSimSign3.classList.remove('signed');
        btnSimSign3.style.borderColor = '';
        btnSimSign3.style.color = '';
        const label3 = web3State.phantomAccount ? '<svg class="wallet-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path></svg> Firmar con Phantom Real' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Firmar con Llave 3 (Respaldo)';
        btnSimSign3.innerHTML = `<span>${label3}</span>`;
      }
      if (simKey3Status) {
        simKey3Status.classList.remove('signed');
        simKey3Status.textContent = 'Pendiente';
      }

      updateSimulatorUI();
      showToast('Simulador de firmas restablecido', 'refresh');
    });
  }

  // ==========================================================================
  // CYPHERPUNK COLD STORAGE PRINT & DIRECT FILE DOWNLOAD SUITE
  // ==========================================================================

  const printModalBackdrop = document.getElementById('print-modal-backdrop');
  const btnClosePrintModal = document.getElementById('btn-close-print-modal');
  const btnQuickDownloadColdcard = document.getElementById('btn-quick-download-coldcard');
  const btnOpenPrintModal = document.getElementById('btn-open-print-modal');
  const btnPrintMultisigPack = document.getElementById('btn-print-multisig-pack');
  const btnTriggerPrint = document.getElementById('btn-trigger-print');
  const btnDownloadColdcardFile = document.getElementById('btn-download-coldcard-file');
  const btnDownloadColdcardSvg = document.getElementById('btn-download-coldcard-svg');

  const printPreviewContent = document.getElementById('print-preview-content');
  const printDocumentRoot = document.getElementById('print-document-root');

  const printTypeBtns = document.querySelectorAll('#print-template-type-selector .seg-btn');
  const printLayoutBtns = document.querySelectorAll('#print-layout-style-selector .seg-btn');
  const chkPrintRevealWords = document.getElementById('chk-print-reveal-words');
  const chkPrintHighlight4Letters = document.getElementById('chk-print-highlight-4letters');
  const chkPrintIncludeSha256 = document.getElementById('chk-print-include-sha256');

  let printConfig = {
    templateType: 'single', // 'single' | 'multisig'
    layoutStyle: 'steel',    // 'steel' | 'certificate'
    revealWords: true,
    highlight4Letters: true,
    includeSha256: true
  };

  function getWordBIP39Index(word) {
    if (!word || !window.BIP39_WORDLIST) return 0;
    const idx = window.BIP39_WORDLIST.indexOf(word.toLowerCase().trim());
    return idx !== -1 ? idx + 1 : 0;
  }

  function getColdCardStylesCSS() {
    return `
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 24px;
        background: #ffffff;
        color: #000000;
        font-family: 'Courier New', Courier, monospace, -apple-system, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      @page { size: A4 portrait; margin: 10mm; }
      .print-bar-action {
        background: #f0f0f0;
        border: 1px solid #ccc;
        padding: 10px 16px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 4px;
      }
      .print-btn-local {
        background: #000;
        color: #fff;
        border: none;
        padding: 8px 18px;
        font-family: inherit;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        border-radius: 3px;
      }
      .print-btn-local:hover { background: #333; }
      @media print {
        .print-bar-action { display: none !important; }
        body { padding: 0 !important; }
        .multisig-triptych-page { page-break-after: always !important; break-after: page !important; }
        .multisig-triptych-page:last-child { page-break-after: auto !important; break-after: auto !important; }
      }
      .cold-card-doc {
        background: #fff;
        color: #000;
        max-width: 780px;
        margin: 0 auto;
        border: 2px solid #000;
        border-radius: 6px;
        padding: 24px;
      }
      .cold-card-badge-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #000;
        padding-bottom: 8px;
        margin-bottom: 16px;
      }
      .cold-card-brand {
        font-weight: 800;
        font-size: 14px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .cold-card-type-tag {
        background: #000;
        color: #fff;
        padding: 3px 8px;
        font-size: 11px;
        font-weight: 700;
        border-radius: 2px;
      }
      .cold-card-hero { margin-bottom: 18px; }
      .cold-card-main-title {
        font-size: 18px;
        font-weight: 800;
        margin: 0 0 6px 0;
        text-transform: uppercase;
      }
      .cold-card-desc-meta { font-size: 11px; color: #444; margin: 0; line-height: 1.4; }
      .cold-card-words-table {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px 14px;
        margin-bottom: 18px;
      }
      .layout-certificate .cold-card-words-table {
        grid-template-columns: repeat(3, 1fr);
      }
      .cold-card-word-cell {
        border: 1.5px solid #000;
        border-radius: 4px;
        padding: 6px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fafafa;
      }
      .word-cell-left { display: flex; align-items: baseline; gap: 8px; }
      .word-index-num { font-size: 12px; font-weight: 800; color: #555; }
      .word-text-val { font-size: 14px; font-weight: 800; letter-spacing: 0.04em; }
      .word-punch-boxes { display: flex; gap: 3px; }
      .punch-char-box {
        width: 20px;
        height: 22px;
        border: 1.5px solid #000;
        border-radius: 2px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 800;
        background: #fff;
      }
      .word-cell-index-code {
        font-size: 10px;
        font-weight: 700;
        color: #555;
        background: #eee;
        padding: 2px 4px;
        border-radius: 2px;
        border: 1px solid #ccc;
      }
      .cold-card-audit-box {
        border-top: 1.5px solid #000;
        padding-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .audit-meta-row { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; }
      .audit-hash-block {
        background: #f4f4f4;
        border: 1px solid #ccc;
        padding: 6px 10px;
        border-radius: 3px;
        font-size: 11px;
        word-break: break-all;
      }
      .audit-written-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 6px;
      }
      .handwrite-slot {
        border-bottom: 1.5px dashed #444;
        padding-bottom: 4px;
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #333;
      }
      .cold-card-warning-footer {
        margin-top: 8px;
        font-size: 10px;
        color: #444;
        line-height: 1.4;
        border-left: 3px solid #000;
        padding-left: 8px;
      }
      .multisig-triptych-page {
        border: 2px solid #000;
        border-radius: 6px;
        padding: 20px;
        margin-bottom: 30px;
      }
      .multisig-role-banner {
        background: #000;
        color: #fff;
        padding: 8px 12px;
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 3px;
        font-size: 12px;
        font-weight: 800;
      }
      .multisig-descriptor-box {
        background: #f7f7f7;
        border: 1.5px solid #333;
        padding: 8px 12px;
        border-radius: 3px;
        margin-bottom: 16px;
        font-size: 11px;
        line-height: 1.45;
        word-break: break-all;
      }
    `;
  }

  function generateSingleCardHTML(wordsList, sha256Hex, diceCount, cardTitle, roleTag) {
    const isSteel = printConfig.layoutStyle === 'steel';
    const totalWords = (wordsList && wordsList.length > 0) ? wordsList.length : targetWords;

    let gridHTML = '<div class="cold-card-words-table">';
    for (let i = 0; i < totalWords; i++) {
      const rawWord = (wordsList && wordsList[i]) ? wordsList[i].trim() : '';
      const wordDisplay = (printConfig.revealWords && rawWord) ? rawWord.toUpperCase() : '__________';
      const numStr = '#' + String(i + 1).padStart(2, '0');
      
      const idxNum = rawWord ? getWordBIP39Index(rawWord) : 0;
      const idxFormatted = idxNum > 0 ? String(idxNum).padStart(4, '0') : '----';

      let punchBoxesHTML = '';
      if (printConfig.highlight4Letters) {
        punchBoxesHTML = '<div class="word-punch-boxes">';
        for (let c = 0; c < 4; c++) {
          const char = (printConfig.revealWords && rawWord && rawWord[c]) ? rawWord[c].toUpperCase() : '&nbsp;';
          punchBoxesHTML += `<span class="punch-char-box">${char}</span>`;
        }
        punchBoxesHTML += '</div>';
      }

      gridHTML += `
        <div class="cold-card-word-cell">
          <div class="word-cell-left">
            <span class="word-index-num">${numStr}</span>
            <span class="word-text-val">${wordDisplay}</span>
          </div>
          ${punchBoxesHTML}
          <span class="word-cell-index-code">${idxFormatted}</span>
        </div>
      `;
    }
    gridHTML += '</div>';

    let shaBlock = '';
    if (printConfig.includeSha256 && sha256Hex) {
      shaBlock = `
        <div class="audit-meta-row">
          <span>HUELLA DE ENTROPÍA (SHA-256 DE TIRADAS D6):</span>
          <span>${diceCount || 50} DADOS D6</span>
        </div>
        <div class="audit-hash-block">${sha256Hex}</div>
      `;
    }

    const roleBadge = roleTag ? `<span class="cold-card-type-tag">${roleTag}</span>` : `<span class="cold-card-type-tag">${totalWords} PALABRAS BIP-39</span>`;
    const mainTitle = cardTitle || 'TARJETA DE RESPALDO FRÍO (COLD STORAGE CARD)';

    return `
      <div class="cold-card-doc ${isSteel ? 'layout-steel' : 'layout-certificate'}">
        <div class="cold-card-badge-line">
          <span class="cold-card-brand">KRYPTONSEED AIR-GAPPED VAULT</span>
          ${roleBadge}
        </div>

        <div class="cold-card-hero">
          <h2 class="cold-card-main-title">${mainTitle}</h2>
          <p class="cold-card-desc-meta">Estándar Criptográfico BIP-39 / BIP-44 / BIP-84. Compatible con Placas de Acero (Cryptosteel, Keystone) y Billeteras Frías Hardware.</p>
        </div>

        ${gridHTML}

        <div class="cold-card-audit-box">
          ${shaBlock}

          <div class="audit-written-fields">
            <div class="handwrite-slot">
              <span>UBICACIÓN DE CUSTODIA:</span>
              <span>______________________</span>
            </div>
            <div class="handwrite-slot">
              <span>FECHA DE SELLADO:</span>
              <span>____ / ____ / ________</span>
            </div>
          </div>

          <div class="cold-card-warning-footer">
            <strong>PROTOCOLO DE ALTA SEGURIDAD:</strong> En el estándar BIP-39 oficial, las <strong>primeras 4 letras</strong> de cada palabra son matemáticamente únicas en el diccionario de 2048 palabras. Nunca fotografíes esta tarjeta ni utilices escáneres con conectividad WiFi/Bluetooth.
          </div>
        </div>
      </div>
    `;
  }

  function updatePrintViews() {
    let docHTML = '';

    if (printConfig.templateType === 'single') {
      const words = (computedWords && computedWords.length > 0)
        ? computedWords
        : (computedMnemonicString ? computedMnemonicString.trim().split(/\s+/) : []);
      const sha = (computedCryptoData && computedCryptoData.diceSha256Hex) ? computedCryptoData.diceSha256Hex : '';
      const diceCount = (rollsHistory && rollsHistory.length) ? rollsHistory.length : targetRolls;

      const cardContent = generateSingleCardHTML(words, sha, diceCount, 'TARJETA DE RESPALDO FRÍO (COLD STORAGE CARD)', 'BIP-39 AIR-GAPPED');
      docHTML = `<div class="paper-sheet-simulation">${cardContent}</div>`;
    } else {
      const p1 = document.getElementById('multi-key-1-val');
      const p2 = document.getElementById('multi-key-2-val');
      const p3 = document.getElementById('multi-key-3-val');

      const words1 = p1 ? p1.value.trim().split(/\s+/) : [];
      const words2 = p2 ? p2.value.trim().split(/\s+/) : [];
      const words3 = p3 ? p3.value.trim().split(/\s+/) : [];

      const btcAddr = (currentMultisigResult && currentMultisigResult.address) ? currentMultisigResult.address : 'bc1q...';
      const btcDesc = (currentMultisigResult && currentMultisigResult.descriptor) ? currentMultisigResult.descriptor : 'wsh(sortedmulti(2,...))';

      const card1 = generateSingleCardHTML(words1, '', 50, 'TARJETA 1 DE 3: LLAVE COSIGNATARIA A', 'COSIGNATARIO 1 · BÓVEDA PRINCIPAL');
      const card2 = generateSingleCardHTML(words2, '', 50, 'TARJETA 2 DE 3: LLAVE COSIGNATARIA B', 'COSIGNATARIO 2 · CAJA FUERTE BANCO');
      const card3 = generateSingleCardHTML(words3, '', 50, 'TARJETA 3 DE 3: LLAVE COSIGNATARIA C', 'COSIGNATARIO 3 · RESERVA GEOGRÁFICA');

      function wrapMultisigPage(cardInner, keyIndex, locationTip) {
        return `
          <div class="paper-sheet-simulation multisig-triptych-page">
            <div class="multisig-role-banner">
              <span class="multisig-role-title">BÓVEDA MULTIFIRMA 2-DE-3 · COSIGNATARIO ${keyIndex} DE 3</span>
              <span>QUÓRUM 2/3 REQUERIDO</span>
            </div>
            <div class="multisig-descriptor-box">
              <div><strong>DIRECCIÓN BITCOIN NATIVE SEGWIT (P2WSH):</strong> ${btcAddr}</div>
              <div style="margin-top: 4px;"><strong>DESCRIPTOR DE SALIDA:</strong> ${btcDesc}</div>
              <div style="margin-top: 4px; color: #555;"><strong>REGLA DE CUSTODIA:</strong> Guardar en ${locationTip}. Esta tarjeta no puede mover fondos por sí sola; se requiere de al menos otra tarjeta para autorizar cualquier retiro.</div>
            </div>
            ${cardInner}
          </div>
        `;
      }

      docHTML = `
        ${wrapMultisigPage(card1, '1', 'Ubicación Primaria (Bóveda Principal en Casa)')}
        ${wrapMultisigPage(card2, '2', 'Ubicación Secundaria (Caja de Seguridad / Oficina)')}
        ${wrapMultisigPage(card3, '3', 'Ubicación Terciaria de Respaldo (Familiar o Abogado)')}
      `;
    }

    if (printPreviewContent) {
      printPreviewContent.innerHTML = docHTML;
    }
    if (printDocumentRoot) {
      printDocumentRoot.innerHTML = docHTML;
    }
  }

  function openPrintSuite(mode) {
    playHapticTick();
    if (mode) {
      printConfig.templateType = mode;
      printTypeBtns.forEach(function(b) {
        if (b.getAttribute('data-type') === mode) {
          b.classList.add('is-active');
        } else {
          b.classList.remove('is-active');
        }
      });
    }
    updatePrintViews();
    if (printModalBackdrop) {
      printModalBackdrop.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closePrintSuite() {
    playHapticTick();
    if (printModalBackdrop) {
      printModalBackdrop.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function downloadColdCardStandaloneHTML() {
    playHapticTick();
    updatePrintViews();

    const isMultisig = printConfig.templateType === 'multisig';
    const innerContent = printPreviewContent ? printPreviewContent.innerHTML : '';
    const dateStr = new Date().toISOString().slice(0, 10);

    const fullHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KryptonSeed - ${isMultisig ? 'Tríptico Multifirma 2-de-3' : 'Tarjeta de Respaldo Frío BIP-39'}</title>
  <style>
${getColdCardStylesCSS()}
  </style>
</head>
<body>
  <div class="print-bar-action">
    <div>
      <strong>KryptonSeed Cold Storage Document</strong> | Fecha: ${dateStr}
    </div>
    <div>
      <button class="print-btn-local" onclick="window.print()">Imprimir Esta Hoja (Ctrl + P)</button>
    </div>
  </div>

  <div class="cold-card-export-wrapper">
    ${innerContent}
  </div>

  <script>
    // Documento autónomo 100% offline. Seguro para cold storage.
  <\/script>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isMultisig
      ? `kryptonseed-triptico-multifirma-2de3-${dateStr}.html`
      : `kryptonseed-tarjeta-fria-bip39-${dateStr}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('¡Tarjeta fría descargada exitosamente (.html autónomo)!', 'success');
  }

  function downloadColdCardSVG() {
    playHapticTick();
    const isMultisig = printConfig.templateType === 'multisig';
    const words = (computedWords && computedWords.length > 0)
      ? computedWords
      : (computedMnemonicString ? computedMnemonicString.trim().split(/\s+/) : []);
    const sha = (computedCryptoData && computedCryptoData.diceSha256Hex) ? computedCryptoData.diceSha256Hex : 'KRYPTONSEED-AIRGAPPED-COLD-CARD';
    const dateStr = new Date().toISOString().slice(0, 10);
    const totalWords = words.length ? words.length : targetWords;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 856 540" width="85.6mm" height="54mm" style="background:#ffffff; font-family:'Courier New', monospace;">
  <!-- Borde exterior de corte y esquinas redondeadas tipo tarjeta -->
  <rect x="4" y="4" width="848" height="532" rx="18" fill="none" stroke="#000000" stroke-width="3" stroke-dasharray="8,4"/>
  
  <!-- Encabezado -->
  <text x="30" y="40" font-size="16" font-weight="900" fill="#000000">KRYPTONSEED BIP-39 COLD STORAGE STEEL CARD</text>
  <text x="730" y="40" font-size="12" font-weight="bold" fill="#000000">${totalWords} WORDS</text>
  <line x1="30" y1="52" x2="826" y2="52" stroke="#000000" stroke-width="2"/>

  <!-- Grilla de Palabras y Punzones -->
`;

    const cols = 2;
    const rows = Math.ceil(totalWords / cols);
    const colWidth = 380;
    const startX = 40;
    const startY = 85;
    const rowHeight = 32;

    for (let i = 0; i < totalWords; i++) {
      const colIndex = i < rows ? 0 : 1;
      const rowIndex = i < rows ? i : i - rows;
      const x = startX + (colIndex * colWidth);
      const y = startY + (rowIndex * rowHeight);

      const rawWord = words[i] ? words[i].trim() : '';
      const wordStr = (printConfig.revealWords && rawWord) ? rawWord.toUpperCase() : '______';
      const numStr = '#' + String(i + 1).padStart(2, '0');
      const idxNum = rawWord ? getWordBIP39Index(rawWord) : 0;
      const idxStr = idxNum > 0 ? String(idxNum).padStart(4, '0') : '----';

      svgContent += `  <rect x="${x}" y="${y - 18}" width="365" height="26" rx="3" fill="#fafafa" stroke="#000000" stroke-width="1.2"/>\n`;
      svgContent += `  <text x="${x + 8}" y="${y}" font-size="11" font-weight="900" fill="#666666">${numStr}</text>\n`;
      svgContent += `  <text x="${x + 36}" y="${y}" font-size="13" font-weight="900" fill="#000000">${wordStr}</text>\n`;

      if (printConfig.highlight4Letters) {
        const punchStartX = x + 185;
        for (let c = 0; c < 4; c++) {
          const char = (printConfig.revealWords && rawWord && rawWord[c]) ? rawWord[c].toUpperCase() : ' ';
          const px = punchStartX + (c * 20);
          svgContent += `  <rect x="${px}" y="${y - 14}" width="17" height="18" fill="#ffffff" stroke="#000000" stroke-width="1.2"/>\n`;
          svgContent += `  <text x="${px + 4}" y="${y}" font-size="11" font-weight="900" fill="#000000">${char}</text>\n`;
        }
      }

      svgContent += `  <text x="${x + 295}" y="${y}" font-size="10" font-weight="bold" fill="#444444">${idxStr}</text>\n`;
    }

    const footerY = 475;
    svgContent += `  <line x1="30" y1="${footerY - 15}" x2="826" y2="${footerY - 15}" stroke="#000000" stroke-width="1.5"/>\n`;
    svgContent += `  <text x="30" y="${footerY}" font-size="9" font-weight="bold" fill="#222222">SHA-256 ENTROPY HASH: ${sha.slice(0, 48)}...</text>\n`;
    svgContent += `  <text x="30" y="${footerY + 18}" font-size="8" fill="#555555">BIP-39 / BIP-44 / BIP-84 STANDARD - LASER ENGRAVING & COLD STEEL ARCHIVE</text>\n`;
    svgContent += `  <text x="730" y="${footerY + 18}" font-size="8" font-weight="bold" fill="#000000">DATE: ${dateStr}</text>\n`;
    svgContent += `</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kryptonseed-tarjeta-laser-bip39-${dateStr}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('¡Plantilla vectorial descargada exitosamente (.svg grabado láser)!', 'success');
  }

  function initPrintModule() {
    if (btnQuickDownloadColdcard) {
      btnQuickDownloadColdcard.addEventListener('click', function() {
        downloadColdCardStandaloneHTML();
      });
    }

    if (btnOpenPrintModal) {
      btnOpenPrintModal.addEventListener('click', function() {
        openPrintSuite('single');
      });
    }

    if (btnPrintMultisigPack) {
      btnPrintMultisigPack.addEventListener('click', function() {
        openPrintSuite('multisig');
      });
    }

    if (btnClosePrintModal) {
      btnClosePrintModal.addEventListener('click', closePrintSuite);
    }

    if (printModalBackdrop) {
      printModalBackdrop.addEventListener('click', function(e) {
        if (e.target === printModalBackdrop) {
          closePrintSuite();
        }
      });
    }

    printTypeBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        printTypeBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        printConfig.templateType = btn.getAttribute('data-type');
        updatePrintViews();
      });
    });

    printLayoutBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        printLayoutBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        printConfig.layoutStyle = btn.getAttribute('data-layout');
        updatePrintViews();
      });
    });

    if (chkPrintRevealWords) {
      chkPrintRevealWords.addEventListener('change', function() {
        printConfig.revealWords = chkPrintRevealWords.checked;
        updatePrintViews();
      });
    }

    if (chkPrintHighlight4Letters) {
      chkPrintHighlight4Letters.addEventListener('change', function() {
        printConfig.highlight4Letters = chkPrintHighlight4Letters.checked;
        updatePrintViews();
      });
    }

    if (chkPrintIncludeSha256) {
      chkPrintIncludeSha256.addEventListener('change', function() {
        printConfig.includeSha256 = chkPrintIncludeSha256.checked;
        updatePrintViews();
      });
    }

    if (btnTriggerPrint) {
      btnTriggerPrint.addEventListener('click', function() {
        playHapticTick();
        updatePrintViews();
        setTimeout(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

          window.print();
        }, 100);
      });
    }

    if (btnDownloadColdcardFile) {
      btnDownloadColdcardFile.addEventListener('click', downloadColdCardStandaloneHTML);
    }

    if (btnDownloadColdcardSvg) {
      btnDownloadColdcardSvg.addEventListener('click', downloadColdCardSVG);
    }
  }

  // Inicializar modulo de impresion dentro del IIFE
  initPrintModule();

  // ==========================================================================

  // ==========================================================================
  // AIR-GAPPED OPTICAL QR CODE VIEWER CONTROLLER
  // ==========================================================================

  const qrModalBackdrop = document.getElementById('qr-modal-backdrop');
  const btnCloseQrModal = document.getElementById('btn-close-qr-modal');
  const qrModalTitle = document.getElementById('qr-modal-title');
  const qrModalDesc = document.getElementById('qr-modal-desc');
  const qrModalBadge = document.getElementById('qr-modal-badge');
  const qrFormatIndicator = document.getElementById('qr-format-indicator');
  const qrImg = document.getElementById('qr-img');
  const qrCanvas = document.getElementById('qr-canvas');
  const qrDataLabel = document.getElementById('qr-data-label');
  const qrDataText = document.getElementById('qr-data-text');
  const qrLenCounter = document.getElementById('qr-len-counter');
  const btnCopyQrText = document.getElementById('btn-copy-qr-text');
  const btnDownloadQrPng = document.getElementById('btn-download-qr-png');
  const btnDownloadQrSvg = document.getElementById('btn-download-qr-svg');

  // Trigger buttons
  const btnQrSeedPhrase = document.getElementById('btn-qr-seed-phrase');
  const btnQrBtcAddr = document.getElementById('btn-qr-btc-addr');
  const btnQrEthAddr = document.getElementById('btn-qr-eth-addr');
  const btnQrSolAddr = document.getElementById('btn-qr-sol-addr');
  const btnQrBtcMultisigAddr = document.getElementById('btn-qr-btc-multisig-addr');
  const btnQrDescriptor = document.getElementById('btn-qr-descriptor');

  let currentQRState = {
    rawText: '',
    qrPayload: '',
    currentDataURL: '',
    downloadPrefix: 'kryptonseed-qr'
  };

  function openQRViewer(opts) {
    playHapticTick();
    currentQRState.rawText = opts.rawText || '';
    currentQRState.qrPayload = opts.qrPayload || opts.rawText || '';
    currentQRState.downloadPrefix = opts.downloadPrefix || 'kryptonseed-qr';
    currentQRState.currentDataURL = '';

    if (qrModalTitle) qrModalTitle.textContent = opts.title || 'Código QR Criptográfico';
    if (qrModalDesc) qrModalDesc.textContent = opts.desc || 'Escaneo seguro sin conexión óptica.';
    if (qrModalBadge) qrModalBadge.textContent = opts.badge || 'Air-Gapped Optical QR';
    if (qrFormatIndicator) qrFormatIndicator.textContent = opts.formatTag || 'Estándar Criptográfico';
    if (qrDataLabel) qrDataLabel.textContent = opts.label || 'Dirección Criptográfica:';
    if (qrDataText) qrDataText.textContent = currentQRState.rawText;
    if (qrLenCounter) qrLenCounter.textContent = `${currentQRState.rawText.length} caracteres`;

    // Abrir backdrop inmediatamente
    if (qrModalBackdrop) {
      qrModalBackdrop.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    // Renderizar QR mediante toDataURL para máxima compatibilidad visual sin problemas de canvas
    if (window.QRCode && window.QRCode.toDataURL) {
      window.QRCode.toDataURL(currentQRState.qrPayload, {
        width: 260,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: opts.errorLevel || 'M'
      }, function(err, url) {
        if (!err && url) {
          if (qrImg) qrImg.src = url;
          currentQRState.currentDataURL = url;
        } else if (err) {
          console.error('[QR Engine Error]:', err);
        }
      });
    }
  }

  function closeQRViewer() {
    playHapticTick();
    if (qrModalBackdrop) {
      qrModalBackdrop.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function copyQRDataToClipboard() {
    playHapticTick();
    if (!currentQRState.rawText) return;
    navigator.clipboard.writeText(currentQRState.rawText).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

      showToast('¡Texto copiado al portapapeles!', 'info');
    });
  }

  function downloadQRPNG() {
    playHapticTick();
    const url = currentQRState.currentDataURL || (qrImg ? qrImg.src : '');
    if (!url) {
      showToast('No hay imagen de QR generada', 'warning');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentQRState.downloadPrefix}-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('¡Imagen QR guardada (.png)!', 'success');
  }

  function downloadQRSVG() {
    playHapticTick();
    if (!window.QRCode || !window.QRCode.toString) return;
    window.QRCode.toString(currentQRState.qrPayload, { type: 'svg', margin: 2 }, function(err, svgString) {
      if (err || !svgString) {
        showToast('Error al generar SVG', 'error');
        return;
      }
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentQRState.downloadPrefix}-${new Date().toISOString().slice(0, 10)}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('¡Vector QR guardado (.svg)!', 'success');
    });
  }

  function initQRModule() {
    if (btnCloseQrModal) {
      btnCloseQrModal.addEventListener('click', closeQRViewer);
    }

    if (qrModalBackdrop) {
      qrModalBackdrop.addEventListener('click', function(e) {
        if (e.target === qrModalBackdrop) {
          closeQRViewer();
        }
      });
    }

    if (btnCopyQrText) {
      btnCopyQrText.addEventListener('click', copyQRDataToClipboard);
    }

    if (btnDownloadQrPng) {
      btnDownloadQrPng.addEventListener('click', downloadQRPNG);
    }

    if (btnDownloadQrSvg) {
      btnDownloadQrSvg.addEventListener('click', downloadQRSVG);
    }

    // Botón QR Frase Semilla en Paso 3 (BIP-39 Seed Phrase)
    if (btnQrSeedPhrase) {
      btnQrSeedPhrase.addEventListener('click', function() {
        const phrase = (computedMnemonicString || (computedWords && computedWords.length ? computedWords.join(' ') : '')).trim();
        if (!phrase) {
          showToast('Primero genera la frase semilla con los dados', 'warning');
          return;
        }
        openQRViewer({
          title: 'Frase Semilla Mnemónica BIP-39 (12/24 Palabras)',
          desc: 'ESCANEO DE MÁXIMA SEGURIDAD: Escanéalo únicamente en tu hardware wallet air-gapped (Keystone, Passport, SeedSigner, Jade) o dispositivo sin conexión.',
          badge: 'BIP-39 · MASTER SEED PHRASE',
          label: 'Frase Mnemónica Completa:',
          rawText: phrase,
          qrPayload: phrase,
          errorLevel: 'L',
          formatTag: 'Frase Semilla Mnemónica Estándar BIP-39',
          downloadPrefix: 'kryptonseed-bip39-seed-phrase'
        });
      });
    }

    // Bitcoin Native SegWit QR Button
    if (btnQrBtcAddr) {
      btnQrBtcAddr.addEventListener('click', function() {
        let addr = '';
        if (derivedChainsData && derivedChainsData.bitcoin && derivedChainsData.bitcoin.nativeSegwit) {
          addr = derivedChainsData.bitcoin.nativeSegwit.address;
        }
        if (!addr && displayBtcAddress && displayBtcAddress.textContent !== '--') {
          addr = displayBtcAddress.textContent.trim();
        }
        if (!addr) {
          showToast('Primero calcula la dirección en el Paso 4', 'warning');
          return;
        }
        openQRViewer({
          title: 'Bitcoin Native SegWit (BIP-84)',
          desc: 'Dirección Bech32 bc1q de bajo costo para recibir Bitcoin. Compatible con Sparrow, BlueWallet, Jade y Keystone.',
          badge: 'BIP-21 · BITCOIN NATIVE SEGWIT',
          label: 'Dirección Bitcoin para Recibir:',
          rawText: addr,
          qrPayload: `bitcoin:${addr}?label=KryptonSeed%20BIP84`,
          formatTag: 'URI Estándar BIP-21 (bitcoin:bc1q...)',
          downloadPrefix: 'kryptonseed-btc-native-address'
        });
      });
    }

    // Ethereum / EVM QR Button
    if (btnQrEthAddr) {
      btnQrEthAddr.addEventListener('click', function() {
        let addr = '';
        if (derivedChainsData && derivedChainsData.ethereum) {
          addr = derivedChainsData.ethereum.address;
        }
        if (!addr && displayEthAddress && displayEthAddress.textContent !== '--') {
          addr = displayEthAddress.textContent.trim();
        }
        if (!addr) {
          showToast('Primero calcula la dirección en el Paso 4', 'warning');
          return;
        }
        openQRViewer({
          title: 'Ethereum & EVM Address (BIP-44)',
          desc: 'Válida para recibir ETH y tokens en todas las redes EVM (Arbitrum, Polygon, Optimism, Base, BSC).',
          badge: 'EIP-681 · ETHEREUM / EVM',
          label: 'Dirección EVM para Recibir:',
          rawText: addr,
          qrPayload: `ethereum:${addr}`,
          formatTag: 'URI Estándar EIP-681 (ethereum:0x...)',
          downloadPrefix: 'kryptonseed-eth-evm-address'
        });
      });
    }

    // Solana QR Button
    if (btnQrSolAddr) {
      btnQrSolAddr.addEventListener('click', function() {
        let addr = '';
        if (derivedChainsData && derivedChainsData.solana) {
          addr = derivedChainsData.solana.address;
        }
        if (!addr && displaySolAddress && displaySolAddress.textContent !== '--') {
          addr = displaySolAddress.textContent.trim();
        }
        if (!addr) {
          showToast('Primero calcula la dirección en el Paso 4', 'warning');
          return;
        }
        openQRViewer({
          title: 'Solana Public Key (SLIP-0010)',
          desc: 'Dirección Base58 para depósitos directos de SOL y tokens SPL en Phantom o Solflare.',
          badge: 'SOLANA PAY · BASE58',
          label: 'Dirección Solana para Recibir:',
          rawText: addr,
          qrPayload: `solana:${addr}`,
          formatTag: 'URI Estándar Solana (solana:...)',
          downloadPrefix: 'kryptonseed-solana-address'
        });
      });
    }

    // Bitcoin Multisig 2-of-3 Address QR Button
    if (btnQrBtcMultisigAddr) {
      btnQrBtcMultisigAddr.addEventListener('click', function() {
        let addr = (currentMultisigResult && currentMultisigResult.address) ? currentMultisigResult.address : '';
        if (!addr && displayBtcMultisigAddr && displayBtcMultisigAddr.textContent !== 'bc1q...') {
          addr = displayBtcMultisigAddr.textContent.trim();
        }
        if (!addr) {
          showToast('Primero calcula la bóveda multifirma', 'warning');
          return;
        }
        openQRViewer({
          title: 'Bóveda Multisig 2-de-3 (Bitcoin P2WSH)',
          desc: 'Dirección institucional de 62 caracteres. Requiere la autorización de 2 de las 3 llaves para mover fondos.',
          badge: 'BITCOIN P2WSH · MULTISIG 2-OF-3',
          label: 'Dirección de Depósito Multifirma:',
          rawText: addr,
          qrPayload: `bitcoin:${addr}?label=KryptonSeed%20Multisig%202of3`,
          formatTag: 'URI Estándar BIP-21 (bitcoin:bc1q...)',
          downloadPrefix: 'kryptonseed-multisig-btc-p2wsh'
        });
      });
    }

    // Multisig Output Descriptor QR Button
    if (btnQrDescriptor) {
      btnQrDescriptor.addEventListener('click', function() {
        let desc = (currentMultisigResult && currentMultisigResult.descriptor) ? currentMultisigResult.descriptor : '';
        if (!desc && displayBtcDescriptor && displayBtcDescriptor.textContent !== 'wsh(sortedmulti(2,...))') {
          desc = displayBtcDescriptor.textContent.trim();
        }
        if (!desc) {
          showToast('Primero calcula la bóveda multifirma', 'warning');
          return;
        }
        openQRViewer({
          title: 'Descriptor de Salida Multisig (Output Descriptor)',
          desc: 'Escanea directamente con la cámara de tu hardware wallet (SeedSigner, Passport, Keystone, Jade) para registrar la multifirma sin cables.',
          badge: 'AIR-GAPPED HARDWARE WALLET DESCRIPTOR',
          label: 'Descriptor Criptográfico wsh(sortedmulti(2,...)):',
          rawText: desc,
          qrPayload: desc,
          errorLevel: 'L',
          formatTag: 'BIP-380 / BIP-389 Output Descriptor',
          downloadPrefix: 'kryptonseed-multisig-descriptor'
        });
      });
    }
  }

  // Inicializar modulo de codigos QR
  initQRModule();

  // ==========================================================================
  // INVERSE CHECKSUM RECOVERY SOLVER CONTROLLER
  // ==========================================================================

  const tabRecoverySolver = document.getElementById('tab-recovery-solver');
  const recoveryLengthBtns = document.querySelectorAll('#recovery-length-selector .seg-btn');
  const btnRecoveryLoadSample = document.getElementById('btn-recovery-load-sample');
  const btnRecoveryClear = document.getElementById('btn-recovery-clear');
  const recoveryWordsInput = document.getElementById('recovery-words-input');
  const recoveryWordCounter = document.getElementById('recovery-word-counter');
  const recoveryInputFeedback = document.getElementById('recovery-input-feedback');
  const btnComputeRecovery = document.getElementById('btn-compute-recovery');

  const recoveryResultsContainer = document.getElementById('recovery-results-container');
  const statValidCandidatesCount = document.getElementById('stat-valid-candidates-count');
  const statRejectedSpacePct = document.getElementById('stat-rejected-space-pct');
  const statChecksumBitsDesc = document.getElementById('stat-checksum-bits-desc');
  const statKnownEntropyBits = document.getElementById('stat-known-entropy-bits');

  const recoveryFilterBar = document.getElementById('recovery-filter-bar');
  const recoveryFilterInput = document.getElementById('recovery-filter-input');
  const filterResultsTag = document.getElementById('filter-results-tag');
  const recoveryCandidatesGrid = document.getElementById('recovery-candidates-grid');

  const recoveryReconstructionBox = document.getElementById('recovery-reconstruction-box');
  const reconstructedTitle = document.getElementById('reconstructed-title');
  const reconstructedPhraseText = document.getElementById('reconstructed-phrase-text');
  const reconstructedAddressesRow = document.getElementById('reconstructed-addresses-row');
  const btnCopyReconstructed = document.getElementById('btn-copy-reconstructed');
  const btnQrReconstructed = document.getElementById('btn-qr-reconstructed');

  let recoveryState = {
    targetTotalWords: 12, // 12 or 24
    expectedKnownCount: 11, // 11 or 23
    currentCandidates: [],
    selectedCandidate: null
  };

  function initRecoveryModule() {
    const btnGotoRecovery = document.getElementById('btn-goto-recovery');
    if (btnGotoRecovery) {
      btnGotoRecovery.addEventListener('click', function() {
        switchMainModule('recovery');
      });
    }

    if (tabRecoverySolver) {
      tabRecoverySolver.addEventListener('click', function() {
        switchMainModule('recovery');
      });
    }

    // Length selector
    recoveryLengthBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        playHapticTick();
        recoveryLengthBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        recoveryState.targetTotalWords = parseInt(btn.getAttribute('data-length'), 10);
        recoveryState.expectedKnownCount = recoveryState.targetTotalWords - 1;
        updateRecoveryInputStatus();
        if (recoveryResultsContainer) recoveryResultsContainer.style.display = 'none';
      });
    });

    if (recoveryWordsInput) {
      recoveryWordsInput.addEventListener('input', updateRecoveryInputStatus);
    }

    if (btnRecoveryLoadSample) {
      btnRecoveryLoadSample.addEventListener('click', function() {
        playHapticTick();
        const sampleWord = 'abandon';
        const sampleList = Array(recoveryState.expectedKnownCount).fill(sampleWord).join(' ');
        if (recoveryWordsInput) {
          recoveryWordsInput.value = sampleList;
          updateRecoveryInputStatus();
        }
      });
    }

    if (btnRecoveryClear) {
      btnRecoveryClear.addEventListener('click', function() {
        playHapticTick();
        if (recoveryWordsInput) recoveryWordsInput.value = '';
        if (recoveryResultsContainer) recoveryResultsContainer.style.display = 'none';
        updateRecoveryInputStatus();
      });
    }

    if (btnComputeRecovery) {
      btnComputeRecovery.addEventListener('click', executeRecoverySolver);
    }

    if (recoveryFilterInput) {
      recoveryFilterInput.addEventListener('input', function() {
        renderFilteredCandidates(recoveryFilterInput.value.trim().toLowerCase());
      });
    }

    if (btnCopyReconstructed) {
      btnCopyReconstructed.addEventListener('click', function() {
        playHapticTick();
        if (!recoveryState.selectedCandidate) return;
        const phrase = recoveryState.selectedCandidate.fullPhrase;
        navigator.clipboard.writeText(phrase).then(function() {
  // ==========================================================================
  // DEFENSIVE SECURITY & CRYPTOGRAPHIC HYGIENE HELPERS
  // ==========================================================================
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

  function getCryptoSecureHex(bytesCount = 32) {
    const bytes = new Uint8Array(bytesCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function getCryptoRandomInt(min, max) {
    const range = max - min + 1;
    const buffer = new Uint32Array(1);
    const maxAcceptable = Math.floor(0xFFFFFFFF / range) * range;
    let rand;
    do {
      window.crypto.getRandomValues(buffer);
      rand = buffer[0];
    } while (rand >= maxAcceptable);
    return min + (rand % range);
  }

          showToast('¡Frase reconstruida copiada!', 'success');
        });
      });
    }

    if (btnQrReconstructed) {
      btnQrReconstructed.addEventListener('click', function() {
        playHapticTick();
        if (!recoveryState.selectedCandidate) return;
        const phrase = recoveryState.selectedCandidate.fullPhrase;
        openQRViewer({
          title: `Frase Reconstruida (${recoveryState.targetTotalWords} Palabras)`,
          desc: `Reconstruida con la palabra final '#${recoveryState.selectedCandidate.word.toUpperCase()}'.`,
          badge: 'BIP-39 · RECONSTRUCTED PHRASE',
          label: 'Frase Semilla Completa Válida:',
          rawText: phrase,
          qrPayload: phrase,
          errorLevel: 'L',
          formatTag: 'Frase Semilla Mnemónica Estándar BIP-39',
          downloadPrefix: 'kryptonseed-reconstructed-seed'
        });
      });
    }
  }

  function getCleanInputWords() {
    if (!recoveryWordsInput) return [];
    return recoveryWordsInput.value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  function updateRecoveryInputStatus() {
    const words = getCleanInputWords();
    const count = words.length;
    const expected = recoveryState.expectedKnownCount;

    if (recoveryWordCounter) {
      recoveryWordCounter.textContent = `${count} / ${expected} palabras`;
      recoveryWordCounter.style.color = (count === expected) ? 'var(--cyan-accent)' : '#94a3b8';
    }

    // Validar cada palabra en BIP-39
    if (!window.BIP39_WORDLIST) return;
    const invalidWords = words.filter(w => !window.BIP39_WORDLIST.includes(w));
    if (recoveryInputFeedback) {
      if (invalidWords.length > 0) {
        recoveryInputFeedback.textContent = `Palabras no encontradas en el diccionario BIP-39: "${invalidWords.join(', ')}"`;
      } else if (count > expected) {
        recoveryInputFeedback.textContent = `Has ingresado ${count} palabras (se esperaban exactamente ${expected}).`;
      } else {
        recoveryInputFeedback.textContent = '';
      }
    }
  }

  async function executeRecoverySolver() {
    playHapticTick();
    const words = getCleanInputWords();
    const targetTotal = recoveryState.targetTotalWords;
    const expectedKnown = recoveryState.expectedKnownCount; // 11 o 23

    // Permitir ingresar tanto 11 como 12 palabras (o 23 y 24 palabras)
    let knownWords = [];
    let userSpecifiedLastWord = null;

    if (words.length === expectedKnown) {
      knownWords = words;
    } else if (words.length === targetTotal) {
      knownWords = words.slice(0, expectedKnown);
      userSpecifiedLastWord = words[targetTotal - 1];
    } else {
      showToast(`Ingresa ${expectedKnown} palabras conocidas (o la frase completa de ${targetTotal} palabras para verificar su checksum)`, 'warning');
      return;
    }

    // Validar que todas las palabras conocidas existan en BIP-39
    if (!window.BIP39_WORDLIST) return;
    const invalidKnown = knownWords.filter(w => !window.BIP39_WORDLIST.includes(w));
    if (invalidKnown.length > 0) {
      showToast(`Corrige las palabras inválidas: "${invalidKnown.join(', ')}"`, 'error');
      return;
    }

    if (userSpecifiedLastWord && !window.BIP39_WORDLIST.includes(userSpecifiedLastWord)) {
      showToast(`La última palabra "${userSpecifiedLastWord}" no existe en el diccionario BIP-39`, 'error');
      return;
    }

    showToast('Resolviendo ecuaciones de checksum SHA-256...', 'info');

    // 1. Convertir palabras conocidas a bits
    let knownBits = '';
    for (let i = 0; i < knownWords.length; i++) {
      const idx = window.BIP39_WORDLIST.indexOf(knownWords[i]);
      knownBits += idx.toString(2).padStart(11, '0');
    }

    const is12Words = (targetTotal === 12);
    const missingEntropyBitsCount = is12Words ? 7 : 3;
    const totalEntropyBytes = is12Words ? 16 : 32;
    const checksumBitsCount = is12Words ? 4 : 8;
    const totalPossibilities = Math.pow(2, missingEntropyBitsCount); // 128 o 8

    const candidates = [];

    for (let val = 0; val < totalPossibilities; val++) {
      const candidateBits = val.toString(2).padStart(missingEntropyBitsCount, '0');
      const fullEntropyBits = knownBits + candidateBits;

      const entropyBytes = new Uint8Array(totalEntropyBytes);
      for (let b = 0; b < totalEntropyBytes; b++) {
        entropyBytes[b] = parseInt(fullEntropyBits.substring(b * 8, b * 8 + 8), 2);
      }

      const hashBuffer = await window.crypto.subtle.digest('SHA-256', entropyBytes);
      const hashBytes = new Uint8Array(hashBuffer);

      let checksumBitsStr = '';
      if (is12Words) {
        checksumBitsStr = ((hashBytes[0] >> 4) & 0x0F).toString(2).padStart(4, '0');
      } else {
        checksumBitsStr = hashBytes[0].toString(2).padStart(8, '0');
      }

      const lastWordBits = candidateBits + checksumBitsStr;
      const lastWordIdx = parseInt(lastWordBits, 2);
      const lastWord = window.BIP39_WORDLIST[lastWordIdx];
      const fullMnemonic = knownWords.join(' ') + ' ' + lastWord;

      let btcAddr = '';
      let ethAddr = '';

      if (!is12Words && window.MultiChainCrypto && window.MultiChainCrypto.deriveAllChains) {
        try {
          const derived = window.MultiChainCrypto.deriveAllChains(fullMnemonic, '');
          btcAddr = derived.bitcoin.nativeSegwit.address;
          ethAddr = derived.ethereum.address;
        } catch (e) {}
      }

      candidates.push({
        word: lastWord,
        index: lastWordIdx + 1,
        indexFormatted: String(lastWordIdx + 1).padStart(4, '0'),
        entropyCandidateBits: candidateBits,
        checksumBits: checksumBitsStr,
        fullPhrase: fullMnemonic,
        btcAddress: btcAddr,
        ethAddress: ethAddr
      });
    }

    candidates.sort((a, b) => a.word.localeCompare(b.word));
    recoveryState.currentCandidates = candidates;

    // Actualizar Estadísticas
    if (statValidCandidatesCount) statValidCandidatesCount.textContent = `${candidates.length} de 2048`;
    const rejectedPct = ((2048 - candidates.length) / 2048 * 100).toFixed(2);
    if (statRejectedSpacePct) statRejectedSpacePct.textContent = `${rejectedPct}%`;
    if (statChecksumBitsDesc) statChecksumBitsDesc.textContent = `${checksumBitsCount} bits`;
    if (statKnownEntropyBits) statKnownEntropyBits.textContent = `${knownBits.length} bits`;

    if (recoveryResultsContainer) recoveryResultsContainer.style.display = 'block';
    if (recoveryFilterInput) recoveryFilterInput.value = '';

    renderFilteredCandidates('');

    // Si el usuario especificó la última palabra (ej: frog)
    if (userSpecifiedLastWord) {
      const match = candidates.find(c => c.word.toLowerCase() === userSpecifiedLastWord.toLowerCase());
      if (match) {
        selectCandidateWord(match);
        showToast(`¡Confirmado! La palabra "${userSpecifiedLastWord.toUpperCase()}" es 100% VÁLIDA y cumple el checksum.`, 'success');
        if (recoveryInputFeedback) {
          recoveryInputFeedback.innerHTML = `<span style="color:#00e676; font-weight:bold;"> ¡Verificación Exitosa! La palabra #${match.indexFormatted} "${match.word.toUpperCase()}" es una de las 128 opciones válidas para esta frase.</span>`;
        }
      } else {
        selectCandidateWord(candidates[0]);
        showToast(`La palabra "${userSpecifiedLastWord}" NO cumple el checksum SHA-256 para estas 11 palabras.`, 'error');
        if (recoveryInputFeedback) {
          recoveryInputFeedback.innerHTML = `<span style="color:#ff6b6b; font-weight:bold;">Error de Checksum: "${escapeHTML(userSpecifiedLastWord)}" no es válida. Revisa las 128 opciones calculadas abajo.</span>`;
        }
      }
    } else {
      // Si solo ingreso 11 palabras
      selectCandidateWord(candidates[0]);
      showToast(`¡Cálculo exitoso! Se encontraron ${candidates.length} palabras que cumplen el checksum SHA-256.`, 'success');
      if (recoveryInputFeedback) {
        recoveryInputFeedback.innerHTML = `<span style="color:var(--cyan-accent);">Se calcularon ${candidates.length} palabras matemáticamente posibles. Por defecto se muestra la primera en orden alfabético ("${candidates[0].word.toUpperCase()}"). Haz clic en cualquiera de las tarjetas de abajo o escribe en el filtro para seleccionar otra.</span>`;
      }
    }
  }

  function renderFilteredCandidates(filterQuery) {
    if (!recoveryCandidatesGrid) return;
    recoveryCandidatesGrid.innerHTML = '';

    const is12Words = (recoveryState.targetTotalWords === 12);
    const list = recoveryState.currentCandidates.filter(c => {
      if (!filterQuery) return true;
      return c.word.startsWith(filterQuery) || c.indexFormatted.includes(filterQuery);
    });

    if (filterResultsTag) {
      filterResultsTag.textContent = `Mostrando ${list.length} de ${recoveryState.currentCandidates.length} candidatas`;
    }

    if (is12Words) {
      recoveryCandidatesGrid.classList.remove('layout-rich');
      list.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'candidate-card-btn';
        if (recoveryState.selectedCandidate && recoveryState.selectedCandidate.word === c.word) {
          btn.classList.add('is-selected');
        }
        btn.innerHTML = `
          <span class="cand-word-name">${c.word}</span>
          <span class="cand-word-idx">#${c.indexFormatted}</span>
        `;
        btn.addEventListener('click', function() {
          selectCandidateWord(c);
        });
        recoveryCandidatesGrid.appendChild(btn);
      });
    } else {
      // Tarjetas ricas para las 8 candidatas
      recoveryCandidatesGrid.classList.add('layout-rich');
      list.forEach((c, i) => {
        const card = document.createElement('div');
        card.className = 'rich-candidate-card';
        if (recoveryState.selectedCandidate && recoveryState.selectedCandidate.word === c.word) {
          card.classList.add('is-selected');
        }
        card.innerHTML = `
          <div class="rich-card-top">
            <span class="cand-word-name">${c.word}</span>
            <span class="cand-word-idx">BIP-39 #${c.indexFormatted} · Opción ${i + 1}/8</span>
          </div>
          <div class="rich-card-addrs">
            <div class="addr-entry">
              <strong>BTC:</strong> <span>${c.btcAddress || '--'}</span>
            </div>
            <div class="addr-entry">
              <strong>ETH:</strong> <span>${c.ethAddress || '--'}</span>
            </div>
          </div>
        `;
        card.addEventListener('click', function() {
          selectCandidateWord(c);
        });
        recoveryCandidatesGrid.appendChild(card);
      });
    }
  }

  function selectCandidateWord(candidate) {
    playHapticTick();
    recoveryState.selectedCandidate = candidate;

    // Actualizar clases seleccionadas en el grid
    const allBtns = recoveryCandidatesGrid.querySelectorAll('.candidate-card-btn, .rich-candidate-card');
    allBtns.forEach(el => el.classList.remove('is-selected'));

    if (reconstructedTitle) {
      reconstructedTitle.textContent = `Frase con última palabra: "${candidate.word.toUpperCase()}" (#${candidate.indexFormatted})`;
    }
    if (reconstructedPhraseText) {
      reconstructedPhraseText.textContent = candidate.fullPhrase;
    }

    if (reconstructedAddressesRow) {
      let btc = candidate.btcAddress;
      let eth = candidate.ethAddress;
      if (!btc && window.MultiChainCrypto && window.MultiChainCrypto.deriveAllChains) {
        try {
          const d = window.MultiChainCrypto.deriveAllChains(candidate.fullPhrase, '');
          btc = d.bitcoin.nativeSegwit.address;
          eth = d.ethereum.address;
        } catch (e) {}
      }

      reconstructedAddressesRow.innerHTML = `
        <div class="recon-addr-pill">
          <span>Bitcoin Native SegWit (BIP-84):</span>
          <code>${btc || '--'}</code>
        </div>
        <div class="recon-addr-pill">
          <span>Ethereum / EVM (BIP-44):</span>
          <code>${eth || '--'}</code>
        </div>
      `;
    }

    if (recoveryReconstructionBox) {
      recoveryReconstructionBox.style.display = 'flex';
    }
  }

  // Inicializar modulo de recuperacion
  initRecoveryModule();



})();

  // ==========================================================================
  // THEME & LANGUAGE CONTROLS (Dark/Light + Spanish/English)
  // ==========================================================================
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const btnLangToggle = document.getElementById('btn-lang-toggle');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('krypton_theme', theme);
    const sunIcon = document.querySelector('.theme-icon.sun-icon');
    const moonIcon = document.querySelector('.theme-icon.moon-icon');
    if (sunIcon && moonIcon) {
      if (theme === 'light') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'inline-block';
      } else {
        sunIcon.style.display = 'inline-block';
        moonIcon.style.display = 'none';
      }
    }
  }

  const savedTheme = localStorage.getItem('krypton_theme') || 'dark';
  applyTheme(savedTheme);

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      playHapticTick();
      const isEn = window.KryptonI18n && window.KryptonI18n.getCurrentLanguage() === 'en';
      showToast(next === 'light' ? (isEn ? 'Light Theme enabled' : 'Tema Claro activado') : (isEn ? 'Dark Theme enabled' : 'Tema Oscuro activado'), 'info');
    });
  }

  if (btnLangToggle) {
    btnLangToggle.addEventListener('click', function() {
      if (!window.KryptonI18n) return;
      const current = window.KryptonI18n.getCurrentLanguage();
      const next = current === 'es' ? 'en' : 'es';
      window.KryptonI18n.applyLanguage(next);
      playHapticTick();
      showToast(next === 'es' ? 'Idioma cambiado a Español' : 'Language switched to English', 'info');
    });
  }
