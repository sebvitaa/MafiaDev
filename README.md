# MafiaDev

Metroidvania 2D de acción en pixel art para la hackatón: movimiento estilo Hollow Knight, combate con combos y parry, loot con rareza, exploración con checkpoints y minijefes, y dos clases (Luchador que para el tiempo y Mago de almas).

**Stack:** Phaser 4.2 · TypeScript (strict) · Vite · Arcade Physics · Tiled · Vitest · Playwright.
**Investigación completa:** [`investigacion-stack.html`](investigacion-stack.html) (descárgalo y ábrelo en el navegador) · [versión web](https://claude.ai/artifact/8kGdW2VRMzrM6nV4BCsahJ) · copia en Markdown al final de este README.

## Arrancar

Requisitos: Node 22 o superior, git y, según tu rol, [Tiled](https://www.mapeditor.org/) y un editor de sprites.

```bash
git clone git@github.com:sebvitaa/MafiaDev.git && cd MafiaDev
npm install
npm run dev            # http://localhost:8080
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | `tsc --noEmit` + build de producción en `dist/`. Debe pasar antes de cada merge. |
| `npm test` | Tests unitarios (Vitest, lógica sin Phaser) |
| `npm run test:e2e` | Smoke test en Chromium (Playwright). La primera vez: `npx playwright install chromium` |
| `npm run agents:status -- --owner <nombre>` | Pendientes, supuestos por validar e historial de esa persona |

Controles provisionales: flechas o A/D para moverse, Espacio o Z para saltar (doble salto en el aire), ESC o P para pausar.

Cada push a `main` pasa por CI (build, tests unitarios y e2e) y se publica en GitHub Pages.

## Equipo y dominios

| Persona | Rol | Carpetas |
|---|---|---|
| **Vicho** | Mapa, exploración y ambientación | `src/world/`, `src/exploration/`, `src/scenes/GameScene.ts`, `public/assets/{maps,tilesets,backgrounds}/` |
| **Basti** | Combate y movimiento | `src/player/`, `src/combat/`, `src/enemies/`, `src/data/{tuning,enemies}.json` |
| **Alejandro** | Personaje y habilidades | `src/character/`, `src/abilities/`, `src/items/`, `src/data/{items,loot,classes,abilities}.json`, `public/assets/sprites/player/` |
| **Seba** | Música, sonido y pantallas de inicio, pausa y carga | `src/audio/`, `src/ui/`, `src/scenes/{Boot,Preload,Title,Pause}Scene.ts`, `public/assets/{audio,ui}/` |

`src/core/`, `src/types/` y `src/main.ts` son contratos compartidos: no se cambian sin avisar al equipo. Los sistemas se comunican por eventos (`src/core/EventBus.ts`), así que nadie necesita editar archivos de otro.

## Trabajo con agentes de IA (Claude y GPT)

Las reglas para los agentes están en [`AGENTS.md`](AGENTS.md). Codex lo lee automáticamente y Claude Code lo importa desde [`CLAUDE.md`](CLAUDE.md). Si usas ChatGPT web, pégale `AGENTS.md` y la salida de `npm run agents:status` al empezar.

Al empezar cada chat, dile al agente quién eres («soy Basti»). La memoria del proyecto vive fuera del chat, en `agents/`:

- `agents/history/`: lo que hizo cada sesión, con tests y logs.
- `agents/pendings/`: bugs y tareas pendientes, con dueño y prioridad.
- `agents/supuestos/`: decisiones que tomó un agente y que una persona debe validar o rechazar.

**Por validar ahora:** el reparto de dominios propuesto (`npm run agents:status`).

Las skills oficiales de Phaser 4 están en `.claude/skills/`; cualquier agente puede leerlas. Claude Code activa además el MCP de Playwright desde `.mcp.json` para jugar y sacar capturas.

---

Hackatón · 4 personas · 1 día · investigación del 23-11-2026

# Investigación: stack del metroidvania

Guía para construir con ayuda de IA el juego del tablero de mecánicas: plataformas 2D de acción con el movimiento de Hollow Knight, combate con combos y parry, loot con rareza, exploración con checkpoints y minijefes, y dos clases (Luchador que para el tiempo y Mago de almas).

Cubre lenguaje, motor, patrones de diseño, animaciones, arte, mapas, sonido, el flujo de trabajo con agentes de IA, un horario hora a hora y repositorios open source de los que aprender. Las versiones, estrellas y licencias se comprobaron en GitHub y npm el 23 de noviembre de 2026.

## Veredicto

Si solo leéis una sección, que sea esta.

**Usad Phaser 4 con TypeScript y Vite**, en pixel art 2D de scroll lateral y desplegado en el navegador. Todo el juego vive en archivos de código, sin escenas de editor, así que cuatro personas con cuatro agentes de IA pueden trabajar en paralelo sin pisarse. Además, el repositorio oficial de Phaser incluye 28 *skills* para agentes de IA que enseñan la API de la versión 4 al modelo.

**Motor**: **Phaser 4.2 + Arcade Physics**

Versión estable desde abril de 2026; la última en npm es la 4.2.1.

**Lenguaje**: **TypeScript estricto**

Los tipos son el contrato entre personas y agentes, y el compilador detecta errores del código generado.

**Mapas**: **Tiled → JSON**

Phaser lo importa de forma nativa. Las capas de objetos sirven para spawns, cofres y checkpoints.

**Sprites**: **Aseprite / LibreSprite + packs CC0**

PixelLab (vía MCP) genera personajes y animaciones con IA.

**Sonido**: **jsfxr / ChipTone + Kenney audio**

ElevenLabs SFX para efectos realistas. BeepBox o Bosca Ceoil para la música.

**IA**: **Claude Code + skills de Phaser**

Más el MCP de Playwright para que el agente juegue y saque capturas, y FreeLLMAPI para los datos.

**Plan B: Godot 4.6 con GDScript**, solo si al menos dos personas del equipo ya han terminado un juego en Godot. Tiene mejores herramientas visuales de animación y tilemaps, y el MCP `hi-godot/godot-ai` conecta Claude Code al editor. A cambio, las escenas `.tscn` dan conflictos de merge y los modelos confunden a menudo la sintaxis de Godot 3 con la de Godot 4.

## Alcance realista para un día

El tablero describe un juego de varios meses. Esta es la priorización MoSCoW de cada nota adhesiva.

### Propuesta de valor (borrador para validar)

«Un metroidvania de acción en pixel art donde puedes *detener el tiempo* para encadenar combos imposibles y saquear cofres de rareza creciente.»

### Bucle jugable (core loop)

Explorar sala*→*Combatir*→*Loot con rareza*→*Equipar / mejorar*→*Abrir zona nueva o minijefe*→*Checkpoint*↺*

MUST · sin esto no hay demo

- Caminar, correr, saltar y doble salto
- Ataque básico con combo de 3 golpes
- Esquivar (dash con invulnerabilidad breve)
- Barra de vida del jugador y de los enemigos
- 2 tipos de enemigo y 1 minijefe
- Drop de enemigos y cofres con rareza
- Checkpoints; al morir, los enemigos reaparecen
- Entre 4 y 6 salas en 1 o 2 zonas
- Pantalla de título, HUD y muerte

SHOULD · si vamos bien en la hora 5

- Parry con ventana de unos 150 ms
- Ataque cargado
- Luchador: *parar el tiempo*
- Minimapa con las salas visitadas
- Consumibles, buff temporal y corazón extra
- Equipamiento en una sola ranura (arma)
- Cofres ocultos
- Sala tutorial

COULD · solo si sobra tiempo

- Bloqueo y contraataque
- Clase Mago con almas como munición
- Teletransporte / atravesar
- Coleccionables en el mapa
- Mejoras permanentes en un banco

CUT · fuera de la hackatón

- Árbol de habilidades completo (como mucho 3 nodos)
- Farmeo y recolección de recursos
- Mundo abierto 3D (las imágenes de ambientación sirven como referencia de paleta y tono)
- Guardado en la nube y multijugador

### Rarezas (contrato compartido de datos)

common · 60 % rare · 28 % epic · 10 % legendary · 2 %

Los porcentajes son un punto de partida para la tabla de cofres normales. Los cofres ocultos y los minijefes usan tablas propias más generosas.

## Motores comparados

Criterios ponderados para este caso: cuatro personas, un día, mucho código generado por IA, plataformas 2D y una demo jugable delante del jurado.

<table style="width:99%;">
<colgroup>
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
<col style="width: 16%" />
</colgroup>
<thead>
<tr>
<th>Opción</th>
<th>Programación con IA</th>
<th>4 personas en paralelo</th>
<th>Herramientas 2D de plataformas</th>
<th>Entrega / demo</th>
<th>Riesgo principal</th>
</tr>
</thead>
<tbody>
<tr class="pick">
<td><strong>Phaser 4 + TS</strong><br />
RECOMENDADO</td>
<td>Todo es código. Hay 28 skills oficiales en <code>phaserjs/phaser/skills</code> y un MCP oficial, Phaser Game Agent.</td>
<td>Muy buena: hay un archivo por sistema y ninguna escena de editor.</td>
<td>Arcade Physics, tilemaps de Tiled, importador de Aseprite, cámaras, partículas y tweens.</td>
<td>Se juega en el navegador con un enlace. Despliegue en itch.io, Vercel o GitHub Pages.</td>
<td>La v4 es reciente y los modelos mezclan la API de la v3. Se mitiga con las skills.</td>
</tr>
<tr>
<td><strong>Godot 4.6 + GDScript</strong><br />
PLAN B</td>
<td>Los archivos son texto. Hay varios MCP: godot-ai (★3,6k) y godot-mcp (★454).</td>
<td>Media: los <code>.tscn</code> chocan si dos personas tocan la misma escena.</td>
<td>Excelentes: AnimationPlayer, TileMapLayer, CharacterBody2D y editor visual.</td>
<td>Exporta a web y escritorio. Hay que instalar las plantillas de exportación.</td>
<td>Confusión entre Godot 3 y 4. Hace falta experiencia previa con el editor.</td>
</tr>
<tr>
<td><strong>Unity 6 (C#)</strong></td>
<td>C# se genera bien, pero el editor no se automatiza tan fácilmente.</td>
<td>Mala: escenas y prefabs en YAML dan merges dolorosos.</td>
<td>Muy completas, pero pesadas de montar.</td>
<td>El build WebGL es lento y pesado.</td>
<td>La instalación y la importación consumen horas del día.</td>
</tr>
<tr>
<td><strong>KAPLAY (JS)</strong></td>
<td>API mínima, fácil de generar.</td>
<td>Buena.</td>
<td>Básicas: tilemaps y cámaras limitados para un metroidvania.</td>
<td>Navegador.</td>
<td>Os quedaréis cortos cuando lleguen el minimapa y las salas.</td>
</tr>
<tr>
<td><strong>Bevy / LÖVE</strong></td>
<td>Rust compila lento; Lua tiene menos ecosistema.</td>
<td>Media.</td>
<td>Hay que hacerlo casi todo a mano.</td>
<td>Variable.</td>
<td>Demasiada infraestructura para un día.</td>
</tr>
</tbody>
</table>

**Por qué Phaser gana aquí:** la herramienta principal de la hackatón será un agente de IA que lee y escribe texto. Con Phaser no hay estado escondido en un editor y TypeScript valida cada cambio con `tsc`. El agente puede abrir el juego en un navegador con Playwright, jugarlo y ver capturas. El README de Phaser 4 lo dice explícitamente: «Point your AI coding agent at the skills/ folder».

## Arquitectura y patrones de diseño

Responde a la nota «Clean architecture para no pisarnos»: cada persona es dueña de carpetas concretas y los sistemas solo se comunican a través de contratos.

**scenes/**

Boot → Preload → Title → **Game** + **UI** (escena paralela)<span class="small">Orquestan: crean entidades, conectan sistemas y escuchan eventos. No contienen reglas de juego.</span>

↓ usan

**entities/**

Player, Enemy, Boss, Chest, Checkpoint, Door<span class="small">Sprites con una máquina de estados. Se componen de piezas de `components/`.</span>

**components/**

Health, Hitbox, Hurtbox, Knockback, Loot<span class="small">Piezas pequeñas y reutilizables (composición en lugar de herencia).</span>

**systems/**

Combat, Loot, Inventory, Checkpoint, Minimap, Abilities<span class="small">Reglas del juego. Reaccionan a eventos del bus.</span>

↓ dependen solo de

**core/ + types/**

EventBus, GameState, Input, Juice, Pool · contratos de eventos, items y enemigos<span class="small">Se **congelan** tras la hora 1. Cualquier cambio se avisa al equipo.</span>

**data/\*.json**

items, enemies, loot tables, classes, abilities<span class="small">Equilibrio de juego sin tocar código. Un modelo gratuito puede generarlo.</span>

| Patrón | Dónde se usa | Por qué en este juego |
|----|----|----|
| **State** (máquina de estados finita) | Player: idle, run, air, dash, attack, parry, hurt, dead. Enemigos: patrol, chase, windup, attack, stagger. | Combos, parry y esquiva son estados con ventanas de tiempo. Sin una FSM el código se llena de `if` anidados y los agentes rompen transiciones. |
| **Observer** (EventBus tipado) | `enemy:killed` → Loot · `player:hit` → UI + Juice | Desacopla a las cuatro personas: quien hace la UI no importa la clase Player. |
| **Data-driven** | Items, rarezas, tablas de loot, stats de enemigos y clases en JSON. | Se equilibra en caliente y otra persona o un LLM gratuito puede generar el contenido. |
| **Component / composición** | Health, Hitbox y Hurtbox compartidos por jugador, enemigos y jefe. | Un solo sistema de daño para todo. El parry es simplemente una hurtbox que «refleja». |
| **Strategy** | Habilidades de clase con la interfaz `Ability`: TimeStop, Teleport, SoulBolt. | Añadir la clase Mago no toca el código del Luchador. |
| **Command** (abstracción de input) | `Input` expone acciones (`jumpPressed`, `attackPressed`) en lugar de teclas. | Teclado y mando con el mismo código, buffer de inputs y posibilidad de grabar repeticiones para testear. |
| **Object Pool** | Proyectiles, números de daño y partículas de golpe. | Evita tirones del recolector de basura en combates intensos. En Phaser basta con `Group` con `maxSize`. |
| **Singleton acotado** (GameState) | Vida, inventario, checkpoint actual y salas visitadas, guardado en `localStorage`. | Un único lugar de verdad para respawn y minimapa. Usadlo solo para estado global. |

### Estructura de carpetas y responsables

*árbol del repo*

    src/
      main.ts                 # config de Phaser (pixelArt, arcade, escenas)
      scenes/                 # P3: Boot, Preload, Title, Game · P4: UI
      entities/player/        # P1: Player.ts + states/*.ts
      entities/enemies/       # P2: Slime.ts, Knight.ts, Boss.ts
      components/             # P2: Health, Hitbox, Hurtbox, Knockback
      systems/                # P2 Combat · P3 Checkpoint, Minimap · P4 Loot, Inventory
      abilities/              # P1: TimeStop.ts, Teleport.ts (Strategy)
      core/                   # CONGELADO tras la hora 1: EventBus, GameState, Input, Juice, Pool
      types/                  # CONGELADO: events.ts, items.ts, enemies.ts
      data/                   # P4: items.json, loot.json, enemies.json, classes.json
    public/assets/
      sprites/ tilesets/ maps/ audio/ # P4 arte y audio · P3 maps (Tiled)
    CLAUDE.md                 # reglas para todos los agentes
    .claude/skills/           # skills oficiales de Phaser 4
    .claude/agents/           # subagentes: playtester, reviewer

## Código base

Esqueletos para la primera hora. Son API de Phaser 4 (tinte con `setTintMode`, filtros en lugar de preFX/postFX). Revisadlos con `tsc` antes de construir encima.

*src/main.ts · configuración*

    import Phaser from 'phaser';
    import { Boot, Preload, Title, Game, UI } from './scenes';

    new Phaser.Game({
      type: Phaser.AUTO,
      width: 480, height: 270,          // resolución interna 16:9; se escala ×4 a 1080p
      pixelArt: true,                   // sin suavizado: píxeles nítidos
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 }, debug: false } },
      scene: [Boot, Preload, Title, Game, UI],
    });

*core/StateMachine.ts · patrón State*

    export interface State<T> {
      enter?(owner: T, prev: string): void;
      update?(owner: T, dt: number): void;
      exit?(owner: T): void;
    }

    export class StateMachine<T> {
      private states = new Map<string, State<T>>();
      current = '';
      constructor(private owner: T) {}

      add(name: string, s: State<T>) { this.states.set(name, s); return this; }

      set(name: string, force = false) {
        if (name === this.current && !force) return;
        const prev = this.current;
        this.states.get(prev)?.exit?.(this.owner);
        this.current = name;
        this.states.get(name)?.enter?.(this.owner, prev);
      }

      update(dt: number) {
        this.states.get(this.current)?.update?.(this.owner, dt);
      }
    }

*entities/player/states/Air.ts · coyote time, buffer y doble salto*

    import type { State } from '../../../core/StateMachine';
    import type { Player } from '../Player';

    // Player.update() resta dt a coyote, jumpBuffer y comboWindow
    export const Air: State<Player> = {
      update(p) {
        p.moveX(p.input.axisX * p.stats.speed);

        if (p.input.jumpPressed) {
          if (p.coyote > 0) p.jump(1);          // salto justo después de caer de un borde
          else if (p.airJumps > 0) {           // doble salto
            p.airJumps--; p.jump(0.85);
          } else p.jumpBuffer = 120;            // recuerda el input 120 ms
        }
        // salto variable: soltar el botón corta la subida
        if (!p.input.jumpHeld && p.body.velocity.y < 0) p.body.velocity.y *= 0.5;

        if (p.input.dashPressed && p.canDash) return p.fsm.set('dash');
        if (p.input.attackPressed) return p.fsm.set('attack');

        if (p.body.blocked.down) {
          p.airJumps = p.stats.airJumps;
          p.fsm.set(p.jumpBuffer > 0 ? 'jump' : 'ground');
        }
      },
    };

*entities/player/states/Attack.ts · combo de 3 golpes*

    export const Attack: State<Player> = {
      enter(p) {
        // si llega dentro de la ventana, encadena el siguiente golpe
        p.combo = p.comboWindow > 0 ? (p.combo % 3) + 1 : 1;
        p.play(`attack${p.combo}`);
        p.hitbox.activate({ dmg: p.combo === 3 ? 2 : 1, frames: [2, 3] });
      },
      update(p) {
        if (p.input.attackPressed) p.queuedAttack = true;   // buffer
        if (p.anims.isPlaying) return;
        p.comboWindow = 250;
        if (p.queuedAttack && p.combo < 3) {
          p.queuedAttack = false;
          return p.fsm.set('attack', true);   // force: re-entrar en el mismo estado
        }
        p.fsm.set(p.body.blocked.down ? 'ground' : 'air');
      },
      exit(p) { p.hitbox.deactivate(); p.queuedAttack = false; },
    };

*core/EventBus.ts · patrón Observer tipado*

    import Phaser from 'phaser';

    export type GameEvents = {
      'player:hit':         { dmg: number; hp: number };
      'enemy:killed':       { kind: string; x: number; y: number };
      'item:picked':        { itemId: string };
      'checkpoint:reached': { id: string };
      'room:entered':       { roomId: string };
    };
    type Fn<K extends keyof GameEvents> = (p: GameEvents[K]) => void;

    const em = new Phaser.Events.EventEmitter();
    export const bus = {
      emit<K extends keyof GameEvents>(k: K, p: GameEvents[K]) { em.emit(k, p); },
      on<K extends keyof GameEvents>(k: K, fn: Fn<K>, ctx?: unknown) { em.on(k, fn, ctx); },
      off<K extends keyof GameEvents>(k: K, fn: Fn<K>, ctx?: unknown) { em.off(k, fn, ctx); },
    };

    // UIScene:   bus.on('player:hit', e => this.hearts.set(e.hp));
    // LootSys:   bus.on('enemy:killed', e => this.drop(e.kind, e.x, e.y));
    // Al reiniciar una escena: this.events.once('shutdown', () => bus.off(...))

*data/items.json · data-driven*

    [
      { "id": "pocion_menor", "name": "Poción menor", "rarity": "common",
        "type": "consumable", "heal": 2 },
      { "id": "fragmento_corazon", "name": "Fragmento de corazón", "rarity": "rare",
        "type": "heart", "maxHp": 1 },
      { "id": "elixir_furia", "name": "Elixir de furia", "rarity": "epic",
        "type": "buff", "stats": { "atk": 2 }, "durationMs": 10000 },
      { "id": "hoja_eclipse", "name": "Hoja del eclipse", "rarity": "legendary",
        "type": "equipment", "slot": "weapon", "stats": { "atk": 4, "speed": 10 } }
    ]

*systems/Loot.ts · tabla ponderada*

    export type LootEntry = { id: string | null; w: number }; // null = no suelta nada

    export function roll(table: LootEntry[], rng = Math.random): string | null {
      let r = rng() * table.reduce((s, e) => s + e.w, 0);
      for (const e of table) if ((r -= e.w) < 0) return e.id;
      return null;
    }

    // data/loot.json
    // "enemy_basic":  [{ "id": null, "w": 60 }, { "id": "pocion_menor", "w": 35 }, { "id": "fragmento_corazon", "w": 5 }]
    // "chest_hidden": [{ "id": "elixir_furia", "w": 70 }, { "id": "hoja_eclipse", "w": 30 }]

*core/Juice.ts · game feel*

    import Phaser from 'phaser';

    export const Juice = {
      /** congela física y animaciones unos ms: el golpe "pesa" */
      hitStop(scene: Phaser.Scene, ms = 70) {
        scene.physics.world.pause();
        scene.anims.pauseAll();
        setTimeout(() => { scene.physics.world.resume(); scene.anims.resumeAll(); }, ms);
      },
      shake(scene: Phaser.Scene, ms = 90, k = 0.004) {
        scene.cameras.main.shake(ms, k);
      },
      /** destello blanco (API de tinte de Phaser 4) */
      flash(s: Phaser.GameObjects.Sprite) {
        s.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
        s.scene.time.delayedCall(60, () =>
          s.setTintMode(Phaser.TintModes.MULTIPLY).clearTint());
      },
      damageNumber(scene: Phaser.Scene, x: number, y: number, n: number) {
        const t = scene.add.text(x, y, `${n}`, { fontFamily: 'monospace', fontSize: '8px' });
        scene.tweens.add({ targets: t, y: y - 14, alpha: 0, duration: 500,
          ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
      },
    };
    // onHit(enemy): Juice.hitStop(s, 60); Juice.flash(enemy);
    //               Juice.shake(s); Juice.damageNumber(s, enemy.x, enemy.y - 8, dmg);

*abilities/TimeStop.ts · patrón Strategy*

    export interface Ability {
      id: string; cooldownMs: number;
      activate(scene: GameScene, caster: Player): void;
    }

    export const TimeStop: Ability = {
      id: 'time_stop', cooldownMs: 12000,
      activate(scene) {
        const frozen = [...scene.enemies.getChildren(), ...scene.projectiles.getChildren()]
          as Phaser.Physics.Arcade.Sprite[];
        frozen.forEach(o => { (o.body as Phaser.Physics.Arcade.Body).moves = false; o.anims.pause(); });
        scene.enemyAI.paused = true;                 // la IA deja de decidir

        const { width: w, height: h } = scene.scale;
        const veil = scene.add.rectangle(0, 0, w, h, 0x6b2fbf, 0.35)
          .setOrigin(0).setScrollFactor(0).setDepth(900).setAlpha(0);
        scene.tweens.add({ targets: veil, alpha: 1, duration: 150 });

        scene.time.delayedCall(3000, () => {
          frozen.filter(o => o.active).forEach(o => {
            (o.body as Phaser.Physics.Arcade.Body).moves = true; o.anims.resume();
          });
          scene.enemyAI.paused = false;
          scene.tweens.add({ targets: veil, alpha: 0, duration: 200, onComplete: () => veil.destroy() });
        });
      },
    };

## Animación y game feel

En una demo de 3 minutos, el jurado juzga sobre todo la sensación al controlar. Dedicad la hora de pulido a esto antes que a añadir contenido.

### Animaciones por personaje (mínimo viable)

| Tag en Aseprite | Frames | FPS |
|-----------------|--------|-----|
| idle            | 4      | 8   |
| run             | 6–8    | 12  |
| jump / fall     | 2 + 2  | 10  |
| attack1–3       | 4 c/u  | 16  |
| dash            | 3      | 16  |
| hurt / death    | 2 / 6  | 10  |

Exportad desde Aseprite con *Export Sprite Sheet* y datos JSON con *tags*. En Phaser: `this.load.aseprite('hero', 'hero.png', 'hero.json')` y `this.anims.createFromAseprite('hero')`, que crea todas las animaciones por tag.

### Checklist de juice

- **Hitstop** de 50–100 ms en cada golpe que conecta.
- **Destello blanco** del enemigo y **knockback**.
- **Screen shake** corto. Más fuerte en el golpe 3 y en el parry.
- **Coyote time** (~100 ms), **jump buffer** (~120 ms) y **salto variable**.
- **Squash & stretch** al aterrizar (tween de escala de 80 ms).
- Partículas de polvo al correr o aterrizar y chispas al hacer parry.
- Cámara con `startFollow(player, true, 0.1, 0.1)` y `setDeadzone`.
- Fotogramas de anticipación (*windup*) en los ataques enemigos para que el parry sea legible.
- Números de daño y la barra de vida bajando con un tween.
- Parar el tiempo: velo morado, sonido grave y desaturación con un filtro de Phaser 4.

Referencia de oro: Celeste publicó su clase `Player.cs` (unas 5.400 líneas, licencia MIT) con todos los trucos de control: coyote time, buffer, corner correction y dash. Pedidle a vuestro agente que la lea y adapte *ideas*, no que copie código. Complementad con el vídeo de Game Maker's Toolkit «Why Does Celeste Feel So Good to Play?» y las charlas «Juice it or lose it» y «The Art of Screenshake».

## Personajes y arte

Lo que más tiempo consume y lo que más delata un juego de hackatón es la inconsistencia visual. Fijad las reglas en la hora 0.

### Guía de estilo (decidir en la hora 0)

- **Resolución interna** 480×270, tiles de **16×16**, personajes de unos **32×32** y jefe de 64×64.
- **Una paleta cerrada** de Lospec (por ejemplo, una de 32 colores). Todo sprite generado o descargado se reduce a esa paleta. Para la ambientación de las referencias (magenta y turquesa nocturno), buscad paletas de unos 32 colores con esos tonos.
- **Perspectiva**: lateral pura. Nada de assets top-down mezclados.
- **Contorno**: oscuro de 1 px en personajes y enemigos para separarlos del fondo.

| Vía | Herramienta | Cuándo usarla | Coste / licencia |
|----|----|----|----|
| **Packs gratuitos** | Kenney (Pixel Platformer, 1-Bit Platformer, New Platformer Pack), «Orius» de JIK-A-4 (personaje, armas, enemigos y tiles para metroidvania), sección CC0 de itch.io | Base y placeholders desde el minuto 1. Tiles y enemigos genéricos. | CC0 (Kenney y Orius). Comprobad cada pack: algunos son CC BY-ND. |
| **Generación con IA** | PixelLab: `create_character` (4 u 8 direcciones), `animate_character` (walk, run, idle…), tilesets. Tiene MCP para Claude Code. | Protagonista y jefe propios con animaciones coherentes. | De pago por créditos. Revisad las condiciones de uso. |
| **Editores** | Aseprite (estándar de la industria) · LibreSprite (fork gratuito, GPL-2) · Pixelorama (gratuito, MIT, ★11k) | Retocar lo generado, unificar la paleta y montar las animaciones por tags. | Aseprite cuesta unos 20 USD o se compila gratis desde el código. Los otros dos son gratuitos. |

**Flujo recomendado para personajes:** genera un frame base del protagonista (PixelLab o a mano). Fíjalo como referencia y genera las animaciones a partir de él. Pásalo por Aseprite para limpiar píxeles sueltos, forzar la paleta y crear los tags. Exporta la hoja y el JSON. Si a mediodía no hay un personaje propio aceptable, usad uno de pack y cambiadle la paleta.

## Mapa, salas y minimapa

Un metroidvania son salas conectadas por puertas. Montadlo en Tiled para que la persona del mapa no dependa de nadie.

### Convención de capas en Tiled

- `fondo`: decoración sin colisión, con parallax mediante `setScrollFactor(0.5)`.
- `colision`: tiles con la propiedad `collides=true`.
- `decor`: primer plano por encima del jugador.
- `entidades` (capa de objetos), con tipos `player_spawn`, `enemy{kind}`, `chest{loot, hidden}`, `checkpoint{id}`, `door{to, spawn}` y `room{id}` (rectángulo de cámara).

Exportad a JSON. LDtk también es excelente (y la mejor opción si vais con Godot), pero en Phaser no tiene un importador oficial.

*scenes/Game.ts · cargar sala*

    const map = this.make.tilemap({ key: 'zona1' });
    const tiles = map.addTilesetImage('cueva', 'tiles-cueva')!;
    map.createLayer('fondo', tiles)!.setScrollFactor(0.5);
    const solid = map.createLayer('colision', tiles)!;
    solid.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, solid);
    this.physics.add.collider(this.enemies, solid);

    for (const o of map.getObjectLayer('entidades')!.objects) {
      spawnFromTiled(this, o);   // switch (o.type) → crea entidad
    }

    // Minimapa: segunda cámara pequeña y alejada
    const mini = this.cameras.add(370, 6, 104, 60)
      .setZoom(0.08).startFollow(this.player)
      .setBackgroundColor('rgba(10,8,20,0.75)');
    mini.ignore(this.hudObjects);

Para un minimapa con niebla de guerra, dibujad los rectángulos `room` de Tiled en un `Graphics` de la escena UI y pintadlos al recibir `room:entered`. Es más barato y más legible que la segunda cámara. El addon **Metroidvania System** de KoBeWi (Godot, MIT, ★1,6k) es la mejor referencia de cómo modelar salas, puertas y mapa aunque no uséis Godot.

**Ambientación:** 2–3 capas de parallax, partículas ambientales (polvo, luciérnagas, ceniza) con el emisor de partículas, y la iluminación 2D de Phaser 4 (`sprite.setLighting(true)`) para cuevas. Para dar el tono de las referencias, un color de fondo de la paleta en cada zona.

## Sonido y música

| Necesidad | Herramienta | Notas |
|----|----|----|
| SFX retro al instante (salto, golpe, moneda, daño) | **jsfxr**, **ChipTone**, Bfxr | En el navegador y gratis. Un sonido por minuto. Exportad a WAV y convertid a OGG o MP3. |
| SFX realistas o específicos (espada, rugido del jefe, «parar el tiempo») | **ElevenLabs Sound Effects** (texto → sonido) | Es IA. El plan gratuito exige atribuir a elevenlabs.io en los créditos. |
| Packs de efectos | Kenney Audio (CC0), Freesound | En Freesound, cada sonido tiene su propia licencia CC. Anotadla. |
| Música chiptune y loops | **BeepBox**, **Bosca Ceoil**, LMMS | Un tema por zona, un tema de jefe y un jingle de muerte. |
| Música generada por IA | Generadores tipo Suno o Udio | Revisad las reglas de la hackatón y las condiciones del plan gratuito, que suelen ser de uso no comercial. |

*uso en Phaser*

    // variar el tono evita la fatiga al repetir el mismo golpe
    this.sound.play('hit', { volume: 0.6, detune: Phaser.Math.Between(-150, 150) });

    // fundido entre la música de zona y la del jefe
    this.tweens.add({ targets: this.music, volume: 0, duration: 800,
      onComplete: () => { this.music.stop(); this.music = this.sound.add('boss', { loop: true }); this.music.play(); } });

El navegador no reproduce audio hasta la primera interacción. La pantalla de título con «Pulsa una tecla» resuelve esto de paso.

## Flujo de trabajo con IA

Responde a la nota «Agents con las skills necesarias». Cada persona trabaja con su propio Claude Code, pero todos comparten las mismas reglas y conocimiento.

### 1. Skills oficiales de Phaser 4 en el repo

El repo `phaserjs/phaser` trae 28 skills en `skills/`: animations, physics-arcade, tilemaps, cameras, particles, tweens, filters-and-postfx, v3-to-v4-migration y más. Copiadlas una vez al proyecto. Claude Code las carga solo cuando la tarea lo necesita.

*terminal*

    npx degit phaserjs/phaser/skills .claude/skills

**Equipo mixto (2 personas con Claude y 2 con GPT):** las reglas viven en `AGENTS.md` del repo [sebvitaa/MafiaDev](https://github.com/sebvitaa/MafiaDev), que Codex lee de forma nativa y `CLAUDE.md` importa con `@AGENTS.md`. La memoria fuera del chat está en `agents/history`, `agents/pendings` y `agents/supuestos`, y se gestiona con `node scripts/agents.mjs new|status`. La plantilla de abajo es el resumen original; manda `AGENTS.md`.

### 2. CLAUDE.md compartido (plantilla)

*CLAUDE.md*

    # Metroidvania hackatón
    Stack: Phaser 4.2 + TypeScript strict + Vite. Arcade Physics. Mapas Tiled (JSON).
    Comandos: `npm run dev` · `npm run build` (debe pasar antes de cada merge).

    ## Reglas
    - API de Phaser 4, NO de Phaser 3: tinte con setTintMode (no setTintFill), filtros
      (no preFX/postFX), iluminación con setLighting(true). Ante dudas, lee .claude/skills/.
    - Solo edita las carpetas de tu dueño (ver tabla). core/ y types/ están congelados:
      si necesitas un cambio, dilo en lugar de hacerlo.
    - Los sistemas se comunican por `bus` (core/EventBus.ts), nunca importando escenas ajenas.
    - Números de equilibrio (daño, vida, drops) en data/*.json, nunca hardcodeados.
    - Entidades = sprite + StateMachine + componentes. Una clase por archivo.
    - Cambios pequeños: un commit por mecánica, rama corta, merge cada hora.

    ## Dueños
    P1 entities/player, abilities · P2 entities/enemies, components, systems/Combat
    P3 scenes (menos UI), maps, systems/Checkpoint+Minimap · P4 UI, data, Loot, Inventory, assets

### 3. MCP y subagentes útiles

| Herramienta | Para qué | Cómo |
|----|----|----|
| **Playwright MCP** | El agente abre el juego, pulsa teclas, saca capturas y lee la consola: puede comprobar que su cambio funciona. | `claude mcp add playwright -- npx @playwright/mcp@latest` |
| **PixelLab MCP** | Crear personajes, animarlos y generar tilesets desde el chat. | Servidor remoto de PixelLab con token (créditos de pago) o el paquete npm `pixellab-mcp`. |
| **Phaser Game Agent** | MCP oficial de Phaser que genera juegos con código, arte y sonido. | Necesita cuenta. Probadlo antes de la hackatón, no el mismo día. |
| **Subagente `playtester`** | Tras cada merge: ejecuta `npm run build`, abre el juego con Playwright, recorre la sala 1 y reporta errores de consola. | `.claude/agents/playtester.md` |
| **FreeLLMAPI** (ya lo tenéis) | Generar `items.json`, stats de enemigos, nombres, descripciones, diálogos del tutorial y el borrador del README. | `tools/freellm -m auto:smart -j "..."`, revisando la salida antes de usarla. |

### 4. Cómo pedirle cosas al agente

- **Acotad archivos**: «Implementa el estado `dash` en `entities/player/states/Dash.ts` siguiendo `core/StateMachine.ts`. No modifiques otros archivos.»
- **Dad números**: «Dash de 160 px en 150 ms, invulnerable los primeros 100 ms, cooldown de 400 ms.»
- **Pedid verificación**: «Al terminar, ejecuta `npm run build` y prueba con el subagente playtester.»
- **Una mecánica por petición.** Si el agente lleva más de 10 minutos atascado, revertid y reformulad la petición.

## Roles y horario

Para unas 10 horas efectivas. Ajustad la hora 0 a la hora real de inicio. La rama `main` siempre tiene que ser jugable.

<table>
<thead>
<tr>
<th>Hora</th>
<th>Vicho · Mapa, exploración y ambientación</th>
<th>Basti · Combate y movimiento</th>
<th>Alejandro · Personaje y habilidades</th>
<th>Seba · Música, sonido y pantallas</th>
</tr>
</thead>
<tbody>
<tr>
<td class="num">0–1</td>
<td colspan="4"><strong>Todos:</strong> propuesta de valor en dos líneas, recorte MoSCoW, repo con la plantilla de Vite y TS, CLAUDE.md, skills, <code>core/</code> y <code>types/</code>, guía de estilo y despliegue automático a GitHub Pages o itch.io.</td>
</tr>
<tr>
<td class="num">1–4</td>
<td>Tileset, sala 1 y sala 2 en Tiled, carga del mapa, cámara y puertas entre salas.</td>
<td>FSM del jugador: correr, saltar, doble salto, coyote time y dash. Health, Hitbox y Hurtbox.</td>
<td>Sprites y animaciones del protagonista, <code>CharacterStats</code>, items y rareza en JSON.</td>
<td>Boot y Preload con barra de carga, título, pausa, AudioDirector escuchando el bus y 10 SFX.</td>
</tr>
<tr>
<td class="num">4</td>
<td colspan="4"><strong>Integración 1:</strong> se puede recorrer la sala 1, pegar a un enemigo y morir. Arte gris permitido.</td>
</tr>
<tr>
<td class="num">4–7</td>
<td>Salas 3 a 6, checkpoints, respawn de enemigos, cofres (también ocultos) y minimapa.</td>
<td>Combo de 3 golpes, parry, dos tipos de enemigo y minijefe con anticipación visible.</td>
<td>«Parar el tiempo», inventario y equipo, drops con rareza, consumibles y buffs.</td>
<td>HUD (corazones, vida del jefe, cooldowns), música por zona y tema del jefe.</td>
</tr>
<tr>
<td class="num">7</td>
<td colspan="4"><strong>Integración 2 y playtest cruzado:</strong> cada persona juega el bucle completo y anota fallos.</td>
</tr>
<tr>
<td class="num">7–9</td>
<td>Parallax, partículas, iluminación y sala tutorial.</td>
<td>Juice (hitstop, shake) y equilibrio de daño y vida en JSON.</td>
<td>Mago o teletransporte si sobra tiempo. Pulido de animaciones.</td>
<td>Mezcla de audio, transiciones, game over y créditos.</td>
</tr>
<tr>
<td class="num">9–10</td>
<td colspan="4"><strong>Feature freeze.</strong> Solo arreglos de bugs, build final, GIF o vídeo de 30 s, README y ensayo del pitch de 3 minutos.</td>
</tr>
</tbody>
</table>

## Código open source del que aprender

Estrellas y licencias comprobadas el 23-11-2026. Con licencias GPL o sin licencia, leed para aprender pero no copiéis código.

| Repositorio | Stack | Qué estudiar | Licencia | ★ |
|----|----|----|----|----|
| [phaserjs/phaser · skills/](https://github.com/phaserjs/phaser/tree/master/skills) | Phaser 4 | Las 28 skills oficiales: la mejor documentación para vuestro agente. | MIT | 40,7k |
| [chongdashu/phaserjs-oakwoods](https://github.com/chongdashu/phaserjs-oakwoods) | Phaser + Claude Code | Plataformas RPG hecho con *vibe coding* y agent skills: el flujo más parecido al vuestro. | MIT | 86 |
| [NoelFB/Celeste](https://github.com/NoelFB/Celeste) (Source/Player.cs) | C# | El controlador de plataformas de referencia: coyote time, buffers, dash y corner correction. | MIT · archivado | 4,0k |
| [KoBeWi/Metroidvania-System](https://github.com/KoBeWi/Metroidvania-System) | Godot 4 | Modelado de salas, puertas, mapa con niebla y guardado de exploración. | MIT | 1,6k |
| [gdquest-demos/godot-platformer-2d](https://github.com/gdquest-demos/godot-platformer-2d) | Godot | Metroidvania de curso: FSM del jugador muy bien explicada. | MIT | 820 |
| [dannygaray60/toziuha-night-oota](https://github.com/dannygaray60/toziuha-night-oota) | Godot | Metroidvania completo estilo Castlevania: items, enemigos y jefes. | MIT | 138 |
| [uheartbeast/metroidvania](https://github.com/uheartbeast/metroidvania) | Godot | De HeartBeast, autor de tutoriales clásicos de acción 2D. | MIT | 88 |
| [kennedyvnak/unity-metroidvania](https://github.com/kennedyvnak/unity-metroidvania) | Unity C# | Metroidvania open source en Unity: cómo organizar un proyecto C# del género. | ver repo | 152 |
| [pulppixel/2d-combat-prototype](https://github.com/pulppixel/2d-combat-prototype) | Unity | Prototipo de combate soulslike en pixel art con combos y esquiva. | MIT | 1 |
| [00-Evan/shattered-pixel-dungeon](https://github.com/00-Evan/shattered-pixel-dungeon) | Java | Sistema de items, rarezas, loot y equipamiento muy pulido. | GPL-3.0 | 6,9k |
| [friendlyfiregame/friendlyfiregame](https://github.com/friendlyfiregame/friendlyfiregame) | TypeScript | Juego web de exploración 2D en TS puro: organización de un juego de navegador. | sin declarar | 90 |
| [phopps/nightfall](https://github.com/phopps/nightfall) | Phaser + TS | Metroidvania web hecho en una game jam: la escala que vais a tener. | MIT | 0 |
| [remarkablegames/phaser-platformer](https://github.com/remarkablegames/phaser-platformer) | Phaser + TS | Plantilla de plataformas con Tiled ya conectado. | MIT | 6 |
| [hi-godot/godot-ai](https://github.com/hi-godot/godot-ai) | Godot MCP | Solo si elegís el plan B: conecta Claude Code con el editor de Godot. | MIT | 3,7k |
| [godotengine/godot-demo-projects](https://github.com/godotengine/godot-demo-projects) | Godot | Demos oficiales: platformer 2D, partículas y tilemaps. | MIT | 9,8k |

Referencias de diseño (no de código): Hollow Knight y Dead Cells para el movimiento y el combate, Minecraft Dungeons para la lectura de rarezas por color, y Hyper Light Drifter y Eastward para la ambientación pixel art de vuestro tablero.

## Riesgos y cómo evitarlos

| Riesgo | Señal | Mitigación |
|----|----|----|
| El agente escribe API de Phaser 3 | `setTintFill is not a function`, `preFX` undefined, pipelines | Skills en `.claude/skills/`, la regla en CLAUDE.md y la skill `v3-to-v4-migration`. Como último recurso, fijad `phaser@3` (3.90), que los modelos conocen mejor. |
| Conflictos de merge | Dos personas tocan `Game.ts` | Dueños por carpeta, `Game.ts` solo orquesta, comunicación por eventos y merges cada hora. |
| Scope creep | En la hora 5 se habla del árbol de habilidades | La lista MoSCoW es ley. Lo que no está en MUST espera hasta la integración 1. |
| Arte inconsistente | Mezcla de resoluciones o paletas | Guía de estilo en la hora 0 y una sola persona aprueba los assets. |
| La física «se siente mal» | Salto flotante o golpes sin peso | Gravedad alta (800–1000), coyote time, buffer, hitstop y shake. Constantes en `data/tuning.json` para ajustarlas en vivo. |
| Demo rota en el pitch | Build de última hora | Despliegue continuo desde la hora 1, feature freeze en la hora 9 y vídeo de respaldo. |

## Arranque en 15 minutos

*terminal · una sola persona en la hora 0*

    npm create @phaserjs/game@latest metroidvania   # elegir plantilla Vite + TypeScript
    cd metroidvania && npm i && npm i phaser@^4.2
    npx degit phaserjs/phaser/skills .claude/skills
    claude mcp add playwright -- npx @playwright/mcp@latest
    mkdir -p src/{core,types,entities/player/states,entities/enemies,components,systems,abilities,data}
    git init && git add -A && git commit -m "chore: esqueleto Phaser 4 + TS"
    # después: CLAUDE.md, core/ y types/ de la sección «Código base», y GitHub Action de despliegue

Instalad antes del día: Node 22, Tiled, Aseprite o LibreSprite, Claude Code y una cuenta de itch.io. Comprobad qué versión de Phaser instala la plantilla: si es la 3, la línea `npm i phaser@^4.2` la actualiza.

## Fuentes

- [Phaser v4.0.0 «Caladan»: descarga estable](https://phaser.io/download/stable)
- [Phaser 4.1.0 «Salusa»](https://phaser.io/news/2026/04/phaser-4-1-0-salusa-release)
- [Phaser v4.2.1 (gamedev.net)](https://gamedev.net/news/4825-phaser-v421-released/)
- [Phaser 3 vs Phaser 4](https://phaser.io/news/2026/05/phaser-3-vs-phaser-4)
- [Skills oficiales de Phaser 4](https://github.com/phaserjs/phaser/tree/master/skills)
- [Phaser Game Agent](https://phaser.io/news/2026/06/phaser-game-agent) · [configuración MCP](https://phaser.io/news/2026/07/phaser-game-agent-mcp-setup)
- [Vibe coding de un beat 'em up con Phaser](https://phaser.io/news/2026/06/vibe-code-a-complete-2d-beat-em-up-game-with-phaser-and-codex)
- [Godot 4.6](https://godotengine.org/releases/4.6/)
- [godot-ai (MCP)](https://github.com/hi-godot/godot-ai) · [godot-mcp](https://github.com/tomyud1/godot-mcp)
- [Godot y agentes de IA (DEV)](https://dev.to/abagames/godot-is-well-suited-for-game-development-with-ai-coding-agents-2lcm)
- [pixellab-mcp (npm)](https://www.npmjs.com/package/pixellab-mcp)
- [Código de movimiento de Celeste (80.lv)](https://80.lv/articles/celestes-movement-code-available-on-github)
- [Importador LDtk para Godot 4](https://github.com/heygleeson/godot-ldtk-importer)
- [LDtk y Tiled en Phaser (foro)](https://phaser.discourse.group/t/best-tile-editor-to-use-for-old-mac-os/14513)
- [Kenney 1-Bit Platformer](https://kenney.nl/assets/1-bit-platformer-pack) · [Pixel Platformer](https://kenney-assets.itch.io/pixel-platformer)
- [Orius: asset pack metroidvania (CC0)](https://jik-a-4.itch.io/orius-asset-pack)
- [itch.io: assets CC0 de plataformas](https://itch.io/game-assets/assets-cc0/free/genre-platformer)
- [Herramientas de SFX para indies (ElevenLabs)](https://elevenlabs.io/blog/best-game-sound-effects)
- [Colección de herramientas de audio (itch.io)](https://itch.io/c/2792664/audio-tools)
- [Pixelorama](https://github.com/Orama-Interactive/Pixelorama) · [LibreSprite](https://github.com/LibreSprite/LibreSprite)

Investigación preparada con Claude Code para la hackatón. Versiones, estrellas y licencias comprobadas el 23-11-2026: revisadlas de nuevo si pasa tiempo.
