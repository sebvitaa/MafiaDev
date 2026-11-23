---
id: HIS-basti-20261123-133221
type: history
owner: basti
agent: gpt
created: 2026-11-23T16:32:21.000Z
title: slime cobrador knight laboratorio balance
status: pass
commit: 87e11ba61f53d070c43b933576c9f32f2e2b8a13
refs: [SUP-basti-20261123-133221, PEN-basti-20261123-122352]
---

## Objetivo
El humano amplió la tarea a programar enemigos básicos y equilibrar daño/vida. Confirmó Cobrador ágil y knight resistente como dos tipos separados, más slime. Entrega local comprobable en el mismo laboratorio; sin jefe.

## Base e integración
Worktree basti/basic-enemies desde main 0c3cd69; merge no destructivo de origin/feature/basti-movement-combat 5cd9c45 para reutilizar combo/carga y muñeco de Basti. Copia original y worktree anterior preservados; no cambios shared ni en stats de Alejandro.
El humano de la sesión sigue autenticado como Alejandr1no; el nombre de rama identifica el dominio Basti. No se publicó ni se reasignó oficialmente el dueño de esos archivos.

## Cambios
- combat/Health y combat/balance: HP en puntos, daño aplicado acotado, muerte única, protección temporal y conversión explícita de stats existentes.
- enemies/EnemyBrain: StateMachine pura; anticipación fija dirección, impacto único, recuperación, interrupción y muerte terminal.
- enemies/navigation: visibilidad por esquinas sobre huellas estáticas, recalculada cada 150 ms, sin atravesar pilares.
- enemies/Enemy y EnemySystem: cuerpos dinámicos, sectores de aviso/impacto, barras, retroceso, muerte, colisiones, IDs únicos, eventos existentes y registro TP; módulos/index/README exportan/documentan la integración.
- enemies.json: slime 50HP/25 daño; Cobrador 100/25; knight 150/50. Mantiene miniboss sin implementarlo.
- tuning.combat.balance: 25 puntos/corazón, 12,5 puntos/atk; jugador 125HP y combo 25/30/40. Protección 600ms y reacción de daño 150ms.
- RoomPlayer: vida/daño/retroceso/muerte, TP instalado y actualizado; Q reserva pointerdown y pointerup, cancela carga previa y no dispara ataque; R habilita otra vez las acciones. No se concedió invulnerabilidad de dash/salto.
- DashMotion.cancel: corta el dash por daño y conserva cooldown; la altura del salto continúa integrándose durante hurt.
- SwordAttack: daño inyectado desde stats, interrupción por daño y comprobación de línea contra sólidos. Reutiliza SwordHitTracker; no se duplicó el sistema de combo.
- RoomScene/HTML/README: modo ?enemies=1, tres enemigos fuera de detección inicial, HUD de vida, enlaces al modo y controles. Entrada original mantiene movimiento/muñeco.
- Unit y e2e propios; fixtures laterales usan skipIntro como main actual. Las pruebas de TP esperan postupdate antes de leer el HUD para no confundir la etiqueta del frame anterior con el cooldown real.

## Comandos y resultados
```text
git fetch origin --prune
git worktree add -b basti/basic-enemies <worktree> origin/main
git merge --no-edit origin/feature/basti-movement-combat
npm ci --prefer-offline -> PASS
npm run build -> PASS (TypeScript strict, 61 módulos)
npm test -> PASS (94 tests, 16 archivos)
npm run test:e2e -- --config <config local de pruebas en 8083>
  -> Última corrida completa: 28 passed, sin omisiones.
git diff --check -> PASS
```

## Tests e iteraciones
| contexto | resultado | detalle |
|---|---|---|
| Build final | pass | Strict y Vite |
| Unit completa | pass | 94 tests; HP, i-frames, ataque/dirección, poise, muerte, navegación y cancelación de dash |
| E2E final completa | pass | 28 tests; nuevos enemigos, TP main/lab, movimiento lateral/lab, espada/carga/fuego existentes y menús |
| Vista visual | pass | Captura Enemigos-basicos-MafiaDev.png en outputs; tres perfiles y HUD visibles |

Primer build detectó que el helper geométrico de espada exigía campos de daño que no usaba; se acotó a Pick<x,y,radius>. La primera corrida normal chocó con 8080, ocupado por otra copia (OneDrive/Documentos/ChatGPT/Juego/MafiaDev); no se detuvo ese proceso. Se usó configuración temporal fuera del repo con 127.0.0.1:8083 y un worker.
Iteraciones e2e corrigieron: fixtures laterales anteriores al splash actual; aserción de protección con IPC más lento que 600ms (ahora observa impacto y recuperación en el propio frame); lectura del HUD de TP antes de postupdate. Los fallos quedaron resueltos y no requieren pending.

## Estado local y acceso
Servidor de usuario 127.0.0.1:8081 ahora ejecuta este worktree, PID inicial 32480. Solo se detuvo el Vite anterior iniciado por esta conversación en 8081 (PID 8392); no se tocó 8080.
URL: http://127.0.0.1:8081/src/player/room-prototype/?enemies=1
Código guardado en commit 87e11ba61f53d070c43b933576c9f32f2e2b8a13 de basti/basic-enemies. Sin push/PR: esta entrega y la integración de los archivos del dominio Basti quedan locales para revisión/adopción; las habilidades publicadas en PR #8 permanecen intactas.

## Siguiente paso
Playtest humano para ajustar 50/100/150HP y 25/25/50 de daño. Integrar estos enemigos en mapas de Vicho mediante EnemySystem y un adaptador EnemyPlayer cuando corresponda. Bodoque continúa fuera de esta entrega. PEN-basti-20261123-122352 queda en progreso: laboratorio y enemigos básicos conectados, jefe/mapa/publicación definitiva pendientes.
