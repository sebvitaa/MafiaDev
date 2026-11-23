# AGENTS.md — MafiaDev (metroidvania · hackatón, 1 día, 4 humanos + agentes)

Fuente de verdad para TODOS los agentes (Claude Code, Codex/GPT u otros). `CLAUDE.md` importa este archivo.
Audiencia: agentes. Registro técnico y denso. Logs permitidos.

## 0. Arranque obligatorio de sesión

1. Identifica al humano dueño de la sesión (`OWNER` ∈ `vicho|basti|alejandro|seba`). Si no lo dijo, pregunta antes de editar nada.
2. Ejecuta `node scripts/agents.mjs status --owner <OWNER>` y lee la salida completa. Contiene:
   pendings abiertos asignados a OWNER, supuestos `pendiente` que OWNER debe validar, supuestos propios sin resolver,
   y las últimas entradas de history de OWNER.
3. Lee SOLO las entradas referenciadas que necesites (`agents/<tipo>/<ID>--*.md`). No cargues el directorio entero: protege la ventana de contexto.
4. Si la tarea pedida colisiona con un pending `p0` abierto en tu dominio, avísalo al humano antes de empezar.

## 0.1 Mapa del repo

```
src/main.ts            config Phaser (480×270, pixelArt, arcade) + registro de escenas       [shared]
src/core/              EventBus · StateMachine · Input (acciones) · GameState (localStorage) [shared]
src/types/             events · assets (AnimKey/SfxKey/MusicKey) · character · items          [shared]
src/data/*.json        tuning · classes · abilities · items · loot · enemies
src/scenes/            Boot → Preload (barra + placeholders) → Title → Game (+Hud, Pause)
src/{world,exploration}/          vicho      src/{player,combat,enemies}/      basti
src/{character,abilities,items}/  alejandro  src/{audio,ui}/ + escenas menú    seba
public/assets/         maps · tilesets · backgrounds · sprites/{player,enemies} · ui · audio/{sfx,music}
tests/unit · tests/e2e · agents/ (memoria) · scripts/agents.mjs · .claude/skills/ (Phaser 4)
investigacion-stack.html  investigación de stack, patrones y referencias (humanos)
```
Estado inicial: stubs jugables (suelo de prueba, jugador con correr/saltar/doble salto/coyote/buffer, HUD, pausa con ESC). Placeholders `ph-player|ph-enemy|ph-tile` generados en PreloadScene.

## 1. Stack y comandos

- Phaser 4.2.x + TypeScript `strict` + Vite. Arcade Physics. Mapas Tiled (JSON). Resolución interna 480×270, `pixelArt: true`, tiles 16×16.
- API de **Phaser 4**, no Phaser 3:
  - tinte: `setTint(c).setTintMode(Phaser.TintModes.FILL)`; `setTintFill` NO existe.
  - FX: `obj.filters.internal|external`; `preFX`/`postFX`/pipelines NO existen.
  - luz: `sprite.setLighting(true)`; nada de `setPipeline('Light2D')`.
  - Referencia: `.claude/skills/<tema>/SKILL.md` (skills oficiales de phaserjs/phaser; legibles por cualquier agente, no solo Claude). Ante duda de API: `.claude/skills/v3-to-v4-migration/SKILL.md`.
- Comandos:
  - `npm run dev` · `npm run build` (incluye `tsc --noEmit`; **debe pasar antes de cualquier merge**)
  - `npm test` → Vitest (lógica pura: FSM, daño, loot, cooldowns, parsing de mapas)
  - `npm run test:e2e` → Playwright (`tests/e2e/`). Smoke actual: boot → title → game → mover → sin errores de consola. En dev, `window.__game` expone la instancia de Phaser para tests.
  - `npm run agents:status -- --owner <OWNER>` → índice de memoria (§4).
  - Unit tests en `tests/unit/*.test.ts`: NO importan Phaser (entorno node). Separa la lógica pura en módulos sin Phaser (ej. `src/items/loot.ts`).

## 2. Dominios y propiedad de archivos

Edita SOLO archivos de tu OWNER. Si necesitas un cambio en un dominio ajeno: crea un pending asignado a su dueño (§4.2) y, si no puedes esperar, trabaja contra un stub/mock local en tu dominio y registra un supuesto (§4.3).

| OWNER | Dominio | Rutas propias |
|---|---|---|
| **vicho** | Mapa, exploración, ambientación | `src/world/**` (carga de tilemaps, salas, puertas, cámara, parallax, partículas ambientales, iluminación) · `src/exploration/**` (checkpoints, respawn, cofres en mundo, coleccionables, minimapa) · `src/scenes/GameScene.ts` · `public/assets/{maps,tilesets,backgrounds}/**` |
| **basti** | Combate, movimiento | `src/player/Player.ts` · `src/player/states/**` (idle, run, air, dash, attack, parry, block, hurt, dead) · `src/combat/**` (Health, Hitbox, Hurtbox, Knockback, DamageSystem, hitstop/shake) · `src/enemies/**` (IA, minijefe) · `src/data/{tuning,enemies}.json` |
| **alejandro** | Personaje, habilidades | `src/character/**` (stats, clases Luchador/Mago, equipo, inventario) · `src/abilities/**` (TimeStop, Teleport, Souls; interfaz `Ability`) · `src/items/**` (rareza, tablas de loot, consumibles, buffs) · `src/data/{items,loot,classes,abilities}.json` · `public/assets/sprites/player/**` |
| **seba** | Audio, pantallas | `src/scenes/{BootScene,PreloadScene,TitleScene,PauseScene}.ts` · `src/audio/**` (AudioDirector: SFX por eventos del bus, música por zona, mezcla) · `src/ui/**` (HUD, menús) · `public/assets/{audio,ui}/**` |
| **shared** | Contratos (congelados tras H1) | `src/core/**` (EventBus, StateMachine, Input, GameState) · `src/types/**` · `src/main.ts` · `tests/e2e/smoke.spec.ts` · configs (`package.json`, `tsconfig.json`, `vite.config.ts`, `playwright.config.ts`, `.github/**`) · `AGENTS.md` · `scripts/**` |

Tests: cada dominio es dueño de `tests/unit/<dominio>*.test.ts` y de los e2e que cree en `tests/e2e/<dominio>*.spec.ts`.

`shared`: cambios solo con aviso explícito del humano en el chat del equipo; registra un supuesto con `validator: equipo`.

### 2.1 Puntos de integración (sin tocar archivos ajenos)

- `GameScene` (vicho) solo compone: `installWorld(this)`, `installPlayer(this)` (basti), `installCharacter(this)` (alejandro), `installAudio(this)` e `installUi(this)` (seba; HUD + pausa). Cada dominio exporta su `install*(scene)` desde su `index.ts`.
- `Player` (basti) consume `CharacterStats` y `AbilitySlots` desde `src/character` (alejandro) vía interfaz en `src/types/character.ts`. Basti no implementa habilidades; Alejandro no implementa estados de movimiento.
- Audio: nadie llama a `this.sound.*` fuera de `src/audio`. Emite un evento en el bus; el AudioDirector (seba) lo mapea a SFX.
- Assets: claves de animación y de audio declaradas en `src/types/assets.ts` (`AnimKey`, `SfxKey`, `MusicKey`). Una clave nueva se añade allí en un commit aparte, sin otros cambios.

### 2.2 Contrato de eventos (`src/types/events.ts`)

```
player:jump {air:boolean}       player:land {vy:number}        player:dash {}
player:attack {combo:1|2|3}     player:parry {success:boolean} player:hit {dmg,hp,maxHp}
player:died {}                  enemy:hit {id,dmg,x,y}         enemy:killed {id,kind,x,y}
boss:phase {phase:number}       ability:used {id}              ability:ready {id}
item:picked {itemId,rarity}     chest:opened {id,hidden}       checkpoint:reached {id}
room:entered {roomId,zone}      zone:changed {zone}            game:paused {} / game:resumed {}
```
Añadir un evento = cambio en `shared` (ver arriba). Nunca reutilices un evento con otra semántica.

## 3. Reglas de código

- Una clase/módulo por archivo. Entidades = sprite + `StateMachine` + componentes. Sin herencia profunda.
- Números de equilibrio en `src/data/*.json`, nunca hardcodeados. Constantes de feel (gravedad, coyote, buffer, hitstop) en `src/data/tuning.json`.
- Lógica pura separada de Phaser cuando se pueda (módulo sin `import Phaser`) para testearla con Vitest sin navegador.
- Commits pequeños, prefijo de dominio: `feat(combat): parry window 150ms`. Rama `<owner>/<slug>`; merge a `main` cada ~1 h vía `npm run ship` (§6). `main` siempre jugable.
- No borres ni reescribas trabajo ajeno para que tu build pase. Si `main` está roto por otro dominio: pending `p0` al dueño + revert local solo en tu rama.

## 4. Memoria persistente: history, pendings, supuestos

Fuera de la ventana de contexto. Un archivo por entrada (evita conflictos de merge). Créalas SIEMPRE con el script:
```
node scripts/agents.mjs new history  --owner <OWNER> --agent <claude|gpt> --title "<slug corto>"
node scripts/agents.mjs new pending  --owner <ASIGNADO> --by <OWNER> --agent <...> --priority p0|p1|p2 --title "..."
node scripts/agents.mjs new supuesto --owner <OWNER> --validator <dueño|equipo> --agent <...> --impact bajo|medio|alto --title "..."
node scripts/agents.mjs status [--owner <OWNER>] [--all]
```
El script imprime la ruta; rellena las secciones del archivo generado. IDs: `HIS|PEN|SUP-<owner>-<YYYYMMDD-HHMMSS>`.

### 4.1 history — `agents/history/`
Registro append-only de cada sesión de trabajo y de cada ejecución de tests. **Obligatorio** al cerrar una tarea, tras cada ejecución de tests relevante, y antes de que el humano cierre el chat.
- Incluye: objetivo, archivos tocados, comandos exactos, resultado de tests (tabla), logs relevantes (bloque ```text```; >80 líneas → guarda el log completo en `agents/history/logs/<ID>.log` y enlázalo), commit, IDs de PEN/SUP creados o cerrados, siguiente paso.
- `status: pass|fail|partial`. Un `fail` sin pending asociado no es válido.
- No edites entradas de history ya escritas (las de nadie). Corrige con una nueva entrada que referencie la anterior.
- Orden de commit: primero el código; después `chore(agents): HIS-...` con el hash del commit de código en `commit:`.

### 4.2 pendings — `agents/pendings/`
Trabajo pendiente o bug detectado que no se resuelve en el turno actual. Sobrevive a cambios de chat.
- Créalo cuando: un test falla y no lo arreglas ahora; detectas un bug en dominio ajeno; dejas un TODO real; el humano pide algo para "después".
- `owner` = quien debe resolverlo (dueño del dominio), `created_by` = quien lo detectó.
- Prioridad: `p0` rompe la demo o `main` · `p1` mecánica MUST incompleta · `p2` pulido.
- Estados: `open → in_progress → done|wontfix`, o `blocked` (indica por qué en el cuerpo y el ID que bloquea).
- Cerrar requiere `closed_by: <hash|HIS-ID>` y que el criterio de cierre se cumpla (normalmente un test o una repro que pasa).
- En código: `// PEN-<id>: <descripción corta>` donde aplique.

### 4.3 supuestos — `agents/supuestos/`
Decisión tomada por un agente sin especificación explícita, que un humano debe validar. **No bloquees**: decide, implementa de forma reversible, registra.
- Créalo cuando elijas: valores de diseño (daño, cooldown, rareza), comportamiento no especificado, una interfaz entre dominios, una librería, un stub que sustituye algo ajeno, o cualquier cambio en `shared`.
- `validator`: dueño del dominio afectado, o `equipo` si cruza dominios o toca `shared`.
- Estados: `pendiente → validado|rechazado`. **Solo un humano** cambia el estado (el agente puede editar el campo si el humano lo dice explícitamente en el chat; cita su respuesta en `## Resolución`).
- `rechazado` ⇒ crea un pending para revertir/ajustar, referenciando el SUP.
- En código: `// SUP-<id>` en la línea o bloque afectado, para poder localizar y revertir.

### 4.4 Presupuesto de contexto
- `status` es el índice: léelo, no hagas `cat agents/**`.
- Lee history ajena solo si un PEN/SUP la referencia.
- Logs largos van a `agents/history/logs/`, no al chat ni al cuerpo de la entrada.

## 5. Fin de sesión (checklist)

1. `npm run build` y `npm test` (y `npm run test:e2e` si tocaste escenas, input o carga) → resultado en una entrada history.
2. PEN para todo lo que quede roto o a medias; SUP para cada decisión no especificada.
3. Actualiza el estado de los PEN que trabajaste.
4. Commit del código, luego `npm run ship` con el commit de `agents/` (§6.2).
5. Resume al humano en ≤5 líneas: hecho, tests, IDs creados/cerrados, **URL del PR**, siguiente paso.

## 6. Git: commits, push y PR (los agentes publican solos)

Los agentes PUEDEN hacer commit, push y abrir PR sin pedir permiso, **solo** por este flujo. `main` está protegida: exige el check `build-test` del CI y los PR se fusionan solos (squash) cuando pasa.

### 6.1 Cuándo publicar
- Al terminar una tarea con build + tests en verde (checklist §5).
- Cada ~1 h aunque la tarea siga a medias, si `main` sigue jugable con tu cambio (detrás de un flag o sin engancharlo); si no, `--draft`.
- Cuando el humano lo pida ("sube esto", "haz PR", "ship").
- NO publiques: con tests en rojo, con archivos de otro dominio, ni cambios `shared` sin aviso explícito del humano en el chat.

### 6.2 Flujo (el script hace las guardas)
```
git switch -c <owner>/<slug>                    # si estás en main (ship también lo hace)
git add <archivos> && git commit -m "feat(<dominio>): qué"
node scripts/agents.mjs new history ...          # commit: <hash del paso anterior>
npm run ship -- --owner <OWNER> --agent <claude|gpt> \
  --title "feat(<dominio>): qué" --message "chore(agents): HIS-..." --refs HIS-...,PEN-...
```
`ship`: verifica la rama `<owner>/*` → `git add -A` → **guardas** → commit de lo pendiente con `--message` → `git merge origin/main` → `npm run build` + `npm test` (`--e2e` añade Playwright) → push de la rama → crea o reutiliza el PR → `gh pr merge --auto --squash --delete-branch`. Imprime la URL del PR.
- Guarda de dominio: aborta si el PR incluye archivos de otro OWNER (mapa de §2 en `scripts/ship.mjs`; `agents/**` y `tests/**` son libres salvo `tests/e2e/smoke.spec.ts`; lo no listado = `shared`; `public/assets/sprites/enemies/**` = basti). Archivos `shared` exigen `--shared`, que solo se usa con aviso explícito del humano + SUP `validator: equipo`.
- Guarda de secretos: aborta con `.env*`, claves, `.claude/settings.local.json` o tokens en el diff.
- Flags: `--draft` (sin auto-merge) · `--no-auto` (lo fusiona un humano) · `--dry-run` (guardas + build + tests sin publicar).

### 6.3 Prohibido
`git push --force` · push directo a `main` · `git rebase` / `commit --amend` sobre ramas ya publicadas · `git reset --hard` · `gh pr merge --admin` · cambiar ajustes del repo (`gh api`, `gh repo`). En Claude Code, `.claude/settings.json` ya permite el flujo y bloquea esto.

### 6.4 Si algo falla
- Conflicto al integrar `main`: ship aborta el merge. `git merge origin/main`, resuelve SOLO archivos de tu dominio, `git commit`, repite ship. Conflicto en dominio ajeno → pending `p0` a su dueño.
- CI en rojo en tu PR: `gh pr checks` y `gh run view --log-failed`, arregla, commit y repite ship (actualiza el mismo PR; el auto-merge sigue activo).
- `main` roto tras un merge: pending `p0` al autor del PR + PR de revert (`git revert <hash>` en una rama `<owner>/revert-...`), nunca push directo.
- Codex/GPT: si su sandbox no tiene red, el humano ejecuta el mismo `npm run ship` que el agente le indique. ChatGPT web: el agente da el comando y el humano lo corre.

