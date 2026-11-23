# «La Nota» · Guion técnico y paquete de producción

Propuesta del 23 de noviembre de 2026. Duración: **75 s a 24 fps, 1800 fotogramas, 14 planos**. Español. Esta entrega contiene guion y preproducción; no incluye una animación nueva ni sustituye `cine1.webm`.

## Revisión y contradicciones

Referencia consultada: `origin/main` local, commit `3c75dfa6e8ef85b29104374c77d7050aa4a67789`; no se ha verificado si el remoto tiene cambios posteriores. Se leyeron `docs/LORE.md`, `src/ui/scenes/CinematicScene.ts`, `src/scenes/TitleScene.ts`, `src/scenes/GameScene.ts` y `src/world/index.ts`. Se extrajeron y examinaron nueve fotogramas del video existente `public/assets/ui/cinematics/cine1/cine1.webm`: 10,008 s, 960×540. También se examinó `rios.png`.

En la rama original `feature/basti-movement-combat` faltan el lore y la cinemática; su título inicia directamente GameScene y su mundo lateral es provisional. En la referencia `origin/main` sí existen ambos y el mundo es cenital. Esta propuesta usa las referencias audiovisuales existentes y el encargo del usuario; distingue esos dos estados del proyecto.

| Hallazgo | Contradicción o riesgo | Resolución propuesta |
|---|---|---|
| El guion anterior y el video muestran «N.º 7 · NO VUELVE». | Revelan el número de enviado y la intención de Bodoque. | Suprimir por completo ese inserto. El boleto nuevo queda doblado, sin texto legible. |
| «Una nota más, Ríos. La última» y «tráeme la verdad». | No explican la investigación ni la aspiración de Ríos; «la última» delata demasiado. | Ríos pide una oportunidad y Bodoque concreta investigar el cobro, conseguir pruebas y volver al noticiero. |
| Apertura anterior de 10 s. | La relación y la decisión carecen de desarrollo. | Nueva apertura de 75 s; la cinemática final queda fuera del cambio. |
| La ficha entrega crédito y vigilancia según el lore. | Mostrarla como regalo inocuo o demostrar poderes alteraría su función. | «Te abrirá el paso» es la explicación de Bodoque, no una garantía del narrador. Ocultar vigilancia, crédito y habilidades. |
| Video con textura de títere y pixel art; alternativa de cómic en el lore. | Una reinvención rompería la identidad. | Conservar rostros, proporciones, vestuario y texturas; sumar tinta y trama en fondos y sombras. |
| Ríos jugable cenital tiene representación provisional con capucha. | No coincide plenamente con sombrero y bufanda de la cinemática. | Preservar el diseño narrativo pedido; Alejandro debe validar la correspondencia del sprite. No darlo por resuelto. |
| El mundo elige entre mapas y obtiene el inicio de datos del escenario. | Un final prerenderizado fijo puede aparecer en otro lugar. | Componer P14 con el mapa real ya resuelto, coordinándolo con vicho. No inventar un spawn para justificar el guion. |

La gratitud frente a la Familia ya existe en el lore. El encargo periodístico es una concreción narrativa: no exige crear un sistema de pruebas, fotografías, contadores, inventario o retorno jugable. No cambia parentesco, romance, pasado de clase ni combate.

## Dirección general y continuidad

Ríos deja un sobre mientras pide una oportunidad: así la conversación sobre su lugar en el noticiero nace de una acción concreta. Bodoque acerca el café antes de ofrecerle la misión. Ese cuidado parece una costumbre real. Ríos pregunta, comprueba que la investigación es suya y acepta por voluntad propia.

Las anomalías del reflejo y de la ficha pertenecen al mundo. La insinuación personal sobre Bodoque queda limitada a su breve silencio cuando Ríos ya se ha ido. No lo vincular visualmente con la ruleta ni confirmar una apuesta contra Ríos.

**Personajes:** extraer referencias limpias del video anterior, sin subtítulos ni boleto revelador. Bodoque conserva el pelaje rojo afelpado, ojos y hocico de la referencia, asimetría de orejas, gabardina beige y micrófono cromado. Ríos conserva rostro, pelo, sombrero oscuro de ala corta, gabardina gris azulada, bufanda turquesa y credencial. No reinterpretar su identidad entre planos. El sprite orienta escala y silueta, pero no sustituye una referencia facial.

**Espacio:** Ríos a izquierda mirando a derecha; Bodoque a derecha mirando a izquierda. Ventana al fondo izquierdo con luz turquesa desde ese lado. La ficha viaja de derecha a izquierda. Ríos sale y avanza hacia derecha en calle. La aproximación final se adapta a la cámara real, sin invertir el mapa.

**Paleta:** #1a1033, #2b1a4f, #d0148c, #7fd6e0, #c9d4ff. Rojo #c4223a reservado a Bodoque y señales de muerte; la apertura no añade señales de muerte. Beige y papel como neutros discretos. Evitar luz roja de villano.

## Guion técnico por planos

Los intervalos siguientes son de montaje final y no se superponen. Los puentes sonoros no agregan duración. Los cortes de plano caen en fotogramas exactos a 24 fps; las marcas interiores orientan la interpretación.

### P01 · Aguacero · 00:00–00:04,5 · 4,5 s

**Encuadre:** gran plano general, leve picado y perspectiva moderadamente angular. Calle antigua y pavimento mojado abajo; reloj y ventana del noticiero en el tercio superior. Arquitectura y neón compatibles con el título existente.

**Acción y animación:** avance corto, inferior al 5 % de la profundidad aparente. Tres capas de lluvia a velocidades distintas y una curva de vapor desde una rejilla. El neón fluctúa una vez suavemente. La ventana sigue siendo el foco.

**Diálogo:** NARRADOR desde 1,2 s: «En Aguacero, todas las deudas terminan por cobrarse». Continúa sobre P02.

**Sonido:** lluvia ancha, jazz lento de saxo recogido, narrador por delante. Reloj audible solo al inicio.

**Transición:** corte sobre una línea de neón que reaparece en el charco. Lluvia continua.

### P02 · El reflejo llega tarde · 00:04,5–00:08 · 3,5 s

**Encuadre:** plano a ras del charco, con la misma ventana reflejada. Perspectiva normal, sin deformación extrema.

**Acción y animación:** el avance anterior se frena. Un borde del edificio reflejado tarda tres fotogramas en alcanzar su posición. Las ondas y la lluvia real continúan; la anomalía afecta solo al reflejo. Sostener el último segundo.

**Diálogo:** termina el narrador hacia 5,8 s. Ninguna explicación adicional.

**Sonido:** el jazz conserva su frase, sin golpe de terror.

**Transición:** correspondencia de forma entre ventana reflejada e interior. Puerta de oficina en los últimos 0,3 s.

### P03 · El café de siempre · 00:08–00:12 · 4 s

**Encuadre:** plano medio de ambos, cámara fija. Ríos entra por izquierda; Bodoque tras el escritorio a derecha. Micrófono apoyado en su base, carpeta cerrada.

**Acción y animación:** Ríos deja un sobre mojado y acomoda el sombrero. Bodoque aparta papeles y acerca una taza con el asa orientada hacia Ríos antes de mirar el sobre. Ríos la recibe sin sorpresa: es una rutina compartida.

**Diálogo:** RÍOS, sonrisa breve, 9,0–12,2 s: «Otro sobre. Algún día traeré una historia». La última palabra continúa sobre el corte.

**Sonido:** taza sobre madera, ropa húmeda, lluvia filtrada por vidrio, una máquina de escribir lejana. Jazz más bajo.

**Transición:** corte a Ríos cuando sus dedos rodean la taza.

### P04 · El favor que importa · 00:12–00:17,5 · 5,5 s

**Encuadre:** primer plano medio de Ríos, tres cuartos; ojos parcialmente visibles bajo el ala.

**Acción y animación:** mirada del sobre a Bodoque. Manos en la taza. Respiración corta antes de «No lo olvido». Voz firme, sin súplica. La bufanda se asienta y deja de moverse.

**Diálogo:** RÍOS, 12,4–17,2 s: «Cuando la Familia vino por mí, tú me sacaste. No lo olvido».

**Sonido:** lluvia y nota musical sostenida suave; sin flashback ni sonidos de violencia.

**Transición:** corte por mirada hacia Bodoque, conservando el eje.

### P05 · Una oportunidad · 00:17,5–00:21 · 3,5 s

**Encuadre:** primer plano medio de Bodoque a la altura de Ríos, sin contrapicado de autoridad.

**Acción y animación:** escucha hasta el final, asiente una vez y ofrece una sonrisa familiar. Baja la mirada y empieza a abrir la carpeta al terminar la frase. Orejas con asentamiento mínimo, sin rebote cómico.

**Diálogo:** BODOQUE, 17,8–20,8 s: «Lo sé, Ríos. Esta nota es tuya».

**Sonido:** voz segura de periodista, roce de papel. No interpretar la frase como cobro del favor.

**Transición:** corte al movimiento de apertura de la carpeta.

### P06 · Un lugar bajo los pies · 00:21–00:27 · 6 s

**Encuadre:** detalle cenital oblicuo de carpeta abierta. Dos fotografías: calle invertida y reloj detenido. Borde de taza y mano de Ríos mantienen la geografía.

**Acción y animación:** Bodoque señala el reflejo de la primera foto; Ríos la acerca a su mirada. La cámara avanza poco hacia esa imagen durante la segunda frase. La ficha todavía no aparece.

**Diálogo:** BODOQUE: «Lo llaman El Reverso. Está bajo nuestros pies, al otro lado de los charcos».

**Sonido:** papel y lluvia amortiguada; tono grave apenas insinuado bajo el saxo.

**Transición:** la foto llena el cuadro y enlaza por composición a P07. Es visualización del relato, no un viaje ya realizado.

### P07 · La Banca · 00:27–00:33 · 6 s

**Encuadre:** general del Reverso, fijo. Edificios invertidos arriba, lluvia ascendente, reloj detenido a un lado. Figura lejana sin rostro ni identificación.

**Acción y animación:** gotas en trayectorias ascendentes legibles; un reflejo cruza una fachada contra la dirección del agua. En niebla, apenas un arco con divisiones de ruleta y un punto turquesa semejante a un ojo. La forma permanece incompleta: sin cuerpo, cara humana ni presentación de enemigo. Agujas inmóviles.

**Diálogo:** BODOQUE, fuera de campo: «Allá manda La Banca. Cobra en tiempo… y en almas». Pausa de unos 0,4 s antes de «y en almas».

**Sonido:** lluvia invertida tenue y roce de fichas. Sin rugido ni música de combate. Su voz conserva la cercanía de la oficina.

**Transición:** roce de ficha enlazado con el papel que Ríos apoya en la mesa. Corte a oficina.

### P08 · El encargo · 00:33–00:42 · 9 s

**Encuadre:** medio de ambos, mismo lado del eje; rostros y carpeta visibles, cámara inmóvil.

**Acción y animación:** Ríos deja la foto y se inclina hacia delante. Bodoque devuelve la mirada. Al decir «vuelve», toca el borde de la carpeta; no promete una ruta jugable.

**Diálogo:**

- RÍOS, 33,2–35,0 s: «¿Y qué necesitas de mí?»
- BODOQUE, 35,4–41,8 s: «Averigua cómo cobra La Banca. Consigue pruebas y vuelve con la historia al noticiero».

**Sonido:** música unos 5 dB por debajo de los planos sin diálogo, con cambios suaves. Nada golpea durante «Consigue pruebas».

**Transición:** corte a la reacción de Ríos después de «noticiero».

### P09 · No es otro recado · 00:42–00:48 · 6 s

**Encuadre:** primer plano medio de Ríos; hombro de Bodoque al borde derecho sin ocultar la expresión.

**Acción y animación:** Ríos alza la mirada, suelta la taza y apoya una mano en la carpeta. Entusiasmo contenido. Tras la respuesta de Bodoque, sostener la reacción unos 0,7 s; no cortar inmediatamente a un objeto.

**Diálogo:**

- RÍOS, 42,3–44,4 s: «¿Una investigación de verdad?»
- BODOQUE, fuera de campo, 44,8–47,1 s: «Tu primera gran nota».

**Sonido:** saxo apenas más presente, sin fanfarria.

**Transición:** mirada de Ríos hacia abajo y corte a la mesa.

### P10 · La ficha · 00:48–00:53 · 5 s

**Encuadre:** detalle oblicuo a ras del escritorio. Mano roja a derecha, ficha al centro, mano de Ríos a izquierda. Franja húmeda dejada por el sobre permite un reflejo tenue.

**Acción y animación:** Bodoque desliza la ficha durante 0,65 s; desacelera por fricción. Tres fotogramas antes de detenerse, el ojo reflejado apunta arriba mientras el grabado real conserva su dibujo. Ríos espera a que se detenga y después la toma. No convertir la ficha entera en un ojo vivo.

**Diálogo:** BODOQUE, 49,0–51,8 s: «Llévala. Te abrirá el paso».

**Sonido:** roce de ficha y nota inquietante breve; la nota cae después de «paso» y pertenece al objeto.

**Transición:** corte sobre los dedos al levantar la ficha, manteniendo mano y dirección.

### P11 · Ríos elige · 00:53–00:58 · 5 s

**Encuadre:** medio de ambos, mismo eje. Ficha a altura del pecho de Ríos, sin brillo entre los dedos.

**Acción y animación:** Ríos comprueba el grabado y mira a Bodoque para responder. Guarda la ficha, asiente y se incorpora. Bodoque devuelve la sonrisa unos cuatro fotogramas tarde: puede parecer cansancio, nunca cálculo ni mirada furtiva.

**Diálogo:** RÍOS, 53,4–55,3 s: «Traeré la historia».

**Sonido:** gabardina, silla y lluvia. Dejar respirar su decisión, sin réplica ominosa.

**Transición:** Ríos sale de cuadro hacia la puerta. Corte a un encuadre abierto del mismo espacio.

### P12 · Suerte · 00:58–01:05 · 7 s

**Encuadre:** medio abierto de Bodoque y escritorio, puerta al fondo. Cámara fija a altura de ojos.

**Acción y animación:** la puerta se cierra. Su sonrisa se pierde en una exhalación, no en un cambio brusco de máscara. Mira a la puerta y después al boleto casi oculto bajo la carpeta. Lo dobla y guarda boca abajo. Ningún número, resultado, caballo, deuda o cláusula es legible. La mano se demora antes de soltarlo; no lo aprieta con rabia.

**Diálogo:** BODOQUE, casi para sí, 61,8–63,6 s: «Suerte, Ríos».

**Sonido:** voz sin efecto siniestro, final de frase de jazz, lluvia y papel. Sin susurro de La Banca, latido ni acorde que confirme traición.

**Transición:** lluvia exterior desde los últimos 0,4 s; corte al zapato de Ríos.

### P13 · Cruzar · 01:05–01:10 · 5 s

**Encuadre:** bajo lateral del charco, sombrero y bufanda reflejados, zapato real en el borde. Inicio fijo y luego un único avance hacia el agua.

**Acción y animación:** Ríos se detiene. Su reflejo mira arriba tres fotogramas antes que él. Ríos respira y da el paso conscientemente. La suela hunde la superficie 3–5 píxeles equivalentes antes de que ceda como membrana. La bufanda sigue con cuatro fotogramas de retraso. La cámara atraviesa el agua, sin giro completo de 180 grados ni caída violenta.

**Diálogo:** ninguno.

**Sonido:** de 67,8 a 69,3 s la lluvia descendente cruza hacia una textura invertida. Breve vacío al atravesar el agua.

**Transición:** membrana cubre el cuadro y sirve de máscara para descubrir el mundo real cargado.

### P14 · La partida · 01:10–01:15 · 5 s

**Encuadre:** cámara jugable real sobre el mapa elegido, Ríos en la posición inicial efectiva. No usar coordenadas del stub lateral ni inventar terreno.

**Acción y animación:** de 70,0 a 70,8 s se retira la membrana sobre el mapa ya resuelto. Silueta, escala y orientación coinciden con el jugador. Luz turquesa continúa desde el mismo lado. La lluvia visible, si existe en ese escenario, asciende. Cámara estable y personaje en reposo, sin arma equipada por efecto del guion. Evitar daño durante la presentación. Entregar control a 75,0 s usando el estado de inicio existente.

**Texto de interfaz, añadido en montaje:**

- 70,2–72,2 s: «EL REVERSO».
- 70,6–75,0 s y hasta al menos 81,0 s durante el juego: «Investiga a La Banca. / Consigue pruebas y regresa.».

La barra indica salto de línea, no se imprime. El objetivo es un recordatorio de historia: sin casillas, cantidades o mecánica nueva.

**Sonido:** lluvia ascendente y ambiente del escenario; enlace a música de zona respetando AudioDirector, sin duplicar lluvia de video y juego.

**Transición:** desaparece la máscara y queda el mismo mundo bajo control. El `finish()` actual inicia GameScene después del video; por sí solo no garantiza este empalme. Requiere composición e integración.

## Prompts visuales separados

Producir cada plano aparte: **ESTILO + personajes presentes + prompt del plano**. Adjuntar las mismas hojas aprobadas siempre; repetir un texto no garantiza continuidad. Generar primero la imagen inicial y animarla después con la instrucción de movimiento. La duración es tiempo útil de montaje, no un control garantizado de una herramienta.

**ESTILO FIJO:** Fotograma de cómic noir animado, 16:9, tinta negra marcada de grosor variable, sombras recortadas, trama fina y papel estable. Acabado texturado compatible con las referencias del juego, sin alterar sus proporciones de títere. Azul #1a1033, violeta #2b1a4f, magenta #d0148c, turquesa #7fd6e0, blanco lluvia #c9d4ff; beige y papel discretos. Rojo #c4223a solo en el conejo. Noche, neón sobre pavimento mojado, profundidad por capas. En oficina, luz principal turquesa desde fondo izquierdo. Sin letras, bocadillos, subtítulos ni marcas de agua. Reservar el 20 % inferior para subtítulos. Sin armas, poderes ni accesorios nuevos.

**RÍOS FIJO:** Misma persona de la hoja adjunta, conservando exactamente rostro, pelo, tono de piel, proporciones y accesorios de referencia. Sombrero oscuro de ala corta, gabardina gris azulada, cuello alto, bufanda turquesa, credencial vacía para rotular después. Figura delgada, atenta; ojos visibles en reacciones. No sustituir sombrero por capucha en planos narrativos. Sin espada ni pistola.

**BODOQUE FIJO:** Juan Carlos Bodoque según hoja adjunta: mismo conejo rojo afelpado, proporciones de títere, ojos y hocico, asimetría de orejas de referencia, gabardina beige gastada, corbata discreta, credencial, micrófono vintage cromado de rejilla redonda. Periodista experimentado, carismático y cansado. Misma escala frente a Ríos. Sin transformación, costuras luminosas, dientes amenazantes ni expresión de villano.

**FICHA FIJA:** Una ficha de casino magenta de tamaño normal, borde segmentado y ojo estilizado grabado; mismo diámetro, diseño y grosor. Refleja neón, no emite rayos ni concede poderes visibles.

| Plano | Referencias | Prompt de imagen inicial | Instrucción de animación |
|---|---|---|---|
| P01 · 4,5 s | Arte del título | Calle estrecha de Aguacero nocturna, ladrillo, escaleras de incendio, neón magenta vertical, reloj y ventana encendida al fondo. General levemente picado, profundidad clara y pavimento mojado en primer término. Espacio vacío para rótulo del noticiero. | Avance corto a la ventana, lluvia en tres capas, hilo de vapor, una fluctuación de neón. Arquitectura rígida. Acabar casi detenido. |
| P02 · 3,5 s | Último cuadro P01 | Vista a ras del charco que refleja la misma ventana y edificio. Neón sobre ondas y pavimento oscuro en el borde; cámara nivelada. | Frenar el avance; separar el reflejo como capa y retrasarlo tres fotogramas. Ondas continuas. Último segundo estable. Componer manualmente si se deforma la arquitectura. |
| P03 · 4 s | Ríos, Bodoque, oficina | Plano medio de Ríos a izquierda entrando con sobre mojado; Bodoque a derecha tras la mesa, taza con asa, carpeta cerrada y micrófono en base. Misma altura visual. | Dejar el sobre. Bodoque aparta dos papeles y acerca la taza por el asa; Ríos la recibe con familiaridad. Cámara fija y manos sin cruzarse. |
| P04 · 5,5 s | Ríos, oficina | Primer plano medio tres cuartos de Ríos mirando a derecha, dedos alrededor de la taza, borde del sobre abajo; turquesa en sombrero y mejilla sin ocultar los ojos. | Mirar el sobre, volver a Bodoque y hablar en calma. Una respiración antes de la frase final. Expresión contenida, sin balanceo ni zoom. |
| P05 · 3,5 s | Bodoque, oficina | Primer plano medio del conejo rojo mirando a izquierda, persianas detrás, mano sobre carpeta, expresión receptiva y borde del micrófono reconocible. | Escuchar, asentir una vez y sonreír con naturalidad. Bajar la mirada y empezar a abrir la carpeta. Orejas con asentamiento mínimo; cámara fija. |
| P06 · 6 s | Oficina, manos | Detalle cenital oblicuo de carpeta y dos fotos sin letras: ciudad invertida y reloj detenido. Mano roja a derecha y de Ríos a izquierda, taza en continuidad. Sin ficha. | Bodoque señala el reflejo; Ríos acerca esa foto. Avance corto hasta llenarla en cuadro. La otra foto permanece inmóvil. |
| P07 · 6 s | Foto P06, arte del mundo | Misma ciudad desde dentro del reflejo: fachadas invertidas arriba, calle mojada, reloj detenido a un lado y figura mínima sin rostro. Niebla apenas deja ver arco dividido de ruleta y punto turquesa. General fijo. | Lluvia sube claramente, niebla lenta, reflejo imposible sobre fachada. Agujas y figura quietas. No acercar el ojo ni formar monstruo. |
| P08 · 9 s | Ríos, Bodoque, oficina | Medio de ambos sobre el eje establecido, Ríos izquierda con foto cerca de mesa, Bodoque derecha atento. Carpeta entre ambos; luz desde fondo izquierdo. | Ríos baja la foto y pregunta; Bodoque responde mirándole. Toque a carpeta al decir vuelve. Cámara quieta y gestos por turnos; montar diálogo y boca después. |
| P09 · 6 s | Ríos, hombro Bodoque | Primer plano medio de Ríos con ojos atentos, mano en carpeta, hombro beige desenfocado al borde derecho. Misma luz y mirada. | Alzar ligeramente cejas al preguntar, escuchar fuera de campo y sonreír satisfecho con contención. Sostener reacción final sin mover cámara. |
| P10 · 5 s | Manos, ficha, mesa | Detalle bajo de mesa: ficha magenta junto a mano roja a derecha, mano de Ríos esperando a izquierda, franja húmeda que permite reflejo tenue. | Deslizar ficha, desacelerar, detenerse y recogerla. Separar ojo reflejado en composición para mirar arriba durante tres fotogramas; grabado real inmóvil. |
| P11 · 5 s | Ríos, Bodoque, ficha | Medio de ambos: Ríos a izquierda sostiene la ficha a altura del pecho, Bodoque atento a derecha, silla y carpeta en continuidad. | Ríos mira grabado, mira a Bodoque, responde, guarda ficha y se incorpora. Sonrisa de Bodoque cuatro fotogramas tarde. Sin brillo entre dedos ni mirada furtiva. |
| P12 · 7 s | Bodoque, oficina | Medio abierto de Bodoque solo, puerta recién cerrada al fondo, carpeta y boleto doblado casi oculto. Sin letras, números ni ojo en boleto. | Sonrisa se relaja con exhalación. Mirada a puerta y luego boleto; doblarlo y guardarlo boca abajo, pequeña duda en mano. Murmurar despedida. Sin luz siniestra. |
| P13 · 5 s | Ríos, calle | Bajo lateral del zapato ante charco; agua refleja sombrero y bufanda con la misma identidad. Neón magenta y turquesa entre gotas. | Reflejo alza mirada tres fotogramas antes. Ríos avanza conscientemente. Suela hunde membrana, agua cede y único avance cruza superficie. Sin giro completo ni remolino violento. |
| P14 · 5 s | Captura real del mapa y jugador | Usar captura exacta de cámara, escala, luz, suelo e inicio de GameScene como placa. Agua en capa independiente; espacio para título y objetivo. No regenerar terreno. | Retirar agua entre 70,0 y 70,8 s, estabilizar cámara y Ríos en reposo, enlazar al mismo mundo jugable. Componer con el juego, no delegar continuidad al generador. |

Exclusiones comunes: cambios de rostro o vestuario, orejas que se rediseñan, manos adicionales, doble ficha, movimiento constante de cámara, terror explícito, guiños cómicos, combate final, número de enviados, credenciales anteriores, contratos, apuestas legibles, texto generado, transformación y habilidades nuevas.

## Subtítulos y rótulos para montaje

Propuesta a ajustar a una lectura grabada. Máximo dos líneas; objetivo de 12–18 caracteres por segundo. Nombres de hablante en campo separado. Verificar ancho con la fuente real.

```srt
1
00:00:01,200 --> 00:00:05,800
En Aguacero, todas las deudas
terminan por cobrarse.

2
00:00:09,000 --> 00:00:12,200
Otro sobre.
Algún día traeré una historia.

3
00:00:12,400 --> 00:00:17,200
Cuando la Familia vino por mí,
tú me sacaste. No lo olvido.

4
00:00:17,800 --> 00:00:20,800
Lo sé, Ríos.
Esta nota es tuya.

5
00:00:21,500 --> 00:00:23,400
Lo llaman El Reverso.

6
00:00:23,400 --> 00:00:26,800
Está bajo nuestros pies,
al otro lado de los charcos.

7
00:00:27,500 --> 00:00:29,700
Allá manda La Banca.

8
00:00:29,900 --> 00:00:32,700
Cobra en tiempo… y en almas.

9
00:00:33,200 --> 00:00:35,000
¿Y qué necesitas de mí?

10
00:00:35,400 --> 00:00:37,800
Averigua cómo cobra La Banca.

11
00:00:37,800 --> 00:00:41,800
Consigue pruebas y vuelve
con la historia al noticiero.

12
00:00:42,300 --> 00:00:44,400
¿Una investigación de verdad?

13
00:00:44,800 --> 00:00:47,100
Tu primera gran nota.

14
00:00:49,000 --> 00:00:51,800
Llévala. Te abrirá el paso.

15
00:00:53,400 --> 00:00:55,300
Traeré la historia.

16
00:01:01,800 --> 00:01:03,600
Suerte, Ríos.
```

Hablantes: 1 narrador; 2–3 Ríos; 4–8 Bodoque; 9 Ríos; 10–11 Bodoque; 12 Ríos; 13–14 Bodoque; 15 Ríos; 16 Bodoque. Mostrar la despedida aunque su voz sea baja.

Rótulos exactos: `NOTICIERO DE MEDIANOCHE` en oficina; `RÍOS · PRENSA EN PRÁCTICA` en la presentación o credencial si es legible; `JUAN CARLOS BODOQUE · REPORTERO` en su presentación; `LA NOTA` sobre P01 si se necesita identificar la pieza. No superponer rótulo de personaje y subtítulo largo. No agregar el nombre completo al diálogo.

A 480×270: cuerpo propuesto de subtítulo 12 px equivalentes, interlínea 14 px, blanco lluvia sobre banda azul muy oscura de alta opacidad. Márgenes laterales mínimos 16 px, banda inferior de hasta 48 px. Barlow Condensed de main para diálogo, verificando ancho; Silkscreen para títulos cortos. No añadir barras 2,39:1 que resten espacio a gestos. Objetivo final fuera de la banda de diálogo. Todo se rotula en montaje o interfaz.

## Interpretación, audio y producción

**Ríos:** cómodo en una oficina conocida, cansado de recados. La Familia es un hecho compartido, sin pedir lástima. Sorpresa agradable en P09 y aceptación segura en P11. No ha descubierto una trampa.

**Bodoque:** escucha y cuida de verdad aunque comete una traición que la apertura no cuenta. Seguridad de periodista y humor seco leve, sin sarcasmo contra Ríos. «Suerte, Ríos» admite preocupación y culpa. Voz propia o genérica sobria, sin necesidad de imitar una voz real.

**Narrador:** cercano, una sola frase. Reverberación contenida para entender cada palabra.

Separar voces, jazz, lluvia exterior, oficina, lluvia invertida y efectos. Comprobar mezcla con altavoces pequeños y auriculares: consonantes claras y sin salto de volumen al jugar. No asumir que `vo-title` contiene la frase nueva. Se necesitan nuevas grabaciones o síntesis revisadas. En el juego, seba coordina audio mediante AudioDirector.

1. Extraer referencias limpias y grabar lectura temporal de los 16 cues antes de producir clips. Ajustar pausas dentro de cada plano, sin acelerar toda la voz.
2. Construir animática de 14 planos con tiempos finales, miradas, manos y empalme al mapa.
3. Separar fondos, personajes, manos, taza, carpeta, fotos, ficha, boleto, sombras, lluvia y reflejos. Papel anclado a superficies para evitar textura inestable. Variantes de ojos y boca; revisar dedos y asa manualmente.
4. Animar gestos con poses sostenidas y cambios controlados; cámara y efectos a 24 fps. Los primeros planos necesitan interpretación, no zoom sobre imágenes inmóviles. También puede producirse mediante recortes 2D con poses específicas.
5. Crear un clip por plano y montar sus duraciones útiles hasta 75 s. Componer manualmente retraso de reflejo P02, ojo reflejado P10 y membrana P13–14. Corregir continuidad de manos y ficha.
6. Rotular y subtitular después; grabar voces finales, sincronizar bocas y mezclar. Probar sin audio: relación y misión siguen entendiéndose por subtítulos.
7. Propuesta de salida 960×540, 24 fps, sin barras incrustadas. El WebM reproducido por el juego cubre 0–70 s; los cinco segundos de P14 se ejecutan sobre el mundo real. Una previsualización completa de 75 s puede exportarse tras capturar ese empalme. Entregar copia limpia y SRT separado; si los subtítulos se sirven por interfaz, no incrustarlos también. Revisar legibilidad a 480×270.
8. Los primeros 70 s pueden ser video. Los últimos cinco se componen con el mundo real ya resuelto. Seba y vicho acuerdan preparación de escena, suspensión temporal de simulación/input y revelado. No se fija evento nuevo ni se cambia `src/main.ts`. Un archivo que termina sobre un mapa inventado no garantiza continuidad.
9. Conservar ESC/ENTER y botón de salto de la referencia existente. Si se salta o falla el video, entrar una vez al juego y mostrar el mismo objetivo. Evitar que una tecla sostenida actúe en el primer cuadro jugable. Son requisitos de integración aún no implementados.

Destinos futuros de seba: `public/assets/ui/cinematics/cine1/` y `public/assets/audio/`. Alejandro valida correspondencia visual de Ríos; vicho decide puesta en cámara sobre el inicio real. No se modifican archivos de esos dominios en esta entrega.

**Requiere producción posterior:** hojas limpias, capas, animática y clips; interpretación de 16 cues, ambientes y mezcla; rotulación, sincronización y máster; composición P14, objetivo persistente y salida anticipada.

## Criterios de aceptación

| Pregunta | Evidencia prevista |
|---|---|
| ¿Quién soy? | Ríos entrega un sobre, lleva prensa y Bodoque lo llama por su nombre. |
| ¿Quién es Bodoque? | Café compartido y reconocimiento explícito del rescate frente a la Familia. |
| ¿Por qué acepto? | Ríos quiere pasar de recados a historias, confía y toma su propia decisión. |
| ¿Adónde voy? | Fotos, explicación de los charcos, visión del Reverso y cruce consciente. |
| ¿Qué debo hacer? | Investigar cobro de La Banca, conseguir pruebas, regresar al noticiero; refuerzo final. |

Probar con alguien que desconozca el lore: debe responder las cinco preguntas. Si identifica ya la apuesta o el número de enviado, revisar boleto e interpretación. Puede dudar del ánimo de Bodoque, pero no conocer su traición.

Verificar al integrar: todos los mapas disponibles; continuidad de posición/cámara; sin daño antes de control; final natural; salto; error de carga; reproducción sin audio; legibilidad; una sola entrada a GameScene. Estos son criterios futuros, no pruebas realizadas sobre una nueva cinemática.
