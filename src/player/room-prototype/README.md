# Laboratorio Isaac + Hades

## Enemigos y TP integrados

Abrir `/src/player/room-prototype/?enemies=1` para combatir contra slime (50 HP), Cobrador ágil (100) y knight resistente (150). El Luchador tiene 125 HP y espada 25/30/40. Tras recibir daño obtiene 600 ms de protección. R restaura vida/enemigos/marcas. La entrada sin el parámetro conserva el muñeco y la práctica de movimiento.

Mantener Q + derecho lanza marcas, Q + izquierdo hace TP bajo el cursor y 1–4 hacen TP directo. Los clics destinados a TP no inician ni liberan una carga de espada. Hay cuatro marcas reutilizables y 500 ms de recarga compartida. Los enemigos aceptan marcas, conservan colisiones y pierden sus marcas al morir. Ver `src/enemies/README.md` para configuración y contratos.

Prototipo independiente de movilidad de Basti. Una sala rectangular, cámara superior fija y profundidad visual 3/4 en Phaser 4 + TypeScript. No sustituye la entrada principal ni el Player lateral.

## Ejecutar

Desde la raíz:

```sh
npm ci
npm run dev
```

Abrir http://localhost:8080/src/player/room-prototype/. El juego lateral continúa en http://localhost:8080/.

| Control | Acción |
| --- | --- |
| WASD o flechas | Movimiento en 8 direcciones, normalizado |
| Mantener Shift | Correr |
| Doble pulsación de W/A/S/D o una flecha | Dash hacia la tecla seleccionada (soltar entre pulsaciones) |
| C o K | Dash hacia el movimiento o la última orientación |
| Espacio o Z | Salto y un salto adicional en el aire |
| Pasar sobre la espada flotante al lado derecho | Recogerla y equiparla visiblemente |
| Click izquierdo corto | Combo de espada de hasta tres golpes (solo con espada) |
| Mantener click izquierdo | Carga desde 350 ms; soltar para cortar (máximo a 1,2 s) |
| Mantener clic derecho y mover el mouse | Apuntar la lluvia italiana con área violeta |
| Soltar clic derecho | Lanzar 7–10 completos (caída final a 600 ms; radio 55; daño total 2×; cooldown 7 s) |
| Ataque de espada antes de 800 ms tras un dash | Eco morado que repite una vez el golpe con 120 ms de retraso y 35 % de daño |
| R | Reiniciar sala |

Caminar: **150 px/s**; correr: **247,5 px/s**, un 25 % más que antes. Aceleración 2400 px/s² (unos 63 ms hasta caminar), frenada y giro rápido a 3000 px/s². Las velocidades diagonales se normalizan. No se cambian valores del jugador lateral.

Dash: **150 ms a 540 px/s**, con **650 ms de recuperación después del deslizamiento** (800 ms entre inicios). La segunda pulsación de la misma tecla WASD debe llegar dentro de 350 ms y exige haber soltado la tecla. Autorepetición y teclas diferentes no forman un par. Un intento durante recuperación se descarta, sin cargas ni activación retrasada. El doble tap selecciona su eje aunque otra dirección esté pulsada; C/K conserva el dash de ocho direcciones usando el movimiento o última orientación. La dirección se fija durante el dash y no deja velocidad de dash residual al terminar.

La estela utiliza un pool acotado de siluetas, cada 24 ms y con desvanecimiento de 160 ms. Sus posiciones proceden del cuerpo después de las colisiones; no dibuja trayectorias a través de obstáculos. El prototipo no concede invulnerabilidad automáticamente: el futuro combate deberá definirla.

La sombra marca el punto de suelo. Solo el dibujo se eleva al saltar; el collider sigue en X/Y y no atraviesa obstáculos ni durante dash. La altura visual se integra por separado, permite salto variable y buffer de salto cerca del aterrizaje. La cámara no sigue ni gira. El orden de dibujo usa la Y de los pies, no la altura del salto.

## Espada y combate de prueba

Recoge la espada del lado derecho y acércate al muñeco, ubicado delante de ella. Orienta al jugador con movimiento y pulsa click izquierdo hasta tres veces: corte rápido (25 de daño), corte amplio (30) y remate (40 más retroceso). Cada golpe tiene animación, alcance, ángulo y ventana de impacto propios. El siguiente golpe acepta buffer en los últimos 150 ms del actual o durante 500 ms al terminar; si esperas más, el combo reinicia. Mantén el click más de 350 ms para cargar y suéltalo para un corte cargado; el daño y alcance crecen hasta 200 % y 150 % a los 1,2 s. Un brillo creciente muestra la carga. Dash cancela la carga; durante ataques normales permite cancelar desde los 90 ms. Cada swing registra IDs ya impactados para que un objetivo solo reciba un hit aunque permanezca dentro del área varios frames. El muñeco muestra vida, reacción, daño y derrota, y vuelve con vida completa después de dos segundos.

Los valores del combo, carga, daño y recuperación del muñeco se configuran en `src/data/tuning.json` bajo `roomPrototype`.

La habilidad local **Lluvia Italiana** conserva el área y las reglas de bola de fuego: el clic derecho muestra una mira rúnica morada con acentos verde, blanco y rojo; al soltar, completos dibujados con pan, vienesa, palta, tomate y mayo caen en oleadas desde alturas y ángulos variables. Cada uno deja una salpicadura visual, pero el área aplica un único daño total de 2× al final de los 600 ms. Las migas y runas decorativas desaparecen en 2,8 s y no causan daño. El HUD conserva el cooldown de 7 segundos.

El **Eco del Reverso** aparece en el inicio del dash por 800 ms. El siguiente golpe de espada iniciado durante esa ventana se repite una vez tras 120 ms con el mismo tipo, dirección y geometría del hitbox, pero con 35 % de daño. Las **marcas de deuda** se muestran sobre el muñeco: cada impacto de espada añade una hasta tres; cada una dura 4 s. La siguiente bola de fuego que alcance al objetivo las consume y suma 10 de daño por marca, con una detonación morada visual. Las mecánicas usan adaptadores locales (`addDebtMark`, `consumeDebtMarks`, `onDebtDetonated`) y no alteran contratos compartidos.

`SwordDamageTarget` en `SwordCombat.ts` es la interfaz local para conectar enemigos futuros: ID, posición del plano X/Y, radio y método `takeSwordDamage`, con `addDebtMark` opcional. `FireballDamageTarget` ofrece `consumeDebtMarks` y `onDebtDetonated` opcionales. Un enemigo puede adaptar estas interfaces sin cambiar contratos/eventos compartidos. El muñeco es exclusivo del prototipo; el resto del juego no participa.

## Aislamiento

Todos los módulos están en esta carpeta; consumen Input, CharacterStats y DashMotion existentes. Los nuevos parámetros se añaden a `src/data/tuning.json` bajo `roomPrototype`, sin cambiar los valores que usa el juego lateral. La instancia propia de Phaser tiene gravedad del plano cero, sin modificar la física global del juego. Los controles se separan localmente. No se emiten eventos globales ni se carga GameState, audio, objetos, progreso, enemigos o mapas de producción. `RoomMotion.state`, `dash.active`, la dirección fija y el evento local `dashed` preparan la futura coordinación con combate, sin cambiar contratos compartidos.

Las huellas de obstáculos y bordes son geometría temporal de evaluación, no un nuevo sistema de mapas. La puerta dibujada es decorativa. No hay plataformas elevadas transitables, caídas ni salto por encima de paredes; el muñeco no es una IA ni se conecta a enemigos del juego. La espada del suelo, el arma equipada y el arco de tajo son placeholders visuales locales.

## Verificación y build

```sh
npm run typecheck
npm test
npm run test:e2e
npm run build
npx vite build src/player/room-prototype --outDir ../../../dist/room-prototype --base ./ --emptyOutDir
```

El build normal conserva la entrada original. El último comando añade el prototipo a `dist/room-prototype/` sin modificar configuración compartida. Ejecutar `npm run preview` y abrir `/room-prototype/` para probar ese paquete. No abrir el HTML directamente desde el explorador de archivos.

Pruebas propias: `tests/unit/player-room-motion.test.ts`, `tests/unit/player-double-tap.test.ts`, `tests/unit/sword-combat.test.ts` y `tests/e2e/player-room-prototype.spec.ts`. Capturas en `test-results/room-prototype.png` y `test-results/room-prototype-dash.png` (ignoradas por Git).

El análisis de combos, bloqueo y parry futuros está en [COMBAT-NOTES.md](COMBAT-NOTES.md). El combo y el corte cargado dañan solamente objetivos conectados a la interfaz local.

Pulsa **B** para activar el jefe de prueba Juan Carlos Bodoque sin reemplazar el muñeco. Fase 1: «La Nota», con micrófono-mazo (parryable), flash de cámara y embestida «Última hora». El laboratorio todavía no implementa bloqueo/parry; las zonas anunciadas se esquivan con movimiento y dash.
