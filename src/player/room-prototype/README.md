# Laboratorio Isaac + Hades

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
| Click izquierdo | Tajo frontal animado (solo con espada) |
| R | Reiniciar sala |

Caminar: **150 px/s**; correr: **247,5 px/s**, un 25 % más que antes. Aceleración 2400 px/s² (unos 63 ms hasta caminar), frenada y giro rápido a 3000 px/s². Las velocidades diagonales se normalizan. No se cambian valores del jugador lateral.

Dash: **150 ms a 540 px/s**, con **650 ms de recuperación después del deslizamiento** (800 ms entre inicios). La segunda pulsación de la misma tecla WASD debe llegar dentro de 350 ms y exige haber soltado la tecla. Autorepetición y teclas diferentes no forman un par. Un intento durante recuperación se descarta, sin cargas ni activación retrasada. El doble tap selecciona su eje aunque otra dirección esté pulsada; C/K conserva el dash de ocho direcciones usando el movimiento o última orientación. La dirección se fija durante el dash y no deja velocidad de dash residual al terminar.

La estela utiliza un pool acotado de siluetas, cada 24 ms y con desvanecimiento de 160 ms. Sus posiciones proceden del cuerpo después de las colisiones; no dibuja trayectorias a través de obstáculos. El prototipo no concede invulnerabilidad automáticamente: el futuro combate deberá definirla.

La sombra marca el punto de suelo. Solo el dibujo se eleva al saltar; el collider sigue en X/Y y no atraviesa obstáculos ni durante dash. La altura visual se integra por separado, permite salto variable y buffer de salto cerca del aterrizaje. La cámara no sigue ni gira. El orden de dibujo usa la Y de los pies, no la altura del salto.

## Aislamiento

Todos los módulos están en esta carpeta; consumen Input, CharacterStats y DashMotion existentes. Los nuevos parámetros se añaden a `src/data/tuning.json` bajo `roomPrototype`, sin cambiar los valores que usa el juego lateral. La instancia propia de Phaser tiene gravedad del plano cero, sin modificar la física global del juego. Los controles se separan localmente. No se emiten eventos globales ni se carga GameState, audio, objetos, progreso, enemigos o mapas de producción. `RoomMotion.state`, `dash.active`, la dirección fija y el evento local `dashed` preparan la futura coordinación con combate, sin cambiar contratos compartidos.

Las huellas de obstáculos y bordes son geometría temporal de evaluación, no un nuevo sistema de mapas. La puerta dibujada es decorativa. No hay plataformas elevadas transitables, caídas ni salto por encima de paredes; no hay enemigos ni aplicación de daño. La espada del suelo, la espada equipada y el arco de tajo son placeholders visuales locales.

## Verificación y build

```sh
npm run typecheck
npm test
npm run test:e2e
npm run build
npx vite build src/player/room-prototype --outDir ../../../dist/room-prototype --base ./ --emptyOutDir
```

El build normal conserva la entrada original. El último comando añade el prototipo a `dist/room-prototype/` sin modificar configuración compartida. Ejecutar `npm run preview` y abrir `/room-prototype/` para probar ese paquete. No abrir el HTML directamente desde el explorador de archivos.

Pruebas propias: `tests/unit/player-room-motion.test.ts`, `tests/unit/player-double-tap.test.ts` y `tests/e2e/player-room-prototype.spec.ts`. Capturas en `test-results/room-prototype.png` y `test-results/room-prototype-dash.png` (ignoradas por Git).

El análisis de siguientes pasos está en [COMBAT-NOTES.md](COMBAT-NOTES.md). No hay ataques, bloqueo ni parry implementados todavía.
