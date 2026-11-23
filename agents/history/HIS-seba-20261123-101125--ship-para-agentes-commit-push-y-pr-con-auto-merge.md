---
id: HIS-seba-20261123-101125
type: history
owner: seba
agent: claude
created: 2026-11-23T13:11:25.739Z
title: ship para agentes: commit push y PR con auto-merge
status: pass             # pass | fail | partial
commit: 607b5e4            # hash del commit de código
refs: [SUP-seba-20261123-101101]
---

## Objetivo
Que los agentes (Claude, GPT) hagan commit, push y abran PR por sí mismos, con auto-merge cuando el CI pasa.

## Cambios
- `scripts/ship.mjs` (nuevo): flujo de publicación con guardas de dominio, shared y secretos; merge (no rebase) de origin/main; build + unit; push; PR; auto-merge squash.
- `package.json`: script `ship`.
- `.claude/settings.json` (nuevo, versionado): allow del flujo git/gh, deny de force push, push a main, rebase, amend, reset --hard, gh api/repo/secret.
- `AGENTS.md` §3, §5 y nueva §6; `CLAUDE.md`: línea de Git.
- GitHub (fuera del repo): `allow_auto_merge=true`, `delete_branch_on_merge=true`, protección de `main` con check requerido `build-test` (strict=false, enforce_admins=false, sin force push ni borrado).

## Comandos y resultados
```text
$ npm run ship -- --owner seba --agent claude --title "cosas" --dry-run                 → aborta: título no convencional ✔
$ npm run ship -- ... --title "ci(agents): ship" --dry-run                              → aborta: archivos shared sin --shared ✔
$ npm run ship -- --owner basti ... --dry-run   (rama seba/*)                          → aborta: rama ajena ✔
$ (src/world/__tmp_guard.ts) npm run ship -- ... --shared --dry-run                    → aborta: archivo de vicho ✔
$ (token ghp_ falso en src/audio/) npm run ship -- ... --shared --dry-run              → aborta: posible secreto ✔ (tras arreglar lectura de no versionados)
$ (.env.test en el índice) npm run ship -- ... --shared --dry-run                      → aborta: archivo prohibido ✔
$ npm run ship -- --owner seba --agent claude --title "ci(agents): ship" --shared --dry-run → build ✔ · 9/9 tests ✔ · "Todo OK"
```

## Tests
| test | resultado | nota |
|---|---|---|
| npm run build | pass | |
| npm test | pass | 3 archivos, 9 tests |
| guardas de ship (6 casos) | pass | ver arriba |
| e2e | no ejecutado en local | lo corre el CI del PR |

## Observaciones
Este mismo PR se publica con `npm run ship --shared` como prueba real del flujo completo (push, PR, auto-merge).

## Siguiente paso
Que el equipo valide SUP-seba-20261123-101101. Seba: Fase 1 del plan (contratos shared antes del freeze de H1).
