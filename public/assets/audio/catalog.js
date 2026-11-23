// Generado por src/audio/tools/build-catalog.mjs. No editar a mano.
window.MAFIADEV_AUDIO = [
  {
    "key": "music-boss",
    "category": "Música",
    "file": "music/music-boss",
    "note": "Combate épico: ostinato de cuerdas, metales con el leitmotiv, coro y percusión orquestal.",
    "trigger": "Empieza en bucle unos 1,7 s después de la primera fase del jefe; se detiene cuando el jefe cae."
  },
  {
    "key": "music-gameover",
    "category": "Música",
    "file": "music/music-gameover",
    "note": "Muerte estilo souls: gran impacto grave orquestal, coro oscuro y cuerdas que se apagan.",
    "trigger": "Suena unos 700 ms después del evento player:died."
  },
  {
    "key": "music-title",
    "category": "Música",
    "file": "music/music-title",
    "note": "Balada noir orquestal: trompeta solista, corno inglés, piano Steinway, contrabajos en pizzicato y cuerdas, con escobillas.",
    "trigger": "Suena en bucle en el título tras la primera interacción; también acompaña los créditos."
  },
  {
    "key": "music-zone1",
    "category": "Música",
    "file": "music/music-zone1",
    "note": "Exploración de la zona 1: fantasía misteriosa con arpa, flauta, oboe, trompas y cuerdas.",
    "trigger": "Suena en bucle al entrar o cambiar a zone1; también es la música de reserva para zonas desconocidas."
  },
  {
    "key": "music-zone2",
    "category": "Música",
    "file": "music/music-zone2",
    "note": "Catacumbas: tensión oscura con ostinato de cuerdas graves, clarinete bajo, trompas tapadas, coro y timbales.",
    "trigger": "Suena en bucle al entrar o cambiar a zone2, si el audio diferido ya está cargado."
  },
  {
    "key": "amb-zone1",
    "category": "Ambiente",
    "file": "amb/amb-zone1",
    "note": "Ambiente atmosférico de la primera zona, con lluvia y textura oscura.",
    "trigger": "Suena en bucle al entrar o cambiar a zone1; se atenúa en zonas sin ambiente y durante la muerte."
  },
  {
    "key": "amb-zone2",
    "category": "Ambiente",
    "file": "amb/amb-zone2",
    "note": "Ambiente profundo y cavernoso de la segunda zona.",
    "trigger": "Suena en bucle al entrar o cambiar a zone2; se atenúa al iniciar un combate de jefe o durante la muerte."
  },
  {
    "key": "sfx-ability-ready",
    "category": "Efectos",
    "file": "sfx/sfx-ability-ready",
    "note": "Campanilla breve que indica que una habilidad está lista.",
    "trigger": "Al recibirse el evento ability:ready."
  },
  {
    "key": "sfx-boss-roar",
    "category": "Efectos",
    "file": "sfx/sfx-boss-roar",
    "note": "Rugido grave y prolongado del jefe.",
    "trigger": "Suena 550 ms después de la primera fase del jefe (boss:phase con phase 1)."
  },
  {
    "key": "sfx-checkpoint",
    "category": "Efectos",
    "file": "sfx/sfx-checkpoint",
    "note": "Acorde cálido que confirma la activación de un checkpoint.",
    "trigger": "Al recibirse el evento checkpoint:reached."
  },
  {
    "key": "sfx-chest",
    "category": "Efectos",
    "file": "sfx/sfx-chest",
    "note": "Cofre de madera que cruje y termina con un destello musical.",
    "trigger": "Al recibirse el evento chest:opened, para cofres normales u ocultos."
  },
  {
    "key": "sfx-dash",
    "category": "Efectos",
    "file": "sfx/sfx-dash",
    "note": "Silbido corto de movimiento rápido.",
    "trigger": "Al recibirse el evento player:dash."
  },
  {
    "key": "sfx-death",
    "category": "Efectos",
    "file": "sfx/sfx-death",
    "note": "Impacto grave con caída tonal para la muerte del jugador.",
    "trigger": "Al recibirse el evento player:died."
  },
  {
    "key": "sfx-enemy-death",
    "category": "Efectos",
    "file": "sfx/sfx-enemy-death",
    "note": "Estallido áspero de partículas y golpe grave al desaparecer un enemigo.",
    "trigger": "Al recibirse enemy:killed para un enemigo que no sea jefe y esté dentro de cámara."
  },
  {
    "key": "sfx-fanfare",
    "category": "Efectos",
    "file": "sfx/sfx-fanfare",
    "note": "Fanfarria triunfal en re mayor: metales, timbales, cuerdas y coro.",
    "trigger": "Al recibirse enemy:killed para un tipo de enemigo que contiene boss en su nombre."
  },
  {
    "key": "sfx-hit-1",
    "category": "Efectos",
    "file": "sfx/sfx-hit-1",
    "note": "Variación 1 de impacto contundente sobre un enemigo.",
    "trigger": "Variante aleatoria de sfx-hit al recibirse enemy:hit dentro de cámara; también se usa como vista previa de efectos en Opciones."
  },
  {
    "key": "sfx-hit-2",
    "category": "Efectos",
    "file": "sfx/sfx-hit-2",
    "note": "Variación 2 de impacto contundente sobre un enemigo.",
    "trigger": "Variante aleatoria de sfx-hit al recibirse enemy:hit dentro de cámara; también se usa como vista previa de efectos en Opciones."
  },
  {
    "key": "sfx-hit-3",
    "category": "Efectos",
    "file": "sfx/sfx-hit-3",
    "note": "Variación 3 de impacto contundente sobre un enemigo.",
    "trigger": "Variante aleatoria de sfx-hit al recibirse enemy:hit dentro de cámara; también se usa como vista previa de efectos en Opciones."
  },
  {
    "key": "sfx-hurt",
    "category": "Efectos",
    "file": "sfx/sfx-hurt",
    "note": "Golpe áspero que representa daño recibido por el jugador.",
    "trigger": "Al recibirse player:hit; se acompaña de un pulso repetido si queda 1 punto de vida."
  },
  {
    "key": "sfx-jump",
    "category": "Efectos",
    "file": "sfx/sfx-jump",
    "note": "Soplido ligero de salto; el doble salto suena más agudo.",
    "trigger": "Al recibirse player:jump, con un cambio de tono cuando air es true."
  },
  {
    "key": "sfx-land",
    "category": "Efectos",
    "file": "sfx/sfx-land",
    "note": "Golpe suave de botas al tocar el suelo.",
    "trigger": "Al recibirse player:land."
  },
  {
    "key": "sfx-low-hp",
    "category": "Efectos",
    "file": "sfx/sfx-low-hp",
    "note": "Latido grave que advierte que queda muy poca vida.",
    "trigger": "Cuando player:hit deja 1 punto de vida; se repite cada 900 ms hasta sanar o morir."
  },
  {
    "key": "sfx-parry",
    "category": "Efectos",
    "file": "sfx/sfx-parry",
    "note": "Campanazo metálico brillante para un parry acertado.",
    "trigger": "Al recibirse player:parry con success true; la música baja brevemente."
  },
  {
    "key": "sfx-pickup",
    "category": "Efectos",
    "file": "sfx/sfx-pickup",
    "note": "Campanilla cristalina al recoger un objeto, afinada según su rareza.",
    "trigger": "Al recibirse item:picked; también suena como vista previa del volumen general en Opciones."
  },
  {
    "key": "sfx-swing-1",
    "category": "Efectos",
    "file": "sfx/sfx-swing-1",
    "note": "Variación 1 del silbido de ataque cuerpo a cuerpo.",
    "trigger": "Al recibirse player:attack con combo 1; también en un parry fallido."
  },
  {
    "key": "sfx-swing-2",
    "category": "Efectos",
    "file": "sfx/sfx-swing-2",
    "note": "Variación 2 del silbido de ataque cuerpo a cuerpo.",
    "trigger": "Al recibirse player:attack con combo 2."
  },
  {
    "key": "sfx-swing-3",
    "category": "Efectos",
    "file": "sfx/sfx-swing-3",
    "note": "Variación 3, más marcada, del silbido de ataque cuerpo a cuerpo.",
    "trigger": "Al recibirse player:attack con combo 3."
  },
  {
    "key": "sfx-timestop",
    "category": "Efectos",
    "file": "sfx/sfx-timestop",
    "note": "Tic-tacs de reloj que se ralentizan y se detienen.",
    "trigger": "Al usarse una habilidad cuyo id identifica parar el tiempo."
  },
  {
    "key": "sfx-title-sting",
    "category": "Efectos",
    "file": "sfx/sfx-title-sting",
    "note": "Golpe orquestal noir (tutti + timbal) y motivo de trompeta solista.",
    "trigger": "Al pulsar la primera tecla o hacer clic en el título durante la intro."
  },
  {
    "key": "sfx-tutorial-ok",
    "category": "Efectos",
    "file": "sfx/sfx-tutorial-ok",
    "note": "Dos notas breves y positivas para confirmar un paso del tutorial.",
    "trigger": "Al completar cada paso del tutorial contextual."
  },
  {
    "key": "sfx-ui-back",
    "category": "Interfaz",
    "file": "sfx/sfx-ui-back",
    "note": "Clic suave de retroceso de máquina de escribir.",
    "trigger": "Al volver o cerrar un menú, diálogo o tutorial con la acción de retroceso."
  },
  {
    "key": "sfx-ui-move",
    "category": "Interfaz",
    "file": "sfx/sfx-ui-move",
    "note": "Clic corto de tecla de máquina de escribir.",
    "trigger": "Al mover la selección en menús, ajustar el escenario en el título o animar el texto de un diálogo."
  },
  {
    "key": "sfx-ui-select",
    "category": "Interfaz",
    "file": "sfx/sfx-ui-select",
    "note": "Campanilla de retorno de carro con un golpe de tecla.",
    "trigger": "Al confirmar una opción de menú o una respuesta de diálogo."
  },
  {
    "key": "vo-gameover",
    "category": "Voces",
    "file": "vo/vo-gameover",
    "note": "Voz narrada para la pantalla de derrota.",
    "trigger": "sin uso actual; está declarado en el manifiesto, pero no hay ninguna llamada que lo reproduzca."
  },
  {
    "key": "vo-title",
    "category": "Voces",
    "file": "vo/vo-title",
    "note": "Voz del narrador que presenta el título.",
    "trigger": "Se reproduce 350 ms después de pulsar una tecla o hacer clic para entrar al menú del título."
  }
];
