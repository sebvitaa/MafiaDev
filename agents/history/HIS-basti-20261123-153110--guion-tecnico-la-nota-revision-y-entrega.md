---
id: HIS-basti-20261123-153110
type: history
owner: basti
agent: gpt
created: 2026-11-23T18:31:10.814Z
title: guion tecnico La Nota revision y entrega
status: partial
commit: 5305c13
refs: [SUP-basti-20261123-153110, PEN-seba-20261123-153110, PEN-vicho-20261123-153111, PEN-basti-20261123-153111]
---

## Objetivo
Revisar lore y cinemática anterior de La Nota y entregar guion técnico de 75 s con actuación, sonido, transiciones, prompts y materiales de montaje, conservando el secreto de Bodoque.

## Cambios
- [Guion técnico completo](materiales/HIS-basti-20261123-153110/LA-NOTA-guion-tecnico.md): 14 planos, continuidad y auditoría de contradicciones, prompts separados, dirección y criterios de producción.
- [Subtítulos SRT](materiales/HIS-basti-20261123-153110/LA-NOTA-subtitulos.srt): 16 cues editables.
- [Planos CSV](materiales/HIS-basti-20261123-153110/LA-NOTA-planos.csv): intervalos en segundos y fotogramas a 24 fps.
- Memoria: SUP-basti-20261123-153110, PEN-seba-20261123-153110, PEN-vicho-20261123-153111, PEN-basti-20261123-153111. Ninguno cerrado.
- Solo se añadieron materiales y memoria bajo agents/. No hay cambios en código, shared, assets de otros dominios ni video nuevo.

## Comandos y resultados
Comandos principales ejecutados:
```text
node scripts/agents.mjs status --owner basti
git show origin/main:docs/LORE.md
git show origin/main:src/ui/scenes/CinematicScene.ts
git show origin/main:src/scenes/TitleScene.ts
git show origin/main:src/scenes/GameScene.ts
git show origin/main:src/world/index.ts
git worktree add -b basti/la-nota-guion C:/Users/bgonc/Documents/ChatGPT/11/MafiaDev-la-nota origin/main
npm run build
npm test
npm run ship -- --owner basti --agent gpt --title "docs(narrativa): guion tecnico de La Nota" --dry-run
npm run ship -- --owner basti --agent gpt --title "docs(narrativa): guion tecnico de La Nota" --message "chore(agents): HIS-basti-20261123-153110" --refs "HIS-basti-20261123-153110,SUP-basti-20261123-153110,PEN-seba-20261123-153110,PEN-vicho-20261123-153111,PEN-basti-20261123-153111"
```

## Tests
| Verificación | Resultado | Contexto |
|---|---|---|
| npm run build | pass | Rama original: 32 módulos. |
| npm test | pass | Rama original: 14 archivos, 78 tests. |
| npm run build | pass | Worktree de entrega desde origin/main: 100 módulos. |
| npm test | pass | Worktree de entrega: 21 archivos, 109 tests. |
| Validación del CSV y SRT con Node | pass | 14 planos contiguos, 1800 frames/75 s, 16 cues sin solaparse; máximo 15,29 caracteres/s y 30 caracteres/línea. |
| Revisión de producción por subagente | pass | Skill brainstorming solicitó revisión de constructor: sin faltantes importantes; P14 depende de coordinación ya documentada. |
| ship / ship --dry-run | bloqueado | gh: spawnSync gh ENOENT, antes de staging/push; PEN-basti-20261123-153111. |
| E2E | no ejecutado | Solo documentos y memoria; no se tocaron escenas, input o carga. |

Las comprobaciones del código verifican la base del proyecto, no una nueva cinemática implementada. No se añadieron tests de software para la prosa. La validación de subtítulos y duraciones fue un script temporal Node que leyó los materiales y comprobó continuidad, límites de 24 fps, 75 s, dos líneas, 42 caracteres/línea y 18 caracteres/s máximos.

## Observaciones
Se consultó origin/main local, commit 3c75dfa6e8ef85b29104374c77d7050aa4a67789; no se hizo fetch. Video existente: 10,008 s, 960x540. Se examinó una hoja de nueve fotogramas mediante Playwright headless y el sprite de Ríos extraídos del objeto Git, sin modificar assets. El documento diferencia la rama antigua lateral y la referencia cenital. El video anterior revela el número de enviado y la apuesta; la propuesta los elimina.
Dependencias idénticas entre ambas ramas; el worktree usa un junction node_modules hacia el original, ignorado por Git. La rama y los archivos originales no se editaron; se preservaron los untracked git y npm existentes.

## Commit y publicación
Producto documental: 5305c13 (docs(narrativa): guion tecnico de La Nota en 14 planos). Memoria se registra después, conforme al orden de AGENTS.md. PR: no creado por ausencia de gh; no hubo push. Estado partial corresponde a publicación y producción audiovisual pendientes; el paquete de guion está completo.

## Siguiente paso
Seba produce/monta y vicho coordina P14 con el mapa real. Alejandro valida correspondencia visual. Reintentar el comando ship anterior cuando gh esté disponible; nunca usar el trabajo de combate como base de esta publicación.
