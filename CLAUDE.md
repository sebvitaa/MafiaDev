@AGENTS.md

## Específico de Claude Code
- Skills de Phaser 4 ya instaladas en `.claude/skills/` (se cargan bajo demanda). Para actualizarlas: `npx degit phaserjs/phaser/skills .claude/skills --force`.
- MCP Playwright declarado en `.mcp.json` (Claude Code pide aprobarlo la primera vez) para playtest con capturas contra `npm run dev` (http://localhost:8080). Úsalo para verificar cambios visuales; resume lo observado en la entrada history (no pegues snapshots completos del DOM).
- Subagentes: si delegas tests o exploración a un subagente, el agente principal sigue siendo responsable de escribir la entrada history con el resultado.
- Git: `.claude/settings.json` (versionado) permite sin preguntar `npm run ship`, commits, push de ramas propias y `gh pr create/checks/merge --auto`, y bloquea force push, push a `main`, `reset --hard`, `rebase` y `gh api`. Publica siempre con `npm run ship` (AGENTS.md §6).
