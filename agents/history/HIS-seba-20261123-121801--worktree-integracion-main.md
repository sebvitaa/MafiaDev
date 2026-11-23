---
id: HIS-seba-20261123-121801
type: history
owner: seba
agent: claude
created: 2026-11-23T15:18:01.456Z
title: worktree-integracion-main
status: pass          # pass | fail | partial
commit: c5f42e8       # merge local de feature/basti-movement-combat sobre main 0746559
refs: []
---

## Objetivo
Worktree nuevo desde `origin/main` que integre las ramas aún no integradas. Probar las conexiones a la API de OpenAI (GPT) y a Codex (CLI y MCP).

## Cambios
- Worktree `../.wt/integracion`, rama `seba/integracion-main` (sin upstream; no se publicó).
- Merge `--no-ff` de `origin/feature/basti-movement-combat` (4355de5), sin conflictos. Solo toca el dominio de basti: `src/player/**`, `src/data/tuning.json` y tests `player-*`.
- No se integraron por estar ya en main: `seba/fase1-contratos` (PR #3), `seba/audio-pantallas` (PR #4) y `seba/fases-2-6-v2` (PR #5). Esas ramas se fusionaron con squash y sus remotos ya no existen.
- No se tocó el trabajo sin commitear de los worktrees `gmrender`, `menuhd` y `review` ni del directorio principal (`seba/menu-musica-review`), porque hay otro agente trabajando ahí.

## Comandos y resultados
```text
$ npm ci && npm run build      → exit 0
$ npm test                     → 9 archivos, 63 tests passed
$ curl GET  /v1/models          → HTTP 200, 99 modelos (gpt-5, gpt-5-mini, gpt-5.1, gpt-5.2…)
$ curl POST /v1/responses gpt-5-mini "Responde solo: OK" → HTTP 200, "OK", 150 tokens
$ codex exec (codex-cli 0.171.0, auth por API key) → "PONG" en ~5 s
MCP mcp__codex__codex (read-only, cwd=worktree) → "HEAD: c5f42e8; archivos modificados: 0"
```

## Tests
| test | resultado | nota |
|---|---|---|
| build (tsc + vite) | pass | |
| vitest | pass | 63/63, incluye player-dash, player-double-tap y player-room-motion |
| e2e | no ejecutado | el puerto 8080 puede estar en uso por el otro agente |

## Observaciones
- La clave está en `Hackaton/.env.openai` (carpeta padre del repo), no dentro de MafiaDev.
- `npm run ship` desde `seba/integracion-main` abortaría por la guarda de dominio, porque la rama contiene archivos de basti. La rama de basti debe entrar a main con su propio PR.

## Siguiente paso
Que basti publique `feature/basti-movement-combat` con un PR. Mientras tanto, trabajar en este worktree con su código ya integrado.
