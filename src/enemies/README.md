# Enemigos básicos

Tres tipos solicitados por el humano: **slime**, **Cobrador ágil** y **knight resistente**. Cobrador y knight son ahora tipos separados; esto amplía la equivalencia original del lore.

## Probar en el laboratorio

Con Vite ejecutándose, abrir `/src/player/room-prototype/?enemies=1`. Aparecen los tres enemigos y el jugador conserva la espada recogible del lado derecho. El enlace de la cabecera activa este modo. La entrada sin el parámetro mantiene la práctica original de movimiento/muñeco.

WASD/flechas mueven, Shift corre, doble toque o C/K hacen dash, clic corto hace combo y mantener clic carga. Mantener Q + derecho lanza una marca; Q + izquierdo o 1–4 hacen TP. R reinicia la sala, enemigos, vida y marcas.

## Balance inicial

Todos los impactos y las vidas del combate usan **puntos**:

| Unidad | Vida | Daño por ataque | Rasgo |
|---|---:|---:|---|
| Luchador | 125 | 25 / 30 / 40 (combo) | Carga hasta 50; 600 ms de protección después de recibir daño |
| Slime | 50 | 25 | Lento, pequeño impulso y recuperación larga |
| Cobrador | 100 | 25 | Ágil, golpe frontal y anticipación de 450 ms |
| Knight | 150 | 50 | Lento, anticipación de 750 ms; su ataque no se interrumpe por daño |

`combat.balance` en tuning convierte los stats existentes: cada corazón equivale a 25 puntos y cada unidad de atk a 12,5 puntos. Así maxHp=5 y atk=2 del Luchador producen 125 HP y golpe base 25, sin cambiar contratos shared ni las clases. `SwordAttack` usa ese daño inyectado para combo y carga. El HUD de eventos recibe los valores convertidos a corazones; el laboratorio muestra puntos.

Daños/vida/velocidad/alcance/anticipación/recuperación de cada tipo están en `src/data/enemies.json`. Las constantes comunes están en `src/data/tuning.json`. Estos son valores iniciales de playtest, registrados en SUP-basti-20261123-133221.

## Arquitectura

- `Health`: vida pura, daño aplicado limitado a HP restante, muerte única y protección temporal opcional.
- `EnemyBrain`: StateMachine sin Phaser con idle/chase/windup/attack/recovery/hurt/dead. La dirección se fija en anticipación; cada ataque consume un único impacto.
- `navigation`: grafo de visibilidad sobre huellas estáticas; respeta ancho/alto físico del enemigo y recalcula a intervalos.
- `Enemy`: cuerpo Arcade dinámico, visual separado, sector de anticipación amarillo/impacto rojo, vida, reacción y muerte. Implementa SwordDamageTarget y el adaptador de fuego que ya tenía el prototipo.
- `EnemySystem`: creación de IDs únicos, colisiones con sólidos/jugador/otros enemigos, actualización y cleanup del sistema.

`new EnemySystem(scene, playerAdapter, solids)` requiere un jugador con anchor Arcade, alive, radius y takeEnemyDamage(damage, direction). `spawn('slime' | 'cobrador' | 'knight', x, y)` devuelve el enemigo. `targets` ofrece solo enemigos vivos para el combo de espada. `update(dtMs)` debe ejecutarse una vez por frame; los impactos se resuelven después de física.

Todos los enemigos se registran mediante `registerTeleportTarget(anchor)`. Al morir se desactiva su cuerpo, se retira el registro y la habilidad libera su marca. Los impactos de espada y de enemigos comprueban los sólidos: no dañan a través de pilares.

El daño del jugador interrumpe ataques/carga y dash, conserva la recuperación del dash, aplica retroceso y 600 ms de protección. El salto sigue su trayectoria durante la reacción. Al morir se bloquean movimiento, ataque y teclas de TP hasta reiniciar. No se añadió invulnerabilidad automática por dash o salto.

## Límites de esta entrega

El modo de combate se integra en el laboratorio de Basti; todavía no se instalaron estos enemigos en los mapas de Vicho. No hay jefe ni nuevas habilidades del jugador en esta entrega. La bola E que ya tenía la rama de Basti conserva su adaptador de daño.
