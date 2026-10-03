// ==========================================================================
// KRYPTONSEED i18n TRANSLATION ENGINE (ES / EN)
// ==========================================================================

(function() {
  'use strict';

  const translations = {
    es: {
      // Header & Navigation
      appTitle: 'KryptonSeed',
      appSubtitle: 'Generador Criptográfico BIP-39 con Dados Reales & Suite de Seguridad Institucional',
      tabSingleSeed: 'Semilla Simple BIP-39',
      tabMultisigVault: 'Bóveda Multifirma 2-de-3',
      tabRecoverySolver: 'Recuperador de Semillas',
      tagMultisig: 'Multisig',
      tagChecksum: 'Checksum Inverso',

      // Pipeline Steps
      step1Pill: 'Paso 01 de 04 · Entropía Verificable con Dados D6',
      step1Title: 'Generador de Entropía con Dados Físicos',
      step1Desc: 'Cada cara de un dado de 6 caras (D6) aporta aproximadamente 2.585 bits de entropía pura de hardware real. Registra tus tiradas para construir una semilla matemáticamente inmune a puertas traseras.',
      targetLengthLabel: 'Longitud de Semilla:',
      target12Words: '12 Palabras (50 Dados · 128 bits)',
      target24Words: '24 Palabras (100 Dados · 256 bits)',
      diceRollHelp: 'Haz clic en el dado 3D, ingresa números del 1 al 6 o tira masivamente:',
      btnRollRandom: 'Tirar 1 Dado',
      btnRollBatch: 'Tirar 50 Dados',
      btnClearRolls: 'Limpiar Todo',
      btnUndoRoll: 'Deshacer Última',
      manualInputPlaceholder: 'Ingresa números 1-6 o pega una secuencia...',
      rollsProgressLabel: 'Progreso de Tiradas:',
      entropyGeneratedLabel: 'Entropía Efectiva:',
      btnProceedStep2: 'Continuar a SHA-256',
      // Multisig & Button additions
      btnRollComplete: 'Completar Todas',
      btnConnectMetaMask: 'Conectar MetaMask',
      btnConnectPhantom: 'Conectar Phantom',
      btnUseCurrentSeed: 'Usar Semilla Actual',
      btnRollDiceSigner: 'Tirar Dados',
      signer1Title: 'Firmante A (Casa / Hardware)',
      signer2Title: 'Firmante B (Móvil / MetaMask)',
      signer3Title: 'Firmante C (Bóveda / Phantom)',
      signer1Desc: 'Semilla de dados / Coldcard / Hardware',
      signer2Desc: 'MetaMask en móvil o segundo dispositivo',
      signer3Desc: 'Billetera Phantom en móvil / Caja bancaria',
      btcPubSecpLabel: 'Clave Pública Bitcoin (secp256k1 compressed):',
      evmAddressLabel: 'Dirección EVM / Ethereum:',


      // Step 2 (SHA-256)
      step2Pill: 'Paso 02 de 04 · Función Hash SHA-256 & Checksum',
      step2Title: 'Descomposición Criptográfica y Checksum',
      step2Desc: 'La cadena física de dados se somete a la función criptográfica SHA-256. Se calcula el checksum de verificación y la entropía se divide en bloques binarios de 11 bits (2048 posibilidades por palabra).',
      btnBackStep1: 'Volver a Tiradas',
      btnProceedStep3: 'Continuar a Diccionario BIP-39',
      shaHashLabel: 'Hash Criptográfico SHA-256 de las Tiradas D6:',
      checksumLabel: 'Checksum Criptográfico Extraído:',
      binaryBreakdownTitle: 'Partición Binaria de 11 Bits por Palabra:',

      // Step 3 (Vault)
      step3Pill: 'Paso 03 de 04 · Diccionario Oficial BIP-39',
      step3Title: 'Bóveda de Frase Semilla Mnemónica',
      step3Desc: 'Los índices de 11 bits han sido traducidos a las palabras oficiales del estándar BIP-39 en inglés. Esta frase es tu llave maestra universal.',
      btnBackStep2: 'Volver a SHA-256',
      checksumValidTag: 'Checksum Válido · Compatible con 100% de Billeteras',
      btnToggleMaskHide: 'Ocultar Semilla',
      btnToggleMaskShow: 'Mostrar Semilla',
      btnCopySeed: 'Copiar Frase',
      btnDownloadBackup: 'Descargar Respaldo',
      btnQuickDownloadColdcard: 'Descargar Tarjeta Fría',
      btnOpenPrintModal: 'Imprimir / Personalizar',
      btnQrSeedPhrase: 'Ver QR Semilla',
      plainTextBoxTitle: 'Frase en Texto Plano (Para importar en MetaMask, Phantom, Ledger, etc.):',
      btnProceedStep4: 'Continuar a Derivación Multi-Cadena',
      recoveryNoticeTitle: '¿Perdiste la última palabra de un respaldo antiguo?',
      recoveryNoticeDesc: 'El estándar BIP-39 restringe las opciones: exactamente 128 opciones para 12 palabras, o sólo 8 para 24 palabras.',
      btnOpenRecovery: 'Abrir Recuperador',

      // Step 4 (Multichain)
      step4Pill: 'Paso 04 de 04 · Derivación HD Multi-Cadena',
      step4Title: 'Derivación Jerárquica Determinista (HD)',
      step4Desc: 'A partir de tu frase semilla de dados, generamos las direcciones públicas y privadas de las redes blockchain más importantes utilizando los estándares oficiales BIP-32, BIP-44, BIP-84 y SLIP-0010.',
      btnBackStep3: 'Volver a Palabras',
      passphraseHeaderTitle: 'La "Palabra 25" (Passphrase Opcional) & Billetera Señuelo',
      passphraseHeaderDesc: 'El estándar BIP-39 no solo te protege de hackers remotos, sino también de extorsión física. Con las mismas palabras de dados, cualquier contraseña genera una bóveda paralela matemáticamente invisible.',
      deniabilityTag: 'Estándar BIP-39 · Negación Plausible',
      wrenchAttackTag: 'Defensa contra "$5 Wrench Attack"',
      tabVaultSecret: 'Bóveda Secreta (Con Passphrase)',
      tabVaultSecretSub: 'Para el 99% de tus fondos',
      tabVaultDecoy: 'Billetera Señuelo (Sin Passphrase)',
      tabVaultDecoySub: 'Para entregar bajo coacción ($50)',
      tabVaultCompare: 'Comparativa Lado a Lado',
      tabVaultCompareSub: 'Dos universos con los mismos dados',
      passphrasePlaceholder: 'Escribe tu "Palabra 25" secreta (ej: MiClaveSecretaCypherpunk2026!)',
      btnSuggestPass: 'Sugerir Segura',
      btnApplyPass: 'Aplicar & Derivar',
      masterSeedLabel: 'Semilla Maestra Binaria (512 bits / 64 bytes via PBKDF2 HMAC-SHA512):',
      btnCopyMasterSeed: 'Copiar Semilla 512b',

      // Multisig Module
      multisigPill: 'Módulo de Custodia Institucional · 2 de 3',
      multisigTitle: 'Bóveda Multifirma (Multisig 2-de-3)',
      multisigDesc: 'Protección de nivel bancario: combina 3 llaves independientes (ej: dados en casa, MetaMask en PC y Phantom en móvil). Se requieren obligatoriamente 2 firmas de 3 para autorizar cualquier transacción.',
      quorumBadgeText: 'Quórum: 2 de 3 Firmas Requeridas',
      signer1Title: 'Firmante A (Semilla Fría de Dados)',
      signer1Meta: 'Custodiada en placa de acero en casa',
      signer2Title: 'Firmante B (Móvil / MetaMask)',
      signer2Meta: 'Billetera en navegador o dispositivo secundario',
      signer3Title: 'Firmante C (Bóveda / Respaldo / Phantom)',
      signer3Meta: 'Custodiada en ubicación geográfica aislada',
      btnConnectMetaMask: 'Conectar MetaMask',
      btnConnectPhantom: 'Conectar Phantom',
      btnRollDiceKey: 'Tirar Dados',
      btnComputeMultisig: 'Calcular Bóveda Multifirma (P2WSH & Safe)',
      btnCopyMultisigAddr: 'Copiar Dirección',
      btnDownloadSparrow: 'Descargar Config (.txt)',
      btnCopySafeJson: 'Copiar JSON',
      btnExportFullDossier: 'Descargar Dossier Completo',
      exportDossierPrompt: '¿Deseas respaldar todas las direcciones y claves maestras generadas?',
      exportDossierDesc: 'Descarga un informe completo y formateado para tu caja fuerte o archivo en frío.',
      btnExportDossierHtml: 'Dossier Visual (.html)',
      btnExportDossierJson: 'Estructurado (.json)',
      btnExportDossierTxt: 'Texto (.txt)',

      simTitle: 'Simulador Interactivo de Transacción Multifirma',
      simDesc: 'Prueba el proceso real de retiro: se requieren 2 de las 3 firmas para transmitir la transacción a la blockchain.',
      btnSignKey1: 'Firmar con Llave 1 (Papel / Dados)',
      btnSignKey2: 'Firmar con Llave 2 (MetaMask)',
      btnSignKey3: 'Firmar con Llave 3 (Phantom)',
      btnResetSim: 'Restablecer Simulador',

      // Recovery Module
      recoveryPill: 'Criptoanálisis BIP-39 · Rescate Matemático',
      recoveryTitle: 'Recuperador de Semillas (Checksum Inverso)',
      recoveryDesc: '¿Perdiste la última palabra de tu respaldo mnemónico por desgaste físico o error de copia? Las reglas del hash SHA-256 reducen el universo de búsqueda: exactamente 128 opciones para 12 palabras, o sólo 8 opciones para 24 palabras.',
      recovery11BtnTitle: '11 Palabras Conocidas',
      recovery11BtnSub: '(Falta la #12 · 128 candidatas)',
      recovery24BtnTitle: '23 Palabras Conocidas',
      recovery24BtnSub: '(Falta la #24 · ¡Solo 8 candidatas!)',
      btnLoadSample: 'Cargar Ejemplo',
      btnClear: 'Limpiar',
      inputWordsLabel: 'Palabras Conocidas en Orden (separadas por espacio):',
      inputWordsPlaceholder: 'Pega o escribe las palabras aquí (ej: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon)...',
      btnComputeRecovery: 'Calcular Palabras Válidas & Checksum Inverso',
      candidatesStatLabel: 'CANDIDATAS VÁLIDAS:',
      rejectedStatLabel: 'ESPACIO DESCARTADO:',
      checksumBitsStatLabel: 'BITS CHECKSUM SHA-256:',
      knownEntropyStatLabel: 'ENTROPÍA CONOCIDA:',
      filterPlaceholder: 'Filtrar por letra o prefijo (ej: "b" o "cat")...',

      // Modals
      printModalTitle: 'Tarjeta de Respaldo Físico (Cold Card)',
      printModalSubtitle: 'Genera plantillas de grado de archivo listas para punzonar en placas de acero (Cryptosteel/Keystone) o archivar en bóveda ignífuga sin conexión.',
      templateTypeLabel: 'Tipo de Plantilla',
      singleSeedOption: 'Semilla Simple',
      multisigTriptychOption: 'Tríptico 2-de-3 (3 Tarjetas)',
      layoutStyleLabel: 'Diseño Físico',
      steelLayoutOption: 'Placa de Acero / Tarjeta (85×54mm)',
      certificateLayoutOption: 'Hoja de Bóveda A4 / Auditoría',
      chkRevealWords: 'Rellenar palabras generadas',
      chkHighlight4Letters: 'Destacar primeras 4 letras (BIP-39 Punch Standard)',
      chkIncludeSha: 'Incluir huella SHA-256 de verificación',
      btnDownloadHtml: 'Descargar Tarjeta (.html autónomo)',
      btnDownloadSvg: 'Descargar Vectorial (.svg grabado láser)',
      btnPrintNative: 'Diálogo de Impresora (Ctrl + P)',

      qrModalTitle: 'Código QR Criptográfico Air-Gapped',
      qrModalDesc: 'Escaneo seguro sin conexión. Compatible con teléfonos móviles y cámaras de billeteras frías de hardware.',
      btnCopyQrText: 'Copiar Texto',
      btnSaveQrPng: 'Guardar Imagen (.png)',
      btnSaveQrSvg: 'Vector (.svg)'
    },

    en: {
      // Header & Navigation
      appTitle: 'KryptonSeed',
      appSubtitle: 'BIP-39 True Dice Cryptographic Generator & Institutional Security Suite',
      tabSingleSeed: 'Single Seed BIP-39',
      tabMultisigVault: '2-of-3 Multisig Vault',
      tabRecoverySolver: 'Seed Recovery Solver',
      tagMultisig: 'Multisig',
      tagChecksum: 'Inverse Checksum',

      // Pipeline Steps
      step1Pill: 'Step 01 of 04 · Verifiable Entropy with D6 Dice',
      step1Title: 'True Physical Dice Entropy Generator',
      step1Desc: 'Each face of a standard 6-sided die (D6) contributes approximately 2.585 bits of genuine hardware entropy. Record your physical rolls to construct a master seed mathematically immune to backdoors.',
      targetLengthLabel: 'Seed Length:',
      target12Words: '12 Words (50 Dice · 128 bits)',
      target24Words: '24 Words (100 Dice · 256 bits)',
      diceRollHelp: 'Click the 3D dice, type numbers 1-6 or roll in batch:',
      btnRollRandom: 'Roll 1 Die',
      btnRollBatch: 'Roll 50 Dice',
      btnClearRolls: 'Clear All',
      btnUndoRoll: 'Undo Last',
      manualInputPlaceholder: 'Type numbers 1-6 or paste a sequence...',
      rollsProgressLabel: 'Rolls Progress:',
      entropyGeneratedLabel: 'Effective Entropy:',
      btnProceedStep2: 'Continue to SHA-256',

      // Step 2 (SHA-256)
      step2Pill: 'Step 02 of 04 · SHA-256 Hash Function & Checksum',
      step2Title: 'Cryptographic Decomposition & Checksum',
      step2Desc: 'The physical dice string undergoes cryptographic SHA-256 hashing. The verification checksum is derived, and entropy is partitioned into 11-bit binary blocks (2048 possibilities per word).',
      btnBackStep1: 'Back to Dice Rolls',
      btnProceedStep3: 'Continue to BIP-39 Wordlist',
      shaHashLabel: 'SHA-256 Cryptographic Hash of D6 Rolls:',
      checksumLabel: 'Extracted Cryptographic Checksum:',
      binaryBreakdownTitle: '11-Bit Binary Partition per Word:',

      // Step 3 (Vault)
      step3Pill: 'Step 03 of 04 · Official BIP-39 English Wordlist',
      step3Title: 'Mnemonic Seed Phrase Vault',
      step3Desc: 'The 11-bit indices are translated into official BIP-39 English standard words. This phrase serves as your universal cryptographic master key.',
      btnBackStep2: 'Back to SHA-256',
      checksumValidTag: 'Valid Checksum · 100% Wallet Compatible',
      btnToggleMaskHide: 'Hide Seed',
      btnToggleMaskShow: 'Reveal Seed',
      btnCopySeed: 'Copy Phrase',
      btnDownloadBackup: 'Download Backup',
      btnQuickDownloadColdcard: 'Download Cold Card',
      btnOpenPrintModal: 'Print / Customize',
      btnQrSeedPhrase: 'View Seed QR',
      plainTextBoxTitle: 'Plain Text Phrase (To import into MetaMask, Phantom, Ledger, etc.):',
      btnProceedStep4: 'Continue to Multi-Chain Derivation',
      recoveryNoticeTitle: 'Lost the final word of an old backup?',
      recoveryNoticeDesc: 'The BIP-39 standard mathematically constrains choices: exactly 128 candidates for 12 words, or only 8 for 24 words.',
      btnOpenRecovery: 'Open Recovery Tool',

      // Step 4 (Multichain)
      step4Pill: 'Step 04 of 04 · HD Multi-Chain Derivation',
      step4Title: 'Hierarchical Deterministic (HD) Derivation',
      step4Desc: 'Derived from your physical dice seed phrase, public and private addresses for major blockchains are computed using BIP-32, BIP-44, BIP-84 and SLIP-0010 standards.',
      btnBackStep3: 'Back to Words Vault',
      passphraseHeaderTitle: 'The "25th Word" (Optional Passphrase) & Decoy Wallet',
      passphraseHeaderDesc: 'BIP-39 protects you not only from online attackers, but also physical extortion. Using the exact same dice seed words, any password derives an entirely independent, hidden vault.',
      deniabilityTag: 'BIP-39 Standard · Plausible Deniability',
      wrenchAttackTag: 'Defense against "$5 Wrench Attack"',
      tabVaultSecret: 'Hidden Vault (With Passphrase)',
      tabVaultSecretSub: 'For 99% of your net worth',
      tabVaultDecoy: 'Decoy Wallet (No Passphrase)',
      tabVaultDecoySub: 'To surrender under duress ($50)',
      tabVaultCompare: 'Side-by-Side Comparison',
      tabVaultCompareSub: 'Two universes with the same dice',
      passphrasePlaceholder: 'Type your secret "25th Word" (e.g., MySecretCypherpunkKey2026!)',
      btnSuggestPass: 'Suggest Secure',
      btnApplyPass: 'Apply & Derive',
      masterSeedLabel: 'Binary Master Seed (512 bits / 64 bytes via PBKDF2 HMAC-SHA512):',
      btnCopyMasterSeed: 'Copy 512b Master Seed',

      // Multisig Module
      multisigPill: 'Institutional Custody Module · 2 of 3',
      multisigTitle: 'Multisig Vault (2-of-3 Threshold)',
      multisigDesc: 'Bank-grade security: combines 3 independent keys (e.g., dice at home, MetaMask on desktop, Phantom on mobile). 2 of 3 signatures are mandatory to authorize any transfer.',
      quorumBadgeText: 'Quorum: 2 of 3 Signatures Required',
      signer1Title: 'Signer A (Cold Dice Seed)',
      signer1Meta: 'Stamped in stainless steel plate at home',
      signer2Title: 'Signer B (Mobile / MetaMask)',
      signer2Meta: 'Browser extension or secondary device',
      signer3Title: 'Signer C (Vault / Backup / Phantom)',
      signer3Meta: 'Secured at an isolated geographic location',
      btnConnectMetaMask: 'Connect MetaMask',
      btnConnectPhantom: 'Connect Phantom',
      btnRollDiceKey: 'Roll Dice',
      btnComputeMultisig: 'Compute Multisig Vault (P2WSH & Safe)',
      btnCopyMultisigAddr: 'Copy Address',
      btnDownloadSparrow: 'Download Config (.txt)',
      btnCopySafeJson: 'Copy JSON',
      btnExportFullDossier: 'Download Full Dossier',
      exportDossierPrompt: 'Want to backup all generated keys and master addresses?',
      exportDossierDesc: 'Download a complete formatted report for your safe or cold storage.',
      btnExportDossierHtml: 'Visual Dossier (.html)',
      btnExportDossierJson: 'Structured (.json)',
      btnExportDossierTxt: 'Plain Text (.txt)',

      simTitle: 'Interactive Multisig Signing Simulator',
      simDesc: 'Experience the real withdrawal flow: 2 of 3 signatures are strictly required to broadcast to blockchain miners.',
      btnSignKey1: 'Sign with Key 1 (Paper / Dice)',
      btnSignKey2: 'Sign with Key 2 (MetaMask)',
      btnSignKey3: 'Sign with Key 3 (Phantom)',
      btnResetSim: 'Reset Simulator',

      // Recovery Module
      recoveryPill: 'BIP-39 Cryptanalysis · Mathematical Rescue',
      recoveryTitle: 'Seed Recovery Solver (Inverse Checksum)',
      recoveryDesc: 'Lost the final word of your seed backup due to physical damage or transcription error? SHA-256 hash constraints reduce the search space: exactly 128 candidates for 12 words, or only 8 candidates for 24 words.',
      recovery11BtnTitle: '11 Known Words',
      recovery11BtnSub: '(Missing #12 · 128 candidates)',
      recovery24BtnTitle: '23 Known Words',
      recovery24BtnSub: '(Missing #24 · Only 8 candidates!)',
      btnLoadSample: 'Load Sample',
      btnClear: 'Clear',
      inputWordsLabel: 'Known Words in Sequential Order (space-separated):',
      inputWordsPlaceholder: 'Paste or type words here (e.g., abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon)...',
      btnComputeRecovery: 'Compute Valid Words & Inverse Checksum',
      candidatesStatLabel: 'VALID CANDIDATES:',
      rejectedStatLabel: 'REJECTED SEARCH SPACE:',
      checksumBitsStatLabel: 'SHA-256 CHECKSUM BITS:',
      knownEntropyStatLabel: 'KNOWN ENTROPY:',
      filterPlaceholder: 'Filter by letter or prefix (e.g., "b" or "cat")...',

      // Modals
      printModalTitle: 'Physical Cold Storage Card',
      printModalSubtitle: 'Generate archival-grade templates ready for stamping into stainless steel plates (Cryptosteel/Keystone) or safe storage in fireproof vaults offline.',
      templateTypeLabel: 'Template Type',
      singleSeedOption: 'Single Seed',
      multisigTriptychOption: '2-of-3 Triptych (3 Cards)',
      layoutStyleLabel: 'Physical Layout',
      steelLayoutOption: 'Steel Plate / Card (85×54mm)',
      certificateLayoutOption: 'A4 Vault Sheet / Audit Certificate',
      chkRevealWords: 'Fill with generated words',
      chkHighlight4Letters: 'Highlight first 4 letters (BIP-39 Punch Standard)',
      chkIncludeSha: 'Include SHA-256 verification hash',
      btnDownloadHtml: 'Download Card (.html standalone)',
      btnDownloadSvg: 'Download Vector (.svg laser engraving)',
      btnPrintNative: 'Printer Dialog (Ctrl + P)',

      qrModalTitle: 'Air-Gapped Optical QR Code',
      qrModalDesc: 'Secure offline optical scan. Fully compatible with smartphones and hardware cold wallet optical cameras.',
      btnCopyQrText: 'Copy Text',
      btnSaveQrPng: 'Save Image (.png)',
      btnSaveQrSvg: 'Vector (.svg)'
    }
  };

  let currentLang = localStorage.getItem('krypton_lang') || 'es';

  function applyLanguage(lang) {
    if (!translations[lang]) lang = 'es';
    currentLang = lang;
    localStorage.setItem('krypton_lang', lang);

    document.documentElement.setAttribute('lang', lang);

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    const phElements = document.querySelectorAll('[data-i18n-ph]');
    phElements.forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (translations[lang][key]) {
        el.setAttribute('placeholder', translations[lang][key]);
      }
    });

    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      const activeSpan = langBtn.querySelector('.lang-current');
      if (activeSpan) activeSpan.textContent = lang.toUpperCase();
    }
  }

  function getTranslation(key) {
    if (translations[currentLang] && translations[currentLang][key]) {
      return translations[currentLang][key];
    }
    return translations['es'][key] || key;
  }

  window.KryptonI18n = {
    applyLanguage: applyLanguage,
    getTranslation: getTranslation,
    getCurrentLanguage: function() { return currentLang; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      applyLanguage(currentLang);
    });
  } else {
    applyLanguage(currentLang);
  }
})();
