---
name: impeccable
description: >-
  Criterio de diseno artesanal de maximo nivel para aplicaciones web.
  Enfocado en eliminar lo generico, crear sistemas de diseno armoniosos,
  paletas de color curadas con ratios de contraste WCAG AAA, jerarquia tipografica rigurosa,
  espaciado consistente con escala modular, bordes ultra-finos y acabados de lujo industrial.
---

# Impeccable Design Skill

Esta skill define el estandar de ejecucion visual y de producto para evitar interfaces genericas o de plantilla.

## 1. Reglas Fundamentales de Estetica
- **Cero Paletas Genericas**: Prohibido usar cian/morado generico sin calibracion. Usar tonos calibrados con iluminacion natural, balances HSL intencionales (ej. obsidiana profunda, slate polar, acentos en oro ambar o esmeralda bionico).
- **Materialidad y Profundidad**: Bordes con capas multiples (1px solid rgba(255, 255, 255, 0.07) exterior, con luces interiores sutiles inset 0 1px 0 rgba(255,255,255,0.08)).
- **Tipografia de Precision**:
  - ont-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11' para fuentes modernas como Geist o Inter.
  - ont-variant-numeric: tabular-nums obligatorio para contadores, hashes, hashes SHA-256, bits y porcentajes para evitar saltos de layout (layout shift).
- **Escala de Espaciado Modular**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px.

## 2. Experiencia de Usuario de Grado Suizo
- **Claridad de Estados**: Cada accion tiene feedback inmediato en menos de 16ms (1 frame a 60fps).
- **Zero Layout Shifts**: Elementos dinamicos (contadores, chips, listas) tienen dimensiones minimas reservadas.
- **Micro-copy con Caracter**: Textos descriptivos tecnicos, claros, que explican el *por que* matematico detras de cada accion.
- **Atajos de Teclado**: Todo flujo repetitivo debe ser operable con teclado (1-6 para dados, Espacio para tirar, Z para deshacer).
