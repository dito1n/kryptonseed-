---
name: dice-physics-animator
description: >-
  Especialista en animaciones, fisica realista y efectos visuales de lanzamiento de dados (D6).
  Maneja transformaciones 3D (CSS 3D Transforms, Three.js, Canvas), mapeo de rotaciones para caras 1-6,
  efectos de colision, particulas y sintesis de sonido de dados mediante Web Audio API.
---

# Dice Physics & 3D Animator Skill

Esta skill proporciona las formulas, rotaciones y tecnicas de animacion para representar lanzamientos de dados realistas e interactivos en la web.

## 1. Mapeo de Rotaciones 3D para Dados de 6 Caras (D6)
| Cara | Rotacion X | Rotacion Y |
| :--- | :--- | :--- |
| 1 | 0deg | 0deg |
| 2 | 0deg | 180deg |
| 3 | 0deg | -90deg |
| 4 | 0deg | 90deg |
| 5 | -90deg | 0deg |
| 6 | 90deg | 0deg |

## 2. Generador Criptografico Seguro (Web Crypto API)
Evita sesgo de modulo al generar numeros D6 mediante crypto.getRandomValues.
