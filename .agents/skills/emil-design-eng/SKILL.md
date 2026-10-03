---
name: emil-design-eng
description: >-
  Especialista en Design Engineering con la filosofia de Emil Kowalski.
  Animaciones fluidas con fisica de resortes (spring curves), micro-interacciones tactiles,
  audio-diseno reactivo sintetizado, transiciones de estado orquestadas, feedback al hover/press,
  y reduccion de friccion cognitiva a traves del movimiento sutil e interactivo.
---

# Emil Design Engineering Skill

Inspirado en los estandares de ingenieria de diseno de Emil Kowalski, Linear, Vercel y Stripe.

## 1. Fisica de Animacion y Curvaturas
Nunca usar ease-in-out generico. Emplear curvas de resorte amortiguado que dan sensacion de masa fisica real:
`css
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-out-smooth: cubic-bezier(0.23, 1, 0.32, 1);
`

## 2. Micro-Interacciones Tactiles (Press & Hover Physics)
Cada boton o elemento interactivo debe reaccionar a la presion y liberacion:
`css
.interactive-element {
  transition: transform 0.2s var(--ease-spring), box-shadow 0.2s ease, border-color 0.2s ease;
}
.interactive-element:hover {
  transform: translateY(-1.5px);
}
.interactive-element:active {
  transform: translateY(0.5px) scale(0.98);
  transition-duration: 0.08s;
}
`

## 3. Diseno de Sonido Sintetizado con Web Audio API
Sintetizar eventos sonoros discretos (click de teclado mecanico, impacto de resina de dado, pop de confirmacion) modulando tonos, ruido blanco y filtros biquad pasa-bajos:
- Sonido tipo madera/resina: Modulacion triangular de 220Hz a 45Hz con caida en 60ms.
- Click de seleccion rapida: Pulso senoidal de 800Hz amortiguado en 15ms.
- Toggle Mute/Unmute para respetar la preferencia del usuario.

## 4. Sombras Proyectadas Dinamicas
Cuando un objeto se eleva (como un dado al rodar), la sombra proyectada en el plano debe desvanecerse y expandirse (lur mayor, opacity menor), y al aterrizar contraerse con nitidez.
