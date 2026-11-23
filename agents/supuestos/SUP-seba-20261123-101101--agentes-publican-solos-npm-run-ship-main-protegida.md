---
id: SUP-seba-20261123-101101
type: supuesto
owner: seba         # quien tomó la decisión
validator: equipo # dueño del dominio afectado | equipo
agent: claude
created: 2026-11-23T13:11:01.303Z
title: agentes publican solos: npm run ship + main protegida con auto-merge
impact: alto       # bajo | medio | alto
reversible: si           # si | no
status: pendiente        # pendiente | validado | rechazado  (solo un humano lo cambia)
code_refs: [scripts/ship.mjs, .claude/settings.json, AGENTS.md, package.json]            # rutas con marcador // SUP-<id>
refs: []
---

## Decisión
Pedido explícito de Seba (humano) en el chat: «actualiza el repo para permitir que los agentes hagan commits, push y hagan insta PR cuando sea necesario», eligiendo «Auto-merge con CI verde».
- `npm run ship` (`scripts/ship.mjs`): rama `<owner>/*` → guardas (dominio §2, shared con `--shared`, secretos) → commit → `git merge origin/main` → build + unit → push → PR → `gh pr merge --auto --squash --delete-branch`.
- GitHub: `allow_auto_merge` y `delete_branch_on_merge` activados; `main` protegida con el check requerido `build-test` (no strict, sin reviews obligatorias, sin force push ni borrado; los admins pueden saltársela).
- `.claude/settings.json` versionado: permite el flujo sin preguntar y bloquea force push, push a main, rebase, amend, reset --hard, `gh api`/`gh repo`.
- Mapa de propiedad codificado en ship: lo no listado en §2 = shared; `public/assets/sprites/enemies/**` asignado a basti (no estaba especificado).

## Alternativas consideradas
(a) Solo abrir PR y que un humano fusione · (b) auto-merge opcional con `--auto` · (c) rebase en vez de merge (descartado: obliga a force push).

## Por qué
Hackatón de 1 día: los merges cada ~1 h no pueden esperar a un humano. El CI (build + unit + e2e) es el revisor; `main` sigue siempre jugable porque nada entra sin el check verde.

## Impacto si se rechaza
Quitar la protección de `main` y el auto-merge en GitHub; usar `npm run ship -- --no-auto`. Nadie más (ni humanos) puede pushear directo a `main` sin pasar el CI mientras esto esté activo, salvo admins.

## Resolución
<!-- humano: quién, cuándo, cita textual de su respuesta -->
