---
id: HIS-basti-20261123-142617
type: history
owner: basti
agent: gpt
created: 2026-11-23T17:26:17.139Z
title: CI intervalo exacto de doble toque
status: pass
commit: d0b53bfd03ad9ee1258270053dcf3cab151178b5
refs: [HIS-basti-20261123-141815, PEN-basti-20261123-122352]
---

## Objetivo
Completar la publicación de enemigos de PR #9 corrigiendo la prueba del intervalo de doble pulsación que falló bajo carga del CI.

## Cambios
- `tests/e2e/player-room-prototype.spec.ts`: el caso de 300 ms envía eventos DOM separados por frames con timestamps controlados. Se comprueban exactamente dos keydowns separados por 300 ms, dash activo y velocidad (540, 0) mientras está pulsada la dirección opuesta.
- La espera de 300 ms del runner añadía viajes IPC y podía superar la ventana real de 350 ms. Los demás casos de doble pulsación mantienen el teclado nativo. No se cambian controles, tiempos de gameplay, balance, configuración shared ni número de pruebas.

## Comandos y resultados
```text
gh run view 45226882692 --repo sebvitaa/MafiaDev --log-failed
  -> build/unit PASS; 27 e2e PASS, 1 FAIL en la prueba de 300 ms.
  -> Enemigos, TP, combo y fuego PASS.
node node_modules/typescript/bin/tsc --noEmit
  -> PASS
node node_modules/playwright/cli.js test --config C:/Users/cosas/Documents/Codex/2026-11-23/nefc/work/enemies-playwright.config.ts --grep "el doble toque tolera" --workers=2
  -> 1 passed (3.9s), dos eventos separados por frames.
  -> El primer borrador enviaba todos los eventos en un frame y falló la aserción de gap; se corrigió antes del commit.
git diff --check -> PASS
git commit -m "test(player): controlar timestamps del doble toque en CI"
  -> d0b53bfd03ad9ee1258270053dcf3cab151178b5
```

## Tests
| test | resultado | nota |
|---|---|---|
| TypeScript | pass | Sin errores de tipos |
| Doble toque 300 ms | pass | Dos eventos DOM, gap exacto, dash activo y dirección a la derecha |

## Observaciones
El fallo de CI se corrigió en esta tarea; no se omiten tests ni se debilita la ventana temporal. El siguiente ship repetirá build, 94 unit y los 28 e2e, esta vez con dos workers locales como el CI. El adaptador Windows y puerto 8083 siguen fuera del repositorio.

## Siguiente paso
Actualizar PR #9 por el flujo oficial ship --e2e, esperar CI y confirmar merge antes de cerrar la publicación.
