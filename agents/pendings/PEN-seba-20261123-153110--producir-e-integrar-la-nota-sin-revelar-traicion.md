---
id: PEN-seba-20261123-153110
type: pending
owner: seba         # quien debe resolverlo (dueño del dominio)
created_by: basti
agent: gpt
created: 2026-11-23T18:31:10.940Z
title: producir e integrar La Nota sin revelar traicion
priority: p1   # p0 rompe demo/main | p1 MUST incompleto | p2 pulido
status: done
area: ui
refs: [HIS-basti-20261123-153110, SUP-basti-20261123-153110, PEN-vicho-20261123-153111]
closed_by: 9bad40e
---

## Contexto
Encargo de basti: mejorar La Nota y entregar guion técnico, animación por planos y prompts. Se completó el paquete de preproducción; la realización audiovisual e integración pertenecen a seba.
Guion: agents/history/materiales/HIS-basti-20261123-153110/LA-NOTA-guion-tecnico.md. Incluye 14 planos, 75 s, 16 cues, prompts y criterios. SRT y CSV adjuntos en el mismo directorio.

## Repro / evidencia
origin/main (3c75dfa) contiene cine1.webm de 10,008 s y docs/LORE.md §8. Ambos revelan N.º 7 · NO VUELVE, contrario al nuevo encargo. Se examinaron nueve fotogramas. La rama original de combate no contiene esos archivos; no confundir los estados.

## Criterio de cierre
- [ ] Producir clips por plano, voces, mezcla, rotulación y subtítulos legibles; comprobar lectura con audio silenciado.
- [ ] Eliminar texto revelador y mantener la confianza/decisión de Ríos y el encargo explícito.
- [ ] Coordinar P14 con PEN-vicho-20261123-153111 y la correspondencia visual de Ríos con alejandro; mostrar objetivo al terminar, saltar o fallar el video.
- [ ] Validar entrada única a juego, mapa real, ausencia de daño antes de control y salida con ESC/ENTER.
- [ ] Build, unit y e2e apropiados en verde; registrar evidencia y cierre.

## Notas
No hay video nuevo generado ni promesa de nuevas mecánicas de pruebas/inventario/retorno. Todo texto se añade en montaje o interfaz. No editar shared sin el aviso humano requerido.

## Resultado técnico
Realizado en 9bad40e. Reproductor y HUD usan la cámara y el sprite efectivos del mapa. Se probaron los tres mapas, salida natural, salto, error y movimiento tras aterrizar. La identidad de los planos dibujados procede del clip original. No se ha registrado una aprobación artística personal de alejandro o vicho.
