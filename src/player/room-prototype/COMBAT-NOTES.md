# Integración futura de combate (propuesta, sin implementación)

## Fronteras actuales

El jugador lateral y el prototipo siguen separados. La posición de contacto está en `RoomPlayer.anchor` y su cuerpo Arcade; la altura visual está en `RoomMotion.height`. El render ordena por la Y de los pies. Ataques y detección deben usar el plano, independientemente de cómo se dibuje el arma o el personaje.

El modelo local expone `state` (idle/move/dash), `dash.active`, recuperación, `facing` normalizado y el evento devuelto `dashed`. El dash fija su dirección durante 150 ms y conserva colisiones. No concede invulnerabilidad por ahora. No existe una decisión implícita sobre si saltar evita ataques.

## Secuencia propuesta

1. **Ataque básico multidireccional.** Añadir un controlador puro de combate dentro del dominio de Basti, separado del movimiento y del render. Capturar dirección de `facing` al iniciar; representar alcance y apertura como sector/cápsula sobre X/Y. Fases de anticipación, impacto y recuperación en datos. Cada ejecución identifica a las víctimas ya golpeadas para evitar daño cada frame. Probar primero con dianas locales, sin editar enemigos de compañeros.
2. **Combos.** Tres pasos con tiempos y daño propios. Una entrada almacenada solo continúa en la ventana permitida (el tuning existente propone 250 ms); al vencer vuelve al paso inicial. Fijar qué fases permiten girar, moverse o cancelar con dash. La tercera pulsación no debe crear una cola ilimitada. Probar límites temporales e interrupciones.
3. **Bloqueo.** Estado mantenido y orientado. Resolver con el producto escalar entre la dirección frontal y la dirección del golpe: por detrás no protege. Definir mitigación, coste y qué ataques son imbloqueables antes de conectarlo. Stamina/guardia no están contratadas hoy; no añadir esos campos a CharacterStats o progreso sin coordinación.
4. **Parry.** Primera ventana tras levantar la guardia, usando como punto inicial los 150 ms ya definidos. Validar que el golpe sea frontal y parryable. Un éxito consume/desactiva ese impacto, interrumpe al atacante según su contrato y emite el evento existente `player:parry {success}`. No repetir el éxito por todos los frames de una misma hitbox.
5. **Contraataque.** Tras parry exitoso abrir una oportunidad breve y de un solo uso. El siguiente ataque consume la oportunidad y usa una definición de ataque propia. Si vence el tiempo, no se ataca o se recibe daño, se cierra. No convertir todo golpe después de un bloqueo en un parry o contraataque automático.

## Arbitraje con movilidad

Un controlador debe arbitrar acciones antes de mover o abrir hitboxes: muerte/daño interrumpen según reglas explícitas; dash, ataque y guardia no se superponen libremente. Propuesta inicial: ataques bloquean nuevos dashes durante impacto y permiten cancelación solo en recuperación; durante dash no se inicia ataque. Un input de ataque rechazado no debe ejecutarse inesperadamente al acabar cooldown. El movimiento conserva su modelo de aceleración, con modificadores temporales de velocidad aprobados por estado.

La actualización sería: leer acciones -> resolver prioridades/estado -> calcular movimiento -> física y colisiones -> resolver contactos de combate -> sincronizar visuales. Al pausar o reiniciar se detienen temporizadores, se eliminan hitboxes y se limpia input almacenado. El render no decide daño.

## Coordinación necesaria antes de integrar

- Con el dueño de enemigos: interfaz para recibir daño, identificar víctimas, reaccionar a parry/stagger y señalar ataques parryables. No modificar sus sistemas desde el prototipo.
- Con Alejandro: estadísticas de daño, equipo y posibles recursos de guardia. El prototipo consume stats; no los duplica ni implementa progresión.
- Con Vicho: cualquier integración en GameScene, mapas o superficies con altura. La prueba actual no decide el formato de los mapas.
- Con Seba: animaciones/audio/HUD y presentación del bloqueo/contraataque. Se pueden reutilizar `player:attack {combo}`, `player:parry {success}`, `player:hit`, `enemy:hit` y `enemy:killed` para sus significados actuales. Si hacen falta eventos diferenciados como `player:blocked` o `player:counter`, deben aprobarse como cambios shared antes de añadirlos; no reutilizar eventos con otra semántica.
- Con el equipo: elegir apuntado por movimiento o independiente con ratón/mando, invulnerabilidad del dash, interacción entre altura y golpes, y reglas de cancelación. Ninguna de esas decisiones se implementa en esta tarea.

## Pruebas que deben acompañar cada paso

Ataque: alcance, frente/espalda, una víctima recibe un impacto por ejecución, cambio de dirección y obstáculo. Combo: buffer válido, vencimiento y corte por daño. Defensa: bloqueo frontal y golpe por detrás. Parry: bordes de ventana y una sola resolución por golpe. Contraataque: consumo único, expiración e interrupción. Integración: dash/ataque excluyentes, pausa, reinicio y ausencia de cambios en el juego lateral.
