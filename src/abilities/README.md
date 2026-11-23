# Red de marcas del Luchador

- Mantener **Q + clic derecho**: lanzar un papel hacia el punto del mouse.
- Mantener **Q + clic izquierdo**: TP a la marca aterrizada más cercana al mouse (radio de selección configurable).
- **1 / 2 / 3 / 4**: TP directo al papel con ese número, sin mantener Q. Comparte la recarga de 500 ms con el mouse.
- **Clic izquierdo sin Q**: el controlador de combate puede atacar normalmente.
- Q sola solo permite apuntar; no activa el TP. Los papeles en vuelo no son destinos válidos.
- Hasta cuatro papeles entre volando y aterrizados. La quinta marca reemplaza a la más antigua.
- Los primeros cuatro papeles reciben 1, 2, 3, 4 en orden de lanzamiento. Conservan su número; la quinta marca reutiliza el número de la más antigua. Si desaparece un enemigo con marca, el siguiente papel ocupa el menor número libre. Los demás papeles conservan su tecla (SUP-alejandro-20261123-123733).
- TP reutilizable con 500 ms de espera entre usos correctos. Un destino inválido no consume recarga.
- Papeles chocan con sólidos estáticos. TP comprueba el destino, permite saltar obstáculos intermedios y busca un hueco libre cerca de la marca.
- Reiniciar/cambiar escena limpia marcas, proyectiles y listeners. Las marcas no se guardan entre niveles.

Los valores están en `src/data/abilities.json`. Las reglas de reemplazo, reutilización y búsqueda de llegada son reversibles: SUP-alejandro-20261123-121806.

## Integración

`createAbilitySlots(scene, ['teleport'])` instala los controles y la indicación de marcas/recarga.
El controlador debe llamar `abilities.update(dtMs)` una vez por frame.
La escena debe exponer `player`, bien como sprite con cuerpo Arcade, bien con `{ anchor, sync() }` (laboratorio).
El ataque del controlador debe comprobar que Q esté suelta antes de procesar el clic izquierdo.
Los intentos de TP siguen pasando por `AbilitySlots.tryActivate`, que emite `ability:used` y `ability:ready`.

Para permitir que un enemigo/jefe reciba un papel:

```ts
import { registerTeleportTarget } from '../abilities';

// Después de crear su cuerpo Arcade dinámico:
const unregister = registerTeleportTarget(enemy);
// Al retirarlo como objetivo, si todavía existe:
unregister();
```

La marca guarda su punto de impacto respecto del cuerpo y sigue su posición. El TP llega a un lado del enemigo sin superponer los cuerpos. Desactivar/destruir el cuerpo elimina la marca; llamar a `unregister` también la retira.

El laboratorio de Basti todavía no incorpora enemigos reales. Los casos e2e crean un objetivo móvil temporal para verificar adhesión, seguimiento, llegada y limpieza; no añaden un enemigo a la demo.

`tests/e2e/abilities-game.spec.ts` verifica el módulo sobre el Luchador y GameScene reales de main, sin depender del laboratorio. Los cuatro escenarios de `abilities-marks.spec.ts` se ejecutan cuando existe la entrada del laboratorio; en ramas donde aún no está integrado se omiten con un motivo explícito. Esos cuatro escenarios ya pasaron en la rama local de integración.

La rama `integration/teleport-room-local` contiene la conexión local de `RoomPlayer`. Para publicar la parte de Basti debe adoptar esa conexión en su dominio (PEN-basti-20261123-122352). No publicar la rama mixta con `ship --owner alejandro`.
