# Corazón Codex / CANAL 23 (laboratorio)

Activar a Bodoque con B en `/src/player/room-prototype/`; recoger espada y usar los controles habituales. Al llegar a 100 HP, cualquier exceso del golpe se descarta; la apertura dura 1200 ms. No hay regeneración ni una segunda reserva de vida. El HUD conserva los HP sobre los 600 originales y cambia a «CORAZÓN CODEX». Los últimos 100 se dañan solo alcanzando el pequeño núcleo flotante, a la derecha del pecho.

`BodoqueBrain` es la fuente única de vida/estados: `opening → heart → dying → defeated`, dentro de fase 3. Interrumpe el patrón actual al entrar. No implementa los patrones pendientes de fases 2/3. `damageTargets` excluye cuerpo/núcleo durante la apertura y solo devuelve `heartTarget` cuando está expuesto. Adaptadores de espada, combos, carga, eco y explosión usan su posición visual exacta, radio 16 y el mismo ID del cuerpo; no devolver ambos objetivos juntos. `takeSwordDamage` del cuerpo no sirve como atajo para dañar el corazón. Mantener los hit trackers existentes para un solo impacto por objetivo.

A 23 HP o menos, `criticalTriggered` se devuelve una vez por encuentro. `BodoqueFinale.startCritical()` activa APUESTA en ambos monitores durante 1500 ms. El rótulo fijo «¡Queda una pura...!» identifica a Bodoque y dura 5500 ms de juego, incluso si el golpe cruza el umbral y lleva el corazón a cero. El pulso crítico persiste hasta morir, pero la interrupción no se repite, no pausa física/input ni altera las reglas de daño. El pulso/rotación no cambia el centro del hitbox. Iluminación simulada mediante halos Graphics, sin pipelines ni luces globales.

A cero HP la ruptura dura 1600 ms o el tiempo de lectura que quede, si es mayor: partículas acotadas, Bodoque se arrodilla y se desvanece hacia arriba, los monitores se apagan y la lluvia local cae hacia abajo. Solo al terminar se invoca `onKilled({kind:'boss', ...})` una vez y aparece victoria local. Nunca se publica en el bus desde el laboratorio (evita disparar créditos).

## Copia jugable de El Set

La arena Tiled del mundo usa este mismo jefe y el sistema de daño del jugador. Los dos monitores mantienen el número 23 sobre su estado de señal. La identificación «EN VIVO · CANAL 23» queda fija en la esquina superior derecha desde el comienzo de la pelea hasta el corte final. El acceso 3 del menú reproduce la entrada con Ríos armado. El vídeo final, el HUD y el director de audio comparten el flujo de la partida y los créditos comienzan al terminar el cierre o al saltarlo. El laboratorio independiente conserva sus controles de prueba con B y R. En ambos modos se apunta la lluvia italiana con clic derecho.

## Contratos del laboratorio

- Composición principal: consumir `damageTargets`, avanzar `update` y conectar `BodoqueBossHooks` a `boss:phase`, `enemy:hit` y `enemy:killed` existentes, solo cuando corresponda integrar la pelea. No hay evento nuevo compartido.
- Seba: puede reemplazar `BodoqueFinale` por presentación/audio propios; usar `criticalTriggered`, `state` y `finalProgress` como señales. El núcleo no debe bloquear inputs durante ERROR 23.
- Vicho: reemplazar monitores y lluvia locales por los de El Set al integrar, conservando la transición de lluvia al llegar a cero. No se editaron mapa ni `GameScene`.
- Reinicio/cambio de escena: `SHUTDOWN` destruye el presentador y los tweens del jefe. Los efectos usan Graphics reutilizados y tiempo de update; no agregan temporizadores, listeners de input ni partículas independientes.

## Sello del Corazón Codex

La arena y el laboratorio cargan la misma hoja de 48 fotogramas, creada con el logo entregado por Alejandro. El sello negro y blanco ocupa el centro del cristal. A cero HP, las grietas atraviesan el sello y cada esquirla conserva parte de la imagen. En la arena el plano general entrega la fractura al primer plano de cine3 en el fotograma 14. El laboratorio reproduce las 48 poses. El hitbox sigue centrado en el corazón expuesto.

Lore consultado desde `origin/main:docs/LORE.md` porque el archivo no existe en esta rama local. El cierre mecánico/Corazón Codex y CANAL 23 siguen la especificación explícita de basti; se conserva el cierre de lluvia del lore.
