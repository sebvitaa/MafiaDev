# Integración final — candidata a revisión del equipo

Base inicial: origin/main 3c75dfa6e8 (PR #11 ya fusionado); main avanzó a 0f68477 con el cierre de Alejandro (#12). Worktree MafiaDev-integracion, rama basti/integracion-definitiva. La rama original de Basti y sus archivos locales no se modifican. No se vuelve a fusionar #11.

## Fuentes y resolución de incompatibilidades

- Vicente: los tres JSON de mapas, biomas, obstáculos, exploración, cofres, checkpoints, minimapa, mapa grande, viaje rápido, cámara y entrada de El Set se conservan desde main. La arena instala BodoqueBoss en vez del knight provisional.
- Basti: se fusiona feature/basti-movement-combat preservando sus commits. En cada conflicto se mantienen la salud, navegación, balance y apuntado al cursor de main, junto a Eco/Deuda/Lluvia y Corazón Codex de la rama.
- Alejandro: se fusiona además alejandro/final-jugable e707b00 (PR #12): tres poses de Bodoque, sello animado Codex, cine3 completo y continuidad musical desde cine2. main ya contiene sus cuatro marcas TP y las cinemáticas publicadas en su rama de integración. Comparar su tip revela versiones anteriores de Teleport sin colisión de tiles, del HUD y de controles: no se sustituyen las correcciones nuevas de main. Se completa el registro de habilidades de clase (I), sin una segunda instalación de Teleport.
- Seba: La apertura de BootScene/PreloadScene/logo.ts y los assets publicados se conservan. Se retiran consejos de parry/bloqueo inexistentes y se conectan los recursos nuevos en PreloadScene/CinematicScene. TitleScene mantiene su animación y añade selector de clase. El HUD usa los estados reales y hay un solo enrutador de victoria.
- Shared: se conserva CinematicScene para el cierre y se repara la lectura CRLF del índice de agentes. Autorización de preparación transversal en el pedido de Basti; validación del equipo pendiente en SUP-basti-20261123-150950 antes de fusionar a main.

## Controles

WASD/flechas mover; Shift correr; C/K o doble dirección dash; Espacio/Z salto/doble salto; clic izquierdo combo/carga orientados al mouse.
R mantener para apuntar Lluvia Italiana, soltar para lanzar. 100 daño base por enemigo una sola vez, bonus por marcas consumidas y cooldown 20000 ms. E queda para interacción.
Q + derecho lanza papel TP; Q + izquierdo o 1–4 teletransportan. I usa habilidad de clase. M/N mapa; F viaje rápido; 0 silencio; Esc/P pausa. En el laboratorio: T reinicia, B activa al jefe opcional.

## Combate y jefe

El Eco selecciona desde su propia posición un objetivo previo válido o el más cercano, con alcance/visibilidad; conserva 35% de daño, una repetición y los efectos violetas. Espada y Eco consideran también muros Tiled; los enemigos reales admiten deuda y explosiones.

La Nota conserva mazo, flash y embestida. La Apuesta añade carriles de caballos espectrales, boletos anunciados e invocación acotada de Cobradores. Sin Señal añade robo de tiempo, traspasar por monitores y cable que puede saltarse. Datos de windup/ventana/recuperación/daño en enemies.json; el balance nuevo es provisional.

A 100 HP: clamp de overkill, apertura invulnerable de 1200 ms, sin segunda vida. Solo heartTarget queda vulnerable y usa las mismas coordenadas del núcleo dibujado. A 23 HP: ERROR 23/«¡Queda una pura...!»/APUESTA una vez, manteniendo combate activo. A 0 HP: ruptura completa antes del único enemy:killed kind boss. El enrutador pasa por cine3 con epílogo, Tulio y FIN y créditos originales.

## Recursos provisionales

El sello local de Alejandro sustituye CODEX/TEMP y se anima con su spritesheet de 48 frames. El video cine3 incluye el desenlace y Tulio: se reutiliza sin reconstruirlo. La condición de asset oficial/aprobación del logo queda para el equipo (PEN-basti-20261123-144553).

## Rendimiento y aparición

Se integran las optimizaciones publicadas en alejandro/publicar-optimizaciones: grupos Arcade, simulación de enemigos cercanos, snapshots y navegación reutilizada, mapa overview y niebla compactada. La aparición se valida contra límites, tiles y props; la cámara se centra después de colocar al personaje y FINAL empieza equipado. Los efectos finales redibujan a 30Hz manteniendo lógica/daño a cada frame.

## Verificación y límites de la evidencia

Los comandos obligatorios son npm ci, npm run typecheck, npm test, npm run build y npm run test:e2e.
Playwright usa el puerto aislado 5184 para no probar por accidente el servidor de otra rama. No hay tests omitidos: las tres pruebas laterales obsoletas se adaptaron al jugador cenital real.
La prueba integration-journey abre sin skipIntro, observa apertura completa y ambos videos sin saltarlos, entra en la arena por el sistema real de zonas y termina cine3 completo/créditos/regreso al menú. Usa fixtures de posición y daño para comprobar la orquestación de fases de forma determinista; no se presenta como una victoria manual sin ayudas.
Los mapas tienen pruebas separadas de conectividad, exploración y secretos en las tres variantes. Alcance, impactos únicos, fases y umbrales tienen pruebas unitarias. Las habilidades y colisiones se comprueban con sus E2E.
Capturas: test-results/integration-opening.png, integration-title.png, integration-boss.png, integration-error23.png, integration-tulio.png.

## Publicación

Preparar PR hacia main, pedir revisión a los dueños de mapa, personaje y presentación y esperar los checks/protecciones. No activar auto-merge antes de las validaciones transversales. GitHub Pages oficial: https://sebvitaa.github.io/MafiaDev/; hasta que se fusione y despliegue el PR esa URL sigue sirviendo main anterior.
