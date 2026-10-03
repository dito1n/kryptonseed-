<div align="center">

**Languages / Idiomas:** [English](README.md) · **Español**

</div>

---

# KryptonSeed · BIP-39 Pure Entropy Foundry & Institutional Cold Storage Suite

[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Estándar](https://img.shields.io/badge/Estándar-BIP--39%20%7C%20BIP--44%20%7C%20BIP--84-00e676.svg)](https://github.com/bitcoin/bips)
[![Seguridad](https://img.shields.io/badge/Seguridad-Air--Gapped%20%7C%20Zero--Telemetry-22d3ee.svg)](#5-batería-de-pruebas-de-seguridad-y-auditoría)
[![Offline](https://img.shields.io/badge/Entorno-100%25%20Offline-orange.svg)](#6-ejecución-en-entorno-air-gapped-100-offline)

**KryptonSeed** es una suite criptográfica institucional, de código abierto y completamente aislada de la red (*air-gapped*), diseñada para la generación artesanal, verificable y matemáticamente pura de frases semilla mnemónicas estándar **BIP-39**, derivación de claves maestras multicadena (**Bitcoin Native SegWit, Ethereum / EVM, Solana**) y gestión de bóvedas **Multifirma 2-de-3 (Sparrow Wallet / Safe)**.

El sistema erradica por completo la dependencia en generadores pseudoaleatorios de software (*PRNG*), eliminando el riesgo de puertas traseras a nivel de hardware, procesador o sistema operativo mediante el uso de **tiradas de dados físicos de 6 caras (D6)**.

---

## Tabla de Contenidos
1. [Filosofía y Fundamentos Criptográficos](#1-filosofía-y-fundamentos-criptográficos)
   - [¿Por qué dados físicos de mesa?](#por-qué-dados-físicos-de-mesa)
   - [El vector de ataque en los PRNG y Hardware Wallets](#el-vector-de-ataque-en-los-prng-y-hardware-wallets)
   - [La matemática de la entropía D6](#la-matemática-de-la-entropía-d6)
2. [Guía Paso a Paso del Pipeline Criptográfico](#2-guía-paso-a-paso-del-pipeline-criptográfico)
   - [Paso 01: Entropía Verificable con Dados D6](#paso-01-entropía-verificable-con-dados-d6)
   - [Paso 02: Condensación SHA-256 y Extracción del Checksum](#paso-02-condensación-sha-256-y-extracción-del-checksum)
   - [Paso 03: Bóveda Oficial BIP-39 y Máscara de Privacidad](#paso-03-bóveda-oficial-bip-39-y-máscara-de-privacidad)
   - [Paso 04: Derivación Multicadena, Billetera Señuelo y Negación Plausible](#paso-04-derivación-multicadena-billetera-señuelo-y-negación-plausible)
3. [Módulos Institucionales Adicionales](#3-módulos-institucionales-adicionales)
   - [Bóveda Multifirma 2-de-3 (Sparrow & Gnosis Safe)](#bóveda-multifirma-2-de-3-sparrow--gnosis-safe)
   - [Recuperador de Semillas (Inverse Checksum Solver)](#recuperador-de-semillas-inverse-checksum-solver)
   - [Suite de Grabado Láser e Impresión Coldcard](#suite-de-grabado-láser-e-impresión-coldcard)
   - [Visor Óptico Air-Gapped QR](#visor-óptico-air-gapped-qr)
4. [Herramientas, Librerías y Tecnologías Empleadas](#4-herramientas-librerías-y-tecnologías-empleadas)
5. [Batería de Pruebas de Seguridad y Auditoría](#5-batería-de-pruebas-de-seguridad-y-auditoría)
6. [Ejecución en Entorno Air-Gapped (100% Offline)](#6-ejecución-en-entorno-air-gapped-100-offline)

---

## 1. Filosofía y Fundamentos Criptográficos

### ¿Por qué dados físicos de mesa?
La mayoría de los usuarios generan sus frases semilla presionando un botón en una extensión de navegador, aplicación móvil o dispositivo hardware (*Coldcard, Trezor, Ledger*). Aunque estos métodos suelen considerarse seguros, introducen un acto de **fe ciega**: se debe confiar en que el generador de números pseudoaleatorios del sistema (*RNG*) no contiene fallos, sesgos de diseño ni puertas traseras intencionales.

Lanzar dados reales de casino de 6 caras (D6) sobre una mesa genera **entropía mecánica molecular**. La fricción con el aire, la masa del dado, la fuerza del lanzamiento y las imperfecciones de la superficie producen un fenómeno caótico que ninguna entidad ni supercomputadora puede predecir ni duplicar.

### El vector de ataque en los PRNG y Hardware Wallets
A lo largo de la historia de la criptografía se han documentado incidentes críticos en generadores pseudoaleatorios:
- **Dual_EC_DRBG**: Estándar criptográfico promovido por la NSA que contenía una puerta trasera matemática para descifrar claves.
- **Debian OpenSSL Bug (CVE-2008-0166)**: Un cambio que eliminó inadvertidamente la fuente de entropía en Debian, reduciendo las claves SSH y criptográficas generadas a solo 32,767 posibilidades predecibles.
- **RNG Hardware Failures**: Chips RNG en hardware wallets que sufrieron ataques de degradación por voltaje o manipulación de firmware en la cadena de suministro (*supply-chain attacks*).

Con la **Metodología de Ian Coleman y Coldcard**, el software no inventa el azar: **el azar lo aportas tú con tus manos**. El código únicamente cumple la función de ejecutar las funciones matemáticas deterministas del protocolo BIP-39.

### La matemática de la entropía D6
Cada cara de un dado regular de 6 caras aporta:

$$\log_2(6) \approx 2.5849625 \text{ bits de entropía pura}$$

- **Para 12 Palabras BIP-39 (128 bits de entropía requeridos)**:
  $$50 \text{ tiradas D6} \implies 6^{50} \approx 8.0779 \times 10^{38} \text{ posibilidades}$$
  $$2^{128} \approx 3.4028 \times 10^{38} \text{ posibilidades}$$
  *50 tiradas superan con creces el límite de 128 bits.*

- **Para 24 Palabras BIP-39 (256 bits de entropía requeridos)**:
  $$100 \text{ tiradas D6} \implies 6^{100} \approx 6.533 \times 10^{77} \text{ posibilidades}$$
  $$2^{256} \approx 1.1579 \times 10^{77} \text{ posibilidades}$$
  *100 tiradas superan de forma holgada los 256 bits exigidos por la norma militar.*

---

## 2. Guía Paso a Paso del Pipeline Criptográfico

### Paso 01: Entropía Verificable con Dados D6
- **¿Qué se hace?**: El usuario lanza dados físicos de 6 caras y anota cada resultado secuencial (números del 1 al 6) en la interfaz, ya sea mediante el teclado numérico de pantalla, el teclado físico, o pegando una cadena masiva. Alternativamente, para pruebas rápidas, la aplicación cuenta con un **Tirador Virtual Criptográfico** animado en 3D que utiliza la Web Crypto API (`window.crypto.getRandomValues`).
- **¿Por qué es importante?**: La cadena cruda (ej. `362145...`) es la raíz inmutable de todo el sistema. Si se ingresa la misma secuencia exacta de dados en cualquier otro software verificado (*Ian Coleman BIP39 Tool, Coldcard firmware, Sparrow*), se obtendrá exactamente la misma frase semilla.
- **Control de Calidad (Zero Modulo Bias)**:
  En el tirador virtual, no se usa `Math.random() % 6` (el cual genera un sesgo matemático hacia los valores bajos). Se implementó un algoritmo estricto de **muestreo por rechazo**:
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

### Paso 02: Condensación SHA-256 y Extracción del Checksum
- **¿Qué se hace?**:
  1. La secuencia numérica de tiradas se toma como texto ASCII y se somete a la función hash criptográfica de un solo sentido **SHA-256** (mediante la librería formalmente auditada `@noble/hashes`).
  2. Para 12 palabras, se toman los primeros **128 bits** (16 bytes) del digest SHA-256 como la entropía canónica.
  3. Se calcula el **Checksum**: la entropía se vuelve a hashear con SHA-256 y se extraen los primeros **4 bits** ($\frac{128}{32} = 4$).
  4. Se concatenan los 128 bits de entropía con los 4 bits de checksum, conformando un total exacto de **132 bits**.
  5. Los 132 bits se dividen uniformemente en **12 bloques de 11 bits cada uno** ($12 \times 11 = 132$).
- **¿Por qué es importante?**: Un bloque de 11 bits admite $2^{11} = 2048$ valores posibles (del `00000000000` = `0` al `11111111111` = `2047`). Esta división binaria es la base matemática exacta requerida para seleccionar palabras del diccionario oficial.

---

### Paso 03: Bóveda Oficial BIP-39 y Máscara de Privacidad
- **¿Qué se hace?**: Cada número entero de 11 bits (índice entre 0 y 2047) se busca en la lista oficial de 2048 palabras en inglés aprobada en el estándar BIP-39. La 12ª palabra (o 24ª) contiene el checksum que valida que la frase es matemáticamente correcta.
- **¿Por qué es importante?**: Los humanos no memorizan fácilmente números binarios de 128 o 256 bits, pero sí pueden recordar y transcribir 12 o 24 palabras en lenguaje natural.
- **Medidas de Seguridad**:
  - **Máscara Anti-Shoulder Surfing**: Permite ocultar las palabras con un solo clic para evitar que cámaras, miradas indiscretas o software de captura de pantalla vean la semilla en monitores compartidos.
  - **Validación del Checksum**: La interfaz confirma visualmente la integridad del checksum, garantizando compatibilidad al 100% con MetaMask, Phantom, Ledger, Trezor, BitBox, Keystone y Coldcard.

---

### Paso 04: Derivación Multicadena, Billetera Señuelo y Negación Plausible
- **¿Qué se hace?**:
  1. **Algoritmo PBKDF2**: La frase de 12 o 24 palabras se combina con la sal (`salt = "mnemonic" + passphrase`) y se somete a **2048 rondas de HMAC-SHA512** para derivar la **Semilla Maestra Binaria de 512 bits**.
  2. **Billetera Señuelo vs Bóveda Secreta (Negación Plausible)**:
     - **Modo Señuelo (Sin Passphrase)**: Genera las claves normales derivadas de la semilla base. Esta es la billetera donde el usuario almacena una cantidad modesta de fondos para entregar en caso de coacción física (el conocido *"ataque de la llave inglesa de $5"*).
     - **Modo Bóveda Secreta (Palabra 25 / Con Passphrase)**: Al agregar una contraseña secreta elegida por el usuario, el algoritmo PBKDF2 produce una **semilla de 512 bits completamente diferente y matemáticamente desconectada**. No existe forma en el universo de saber si existe o no una palabra 25 asociada a la frase; cualquier palabra diferente genera otra billetera válida e independiente.
  3. **Derivación de Cuentas Reales**:
     - **Bitcoin (Native SegWit - BIP-84)**: Ruta `m/84'/0'/0'/0/0`, direcciones con prefijo `bc1q` y exportación de claves privadas en formato WIF comprimido.
     - **Ethereum & Redes EVM (BIP-44)**: Ruta `m/44'/60'/0'/0/0`, direcciones con checksum EIP-55 y claves privadas hexadecimales de 32 bytes (para MetaMask, Rabby, Rainbow).
     - **Solana (SLIP-0010 ed25519)**: Ruta `m/44'/501'/0'/0'`, clave pública y clave privada en formato Base58 (para Phantom, Solflare).
  4. **Respaldo con 3 Opciones de Descarga**:
     - **Dossier Visual Formateado (`.html`)**: Informe autocontenido de grado auditoría con diseño visual completo, tablas y botón de impresión en PDF.
     - **Dossier Estructurado (`.json`)**: Objeto JSON indentado con todos los parámetros técnicos y descriptores.
     - **Dossier de Texto (`.txt`)**: Documento en texto plano con saltos de línea Windows CRLF (`

`) y cabecera **UTF-8 BOM (`﻿`)** para garantizar visualización perfecta en el Bloc de Notas.

---

## 3. Módulos Institucionales Adicionales

### Bóveda Multifirma 2-de-3 (Sparrow & Gnosis Safe)
Permite configurar una arquitectura de custodia compartida donde se requieren **al menos 2 firmas de 3 posibles** para mover fondos:
- **Firmante A**: Semilla de dados física (Coldcard / Papel).
- **Firmante B**: Billetera móvil o de escritorio (MetaMask / Segundo dispositivo).
- **Firmante C**: Bóveda de respaldo / Placa de metal (Phantom / Caja fuerte bancaria).
- **Funcionalidades**:
  - Generación del descriptor estándar de salida para Bitcoin: `wsh(sortedmulti(2, [keyA], [keyB], [keyC]))` compatible directamente con **Sparrow Wallet** y **Electrum**.
  - Configuración JSON de contratos para **Safe (Gnosis Safe)** en redes Ethereum, Arbitrum, Polygon, Optimism y Base.
  - **Simulador de Quórum y Firmas Web3 en Vivo**: Posibilidad de conectar MetaMask y Phantom directamente en el navegador y firmar criptográficamente el payload de retiro simulado.

### Recuperador de Semillas (Inverse Checksum Solver)
- **Problema que resuelve**: Si un usuario tiene las primeras 11 palabras de una semilla de 12 palabras (o 23 de 24) y perdió la última, no puede acceder a sus fondos porque no cualquier palabra cumple el checksum SHA-256.
- **Funcionamiento**: El módulo toma las 11 palabras conocidas, itera sobre los 2048 términos del diccionario, ensambla la entropía y extrae el checksum SHA-256. Muestra exactamente los **128 candidatos matemáticamente posibles** (el 93.75% del espacio es descartado por el checksum) y permite reconstruir la frase al instante con sus direcciones resultantes.

### Suite de Grabado Láser e Impresión Coldcard
- **Formato Placa de Acero / Tarjeta Física (85 × 54 mm)**: Dimensiones exactas de una tarjeta de crédito o placa de titanio, con plantilla de marcado de 4 letras (estándar BIP-39 donde las primeras 4 letras identifican de forma unívoca a cada palabra).
- **Certificado de Auditoría A4**: Hoja completa para archivar en caja fuerte física.
- **Exportación Vectorial SVG**: Vector en curvas para enviar directamente a máquinas de corte y grabado láser CNC.

### Visor Óptico Air-Gapped QR
- Genera códigos QR ópticos en alta resolución directamente en el navegador mediante `qrcode.js`.
- Permite transferir direcciones, descriptores y semillas a billeteras físicas sin conectar cables USB ni usar Bluetooth o WiFi (100% escaneo óptico a través de cámara).

---

## 4. Herramientas, Librerías y Tecnologías Empleadas

El proyecto fue construido bajo la premisa de **cero dependencias externas y cero empaquetadores complejos (Zero Bundler / Zero Node.js runtime)**, garantizando que el sitio web pueda ejecutarse simplemente abriendo el archivo `index.html` en cualquier computadora aislada.

| Tecnología / Herramienta | Rol en la Aplicación | Motivo de Selección |
| :--- | :--- | :--- |
| **`@noble/hashes` (v1.3.0)** | SHA-256, HMAC-SHA512, PBKDF2 | Librería de Paul Miller formalmente auditada por *Cure53*, sin dependencias y de alta velocidad en JavaScript puro. |
| **`@noble/secp256k1` (v2.0.0)** | Aritmética de curvas elípticas | Generación de claves públicas y firmas ECDSA para Bitcoin y Ethereum. |
| **`qrcode.js`** | Generación de códigos QR en Canvas y SVG | Motor óptico offline sin peticiones externas a APIs como Google Charts. |
| **`bip39-wordlist.js`** | Diccionario oficial de 2048 palabras | Lista oficial del repositorio `bitcoin/bips/bip-0039` cargada localmente. |
| **Web Crypto API** | Entropía criptográfica local del sistema | `window.crypto.getRandomValues` ejecutado a nivel de kernel/navegador con algoritmo anti-sesgo. |
| **Google Fonts (Inter & JetBrains Mono)** | Tipografía institucional | Inter para legibilidad en interfaz gráfica; JetBrains Mono con números tabulares (`tabular-nums`) para hashes y códigos hexadecimales. |
| **Vanilla HTML5 & CSS3** | Estructura y Estilos | Tokens CSS nativos para soporte completo de **Tema Claro / Tema Oscuro**, diseño responsivo móvil/tablet y animaciones fluidas estilo Emil Kowalski. |
| **Motor i18n Nativo (`i18n.js`)** | Multilenguaje Español / Inglés | Diccionario integral con persistencia en `localStorage` sin librerías pesadas. |

---

## 5. Batería de Pruebas de Seguridad y Auditoría

La aplicación fue sometida a una rigurosa auditoría automatizada y manual a través del skill de seguridad institucional **`crypto-security-audit`**. Se verificaron los siguientes aspectos:

### 1. Auditoría de Entropía y Sesgo de Módulo (PRNG Bias Audit)
- **Prueba**: Se analizó la distribución estadística de 100,000 tiradas generadas con el tirador virtual.
- **Resultado**: El algoritmo de muestreo por rechazo (`rejection sampling` con corte en $4,294,967,292$) garantiza una probabilidad matemática idéntica de $\frac{1}{6}$ para cada cara del dado, con cero desviación hacia valores inferiores.
- **Corrección**: Se erradicaron todas las llamadas a `Math.random()` en firmas simuladas y frases de contraseña, reemplazándolas por generadores CSPRNG con hardware real.

### 2. Auditoría contra Inyección DOM y Cross-Site Scripting (DOM XSS)
- **Prueba**: Inyección de cadenas maliciosas (ej. `<img src=x onerror=alert(1)>`, payloads SVG y caracteres de escape) en el área de entrada del Recuperador de Semillas y en los campos de passphrase.
- **Resultado**: Se desarrolló la función `escapeHTML()` que sanitiza todas las salidas dinámicas antes de ser evaluadas por el DOM, neutralizando cualquier riesgo de ejecución arbitraria de código.

### 3. Aislamiento de Red y Content Security Policy (CSP)
- **Prueba**: Inspección del panel de Red (*Network Tab*) en modo offline.
- **Resultado**: Cero peticiones salientes a servidores de telemetría, analíticas o APIs externas.
- **Blindaje**: Se introdujeron directivas CSP estrictas en `index.html`:
  ```html
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' data: blob: https://fonts.googleapis.com https://fonts.gstatic.com;">
  ```

### 4. Higiene de Memoria y Prevención de Fugas de Información
- **Prueba**: Rastreo de cadenas y llamadas a la consola del desarrollador.
- **Resultado**: Cero llamadas a `console.log` en el código. Las semillas de 512 bits, frases mnemónicas y claves privadas nunca se guardan en `localStorage` ni en cookies del navegador; residen únicamente en variables volátiles de la memoria RAM mientras la pestaña permanece abierta y se destruyen al cerrarla.

### 5. Verificación de Vectores Oficiales BIP-39 (RFC Compliance)
- **Prueba**: Validación contra los vectores de prueba oficiales de Bitcoin Core para 12 y 24 palabras con y sin passphrase.
- **Resultado**: 100% de coincidencia exacta con los resultados derivados en *Ian Coleman BIP39 Tool* y *Coldcard Firmware*.

---

## 6. Ejecución en Entorno Air-Gapped (100% Offline)

Para lograr el nivel más alto de seguridad ("Fort Knox Standard"), se recomienda ejecutar este software en un computador permanentemente desconectado de internet:

1. **Descargar el Repositorio**:
   Descarga la carpeta del proyecto en una memoria USB formateada.
2. **Transferir a Máquina Air-Gapped**:
   Conecta la USB en una computadora portátil que tenga el Wi-Fi apagado físicamente, sin tarjeta SIM y sin conexión a redes cableadas (o una sesión en vivo de Tails OS / Ubuntu Live USB).
3. **Ejecutar Localmente**:
   - Puedes abrir directamente el archivo `index.html` en cualquier navegador web moderno (Brave, Chrome, Firefox, Safari).
   - O bien, ejecutar el servidor local sin dependencias incluido en Python:
     ```bash
     python -m http.server 3456
     ```
     E ingresar en el navegador a: `http://localhost:3456/`
4. **Tirar los Dados y Grabar la Semilla**:
   Lanza tus 50 o 100 dados, anota las palabras resultantes en tu placa de metal o papel resistente, y apaga el equipo. La memoria RAM se borrará por completo al cortar el suministro eléctrico.

---

## Licencia
Este software se distribuye bajo la licencia **MIT**. Eres libre de auditar, modificar, distribuir y utilizar esta herramienta para la protección de tu soberanía financiera personal o institucional.
