---
id: HIS-seba-20261123-154750
type: history
owner: seba
agent: gpt
created: 2026-11-23T18:47:50.003Z
title: montaje y pruebas de La Nota en el juego
status: pass
commit: 9bad40e
refs: [HIS-basti-20261123-153110, SUP-seba-20261123-154710, PEN-seba-20261123-153110, PEN-vicho-20261123-153111, PEN-basti-20261123-153111]
---

## Objetivo
Producir y publicar la animación en el dominio de seba, con autorización explícita de basti en el chat. El guion y los SRT proceden de HIS-basti-20261123-153110.

## Archivos y resultado
WebM de 70,008 s a 24 fps con voces, subtítulos, Foley, ambiente y jazz. P14 presenta el mapa real durante 5 s y libera control. CinematicScene.ts, HudScene.ts, ui/index.ts y laNotaArrival.ts controlan entrada, salida y objetivo. Créditos en public/assets/audio/CREDITS.md. Nuevos tests en tests/e2e/seba-la-nota.spec.ts. Exportación MP4 local de 75 s con el cierre capturado desde el juego.

## Comandos y resultados
- node scripts/agents.mjs status --owner basti; node scripts/agents.mjs status --owner seba. Sin p0 abierto.
- Producción local en LaNota-Produccion: powershell -NoProfile -ExecutionPolicy Bypass -File voice.ps1; py art.py; py refine.py; py audio.py; node render.cjs; node preview.cjs; py preview.py.
- npm run build; npm test; npm run test:e2e -- --config C:/Users/bgonc/Documents/ChatGPT/11/LaNota-Produccion/playwright.config.cjs. Vite aislado en 18427 porque el puerto 8080 ya se usaba en dos interfaces.
- FFmpeg decodificó el WebM completo con -xerror. MP4 comprobado con H.264 y AAC, 960x540, 24 fps y duración 75,00 s.
- git diff --cached --check; git commit -m "feat(ui): animar La Nota y cruzar al mapa de la partida".
- Publicación solicitada mediante npm run ship -- --owner seba --agent gpt --title "feat(ui): estrenar la cinematica La Nota" --message "chore(agents): HIS-seba-20261123-154750" --refs "HIS-seba-20261123-154750,SUP-seba-20261123-154710,PEN-seba-20261123-153110,PEN-vicho-20261123-153111".

## Tests
| Verificación | Resultado |
|---|---|
| Build de producción | OK |
| Vitest | 109/109 |
| Playwright Chromium | Código 0; 36 al primer intento, 2 pasaron al reintentar, 3 omitidos por el repo |
| Cuatro pruebas nuevas | Pasaron al primer intento; tres mapas y fallo del video |
| Revisión visual | Inspección de 13 planos y fotografía de P14 tomada en juego; se corrigió la mano que aparecía separada |

## Observaciones
Las pruebas de mundo que necesitaron reintento fueron exploration-secrets mapa 3 (distancia) y world-zones mapa 2 (events no disponible). No se cambió ningún archivo de esos dominios. El CLI de GitHub se obtuvo de la distribución oficial y se comprobó su SHA256; se usa la sesión de Git existente sin registrar credenciales. Para ship en Windows se expone npm.exe local que invoca el npm-cli.js instalado con los argumentos de build/test de ship.

## Siguiente paso
Verificar PR, CI, merge en main y despliegue. El pendiente PEN-basti-20261123-153111 se cierra al constatar la URL y la publicación.
