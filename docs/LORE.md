# MafiaDev — Lore, mundo y cinemáticas

> Biblia narrativa del juego. Conecta lo que ya existe en el repo (ciudad noir con lluvia del título, jazz con saxo, narrador, clases Luchador y Mago, «Parar el tiempo», «Proyectil de almas», «Traspasar», los 4 ítems, slime, knight y minijefe, cofres ocultos, checkpoints con respawn, escenarios 1 · INICIO / 2 · MITAD / 3 · FINAL y la espada flotante del prototipo de basti) en una sola historia. Jefe final: **Juan Carlos Bodoque**.
>
> Estado: propuesta de seba, pendiente de validar por el equipo (`SUP-seba-20261123-122921`). Los nombres de este documento son sugerencias de presentación: no obligan a renombrar claves de código (`slime`, `knight`, `miniboss`, `time_stop`…).

---

## 0. La historia en un párrafo

En una ciudad donde no deja de llover, todas las cosas se apuestan. Juan Carlos Bodoque, el reportero más famoso del noticiero de medianoche, lleva años sin fallar una exclusiva. Su secreto es que cada noticia se la dicta **La Banca**, la entidad que gobierna **El Reverso**, la ciudad que existe al otro lado de los charcos. La Banca nunca pierde y cobra en almas y en segundos de vida. Para pagar los intereses, Bodoque manda cada año a alguien «a cubrir una nota» al Reverso, y nadie vuelve. **Ríos** es el séptimo enviado. Esta vez Bodoque apostó todo, incluida su propia alma, a que Ríos no regresaría. Cuando Ríos vence al campeón de La Banca, la apuesta se tuerce. Bodoque comprende que va a perder y cruza en persona para cerrar la carrera con sus propias manos.

---

## 1. Tono y reglas del mundo

| Pilar | Cómo se nota en el juego |
|---|---|
| **Noir de lluvia** | Ciudad nocturna, saxo lento (`music-title`, 70 bpm con swing), narrador grave (`vo-title`, voz «onyx»), neón magenta y turquesa sobre azul medianoche. |
| **Todo es una apuesta** | Loot con rareza como tirada de dados, cofres ocultos como «la mano escondida», muerte y respawn como «la casa te devuelve a la mesa». |
| **El reflejo** | El Reverso es la ciudad vista desde dentro de un charco: invertida, empapada y con el tiempo empeñado. Traspasar consiste en atravesar un reflejo. |
| **La prensa** | Bodoque es reportero, así que la misión es «una nota», los checkpoints son teléfonos públicos y las pistas son credenciales de PRENSA de los enviados anteriores. |
| **Humor seco** | Es una hackatón: se permiten guiños (las flexiones de los créditos, Bodoque y sus apuestas), pero la historia se cuenta en serio. El humor sale de la seriedad. |

**Paleta canónica** (la misma del arte del título, reducida a 24 colores): azul medianoche `#1a1033`, violeta profundo `#2b1a4f`, magenta neón `#d0148c`, turquesa frío `#7fd6e0`, blanco lluvia `#c9d4ff` y rojo sangre `#c4223a` (el rojo de «HAS MUERTO» y el de Bodoque). **El rojo está reservado a Bodoque y a la muerte.** Si aparece en pantalla, algo va mal.

---

## 2. Cosmología

### 2.1 La Ciudad (el mundo de arriba)

Una ciudad sin nombre oficial a la que la gente llama **Aguacero**. Sus calles son las del título: edificios de ladrillo, escaleras de incendio, letreros verticales de neón y charcos que reflejan más de lo que deberían. De día la gobierna el municipio y de noche **la Familia**, la mafia que controla el hipódromo, los casinos y las imprentas. Todo el mundo le debe algo a alguien.

La única voz que la Familia nunca pudo comprar fue la del **Noticiero de Medianoche** y su estrella, Juan Carlos Bodoque. O eso cree la ciudad.

### 2.2 El Reverso (la tierra extraña)

Bajo cada charco de Aguacero hay una ciudad entera, el Reverso. Es la misma ciudad dada vuelta. La lluvia sube, los letreros se leen al revés, los relojes marcan la misma hora desde hace décadas y el agua llega a la cintura en las calles bajas. El cielo es el fondo de los charcos de arriba: a veces se ven pasar suelas de zapatos y ruedas de taxi.

El Reverso existe porque alguien tiene que guardar lo que la ciudad pierde. Las apuestas que se pierden en Aguacero no desaparecen: bajan, y aquí se cobran.

### 2.3 La Banca (lo que domina el Reverso)

**La Banca** no es una persona. Es la casa, la regla de que la casa siempre gana, convertida en algo que piensa. Se manifiesta como una **ruleta gigante girando detrás del cielo**, con un ojo como bola, y como una voz que suena a fichas cayendo. Nadie la ha visto entera.

- **Moneda:** La Banca no acepta dinero. Cobra **segundos** (tiempo de vida) y **almas**. Por eso en el Reverso los relojes están detenidos: todo el tiempo está empeñado.
- **Contratos:** quien pide crédito recibe una **ficha marcada**, una ficha de casino magenta con un ojo grabado. Mientras la tenga, La Banca lo ve y lo cuenta.
- **La regla:** La Banca no puede matar a nadie directamente, solo cobrar deudas. Por eso necesita apuestas: que alguien juegue tu vida, que alguien pierda.
- **El respawn tiene explicación:** cuando Ríos muere, La Banca rebobina unos segundos y lo devuelve al último teléfono, porque la apuesta sigue abierta y Ríos es la mercancía. El rebobinado se cobra con intereses: **todos los deudores vuelven a su sitio** (los enemigos reaparecen). Coincide con el diseño de checkpoints del README.

---

## 3. Personajes

### 3.1 Ríos (protagonista)

Le llaman **Ríos** y nadie usa su nombre de pila. Es una figura delgada con gabardina gris azulada empapada, cuello alto, bufanda turquesa y sombrero de ala corta que le tapa los ojos casi siempre. Es neutra a propósito para que el sprite de alejandro mande. Lleva al cuello una credencial de **PRENSA (EN PRÁCTICA)** que le dio el noticiero.

Tiene una deuda con Bodoque. Él le sacó de un lío con la Familia y desde entonces Ríos le hace recados: fotos, sobres, seguimientos. Ríos cree que Bodoque es el único decente de Aguacero.

**Las dos clases son dos pasados posibles** (`classes.json`):

| Clase | Pasado | Habilidad y razón en el lore |
|---|---|---|
| **Luchador** | Boxeador de peleas clandestinas de la Familia. Le pagaban por caer en el tercer asalto. Una noche no cayó y tuvo que desaparecer. | **Parar el tiempo** (`time_stop`, 3 s, 12 s de cooldown). La ficha marcada que le da Bodoque guarda segundos prestados de La Banca. Un luchador sabe exactamente cuánto dura un segundo, así que puede **gastarlos**: aprieta la ficha y el mundo se queda quieto. Es literalmente tiempo de La Banca, y por eso tiene cooldown: la ficha tarda en «volver a cargar» crédito. |
| **Mago** | Ilusionista de casino. Su número era adivinar la carta del público, hasta que empezó a ver las almas de los apostadores flotando sobre las mesas. | **Proyectil de almas** (`soul_bolt`, coste 1 alma). En el Reverso las almas de los deudores derrotados quedan sueltas. El Mago las recoge como cartas y las lanza. No las destruye: las **libera** de La Banca, y por eso La Banca odia al Mago. |

**Traspasar** (`teleport`, 64 px): en el Reverso cualquier superficie mojada es una puerta. Ríos aprende a meterse en un reflejo y salir por otro cercano. Es una habilidad compartida que se puede desbloquear a mitad de juego.

**Movimiento** (doble salto, coyote, dash): en el Reverso la lluvia sube y empuja hacia arriba, así que todo el mundo salta un poco más. El doble salto es apoyarse en una gota que sube. El dash deja una **estela de siluetas** (`DashTrail` de basti) que son reflejos: Ríos atraviesa su propio charco.

### 3.2 Juan Carlos Bodoque (el mentor y el jefe final)

Es un conejo rojo de pelaje afelpado, el reportero estrella del Noticiero de Medianoche. Tiene orejas larguísimas, ojos grandes y vivos, voz de locutor y gabardina beige de reportero. Su micrófono vintage, cromado con la rejilla redonda, es su firma. Es cínico, encantador y brillante. Tiene un vicio que todo Aguacero le conoce y le perdona: **las carreras de caballos**.

**Su historia (lo que nadie sabe):**

1. **La noche del Favorito.** Hace once años Bodoque apostó todo lo que tenía, y lo que no, a un caballo llamado **El Favorito** en el hipódromo de la Familia. El caballo cayó en la última curva. Esa misma noche, empapado y arruinado, Bodoque se miró en un charco del estacionamiento y el charco le contestó.
2. **El crédito infinito.** La Banca le ofreció un trato: «Gana siempre. Paga después.» Desde entonces Bodoque nunca ha fallado una exclusiva. La Banca le susurra las noticias antes de que ocurran: el incendio del muelle, la caída del concejal, el robo del siglo. Se convirtió en leyenda.
3. **Los intereses.** La Banca cobra **un alma por año**. Bodoque descubrió que no hacía falta pagar con la suya: bastaba con **enviar a alguien**. Cada año contrata a una persona joven y prometedora, le da una ficha marcada y la manda a «cubrir una nota» al Reverso. Ninguna vuelve. Son **seis enviados** en seis años, y la ciudad cree que fueron accidentes, mudanzas o gente que se fue de Aguacero.
4. **La apuesta final.** Este año La Banca subió la tarifa. Ya no quiere un alma cualquiera, quiere **un alma que pueda detener el tiempo** o **ver otras almas**, la más cara de la mesa. Le ofreció a Bodoque un trato de doble o nada: si entrega esa alma, su deuda queda **saldada para siempre**. Si el enviado vuelve vivo, La Banca **se cobra a Bodoque**. Bodoque aceptó. Eligió a Ríos porque es la persona que más confía en él.
5. **Por qué viene en persona.** Cuando Ríos derrota a **El Favorito** (el mismo caballo de aquella noche, ahora campeón de La Banca) y sigue avanzando hacia la salida, Bodoque ve su propia ficha empezar a agrietarse. La carrera solo termina cuando alguien cruza la meta. Si Ríos sale, Bodoque pierde el alma. No puede enviar a nadie más, porque ya no quedan apuestas, así que cruza el charco él mismo.

**Lo que lo hace un villano interesante:** Bodoque no odia a Ríos. Le tiene cariño, y eso lo empeora. Su línea de fondo es el miedo: lleva once años huyendo de una sola noche. No pelea por poder, pelea porque **no sabe perder**. La pelea final es el reportero contra la única noticia que no quiere dar: la suya.

### 3.3 La Banca

Ver 2.3. No se pelea contra ella, porque la casa no se derrota: se deja de jugar. Aparece en el fondo de la pelea final como ruleta y ojo, y en el epílogo.

### 3.4 Los seis enviados

Son los anteriores enviados de Bodoque. Cada uno dejó una **credencial de PRENSA** en el Reverso. Son coleccionables de lore dentro de los **cofres ocultos** (`chest_hidden`, `chest:opened {hidden: true}`), al lado del botín. Juntas revelan el giro antes de que llegue.

| # | Nombre | Dónde | Texto de la credencial (una línea) |
|---|---|---|---|
| 1 | Marta Iturra, fotógrafa | Escenario 1 | «Bodoque dice que la exclusiva vale la pena. El agua sube al revés.» |
| 2 | Kevin Salas, becario | Escenario 1 | «Hay alguien en el teléfono que sabe mi nombre antes de que hable.» |
| 3 | Doña Inés Castro, archivista | Escenario 2 | «Encontré el boleto de 11 años atrás. El Favorito. Su firma.» |
| 4 | Lalo Fuentes, camarógrafo | Escenario 2 | «Los cobradores juegan a las cartas con nuestras horas.» |
| 5 | Rocío Pardo, practicante | Escenario 3 | «No es una nota. Es un pago.» |
| 6 | Sin nombre | Escenario 3, antes del jefe | La credencial está en blanco, solo el sello del noticiero. Detrás, con letra de Bodoque: «Perdón.» |

**La espada del prototipo de basti** (`SwordPickup`, la espada flotante) es el arma del enviado n.º 4, el camarógrafo, que llegó más lejos que nadie. Ríos la encuentra flotando en el agua al principio del Escenario 1: es su primera arma y su primera pista de que no es la primera persona aquí.

---

## 4. Enemigos del Reverso

Todos los enemigos son **deudores**: gente de Aguacero que perdió una apuesta y bajó. La Banca les quitó algo y los puso a trabajar. Al derrotarlos sueltan lo que les quedaba, que es el loot.

| Clave en código | Nombre en el lore | Qué es | Diseño visual (32×32) | Comportamiento (`enemies.json`) y su explicación |
|---|---|---|---|---|
| `slime` | **Charcos** | Lo que queda de quien lo perdió todo, cuerpo incluido. Agua sucia con neón disuelto que todavía se mueve. | Mancha de agua violeta con reflejos magenta y turquesa en la superficie. Dentro se ve flotar el reflejo de una cara o de un sombrero. Al morir hace *splash* y deja un anillo de ondas. | HP 3, lento (40), aggro corto. Se arrastran hacia el calor. Sueltan pociones porque **la poción menor es lluvia destilada** del Reverso. |
| `knight` | **Cobradores** | Apostadores que no pagaron y ahora cobran a otros. Visten armadura de **fichas de casino apiladas** y llevan una ficha marcada en el pecho. | Caballero achaparrado de fichas violetas y negras con visera de tragamonedas y una espada que es una **pala de crupier** afilada. Las rendijas de la visera brillan turquesa. | HP 6, `windupMs` 400. **El windup es «repartir»:** levantan la pala y se oye un clic de fichas antes del golpe. Ese clic es la ventana de parry. Hoy no existe un evento de anticipación en el contrato: si el clic debe sonar, añadirlo es un cambio `shared`. |
| `miniboss` | **El Favorito** | El caballo por el que Bodoque perdió todo hace once años. La Banca lo recogió del barro de la última curva y lo convirtió en su campeón. Lo monta un **jinete sin cara** con los colores de la Familia. | Caballo negro esquelético de crines de agua que sube, herraduras de neón magenta y número **7** en la manta (Ríos es el enviado n.º 7). El jinete lleva sedas rayadas y una cara lisa como un huevo. 64×64. | HP 30, `windupMs` 500. **Embestidas en carril** como en una carrera y saltos de valla. Al morir, el jinete se deshace y el caballo **por fin se tumba**, como si descansara. Suelta `hoja_eclipse` con un 10 % (ver 5). Emite `boss:phase {1}` al empezar (PEN de basti existente). |

**Ideas de variedad sin código nuevo** (recolor o tuning, a decidir por basti): **Charco Rojo**, un charco con un boleto de hipódromo flotando que explota al morir, y **Cobrador Mayor**, un cobrador con dos palas y el windup más corto.

---

## 5. Ítems y botín

El loot es lo que los deudores no alcanzaron a pagar. La rareza (`common → rare → epic → legendary`) mide **cuánto le dolió a La Banca perderlo**.

| `id` | Nombre | Lore |
|---|---|---|
| `pocion_menor` | Poción menor | Lluvia del Reverso destilada en un frasco de perfume barato. Como sube en vez de caer, cura de abajo hacia arriba. |
| `fragmento_corazon` | Fragmento de corazón | La Banca guarda los corazones de los deudores en una caja fuerte que se rompió con las inundaciones, y sus pedazos flotan por el Reverso. Cada uno que recoges es **un latido que La Banca ya no cobra**: +1 de vida máxima. |
| `elixir_furia` | Elixir de furia | El destilado que la Familia sirve en el hipódromo antes de la última carrera. Quema. Diez segundos de puños más pesados. |
| `hoja_eclipse` | Hoja del eclipse | La noche que El Favorito cayó hubo un eclipse y todo el neón de Aguacero se apagó a la vez. En ese segundo sin luz, sin reflejo y sin apuesta, una navaja de afeitar cayó a un charco y bajó al Reverso **sin precio**. Es lo único que La Banca no puede tasar. Por eso corta lo que La Banca ha tocado. Arma legendaria, `atk +4`. |

**Cofres:** los normales (`chest`) son **cajas fuertes** de la Familia que bajaron con el agua. Los ocultos (`chest_hidden`) son **maletines de reportero** de los seis enviados: llevan botín más generoso y una credencial (ver 3.4).

---

## 6. Geografía: los tres escenarios

Los escenarios coinciden con el selector del título (`STAGES` en `TitleScene`: 1 · INICIO, 2 · MITAD, 3 · FINAL; vicho los lee con `data.stage`, PEN-vicho-20261123-114613).

### Escenario 1 · INICIO — **Los Bajos del Muelle**

- **Lugar:** el reflejo del puerto de Aguacero, con calles inundadas hasta la cintura, botes colgando boca abajo del «cielo», grúas invertidas y faroles bajo el agua que iluminan desde abajo.
- **Ambiente:** neblina, lluvia que sube y luces turquesa. Música `music-zone1` (flauta, re menor, 88 bpm) y ambiente `amb-zone1`.
- **Enemigos:** Charcos y algunos Cobradores.
- **Hitos:** la espada flotante del enviado n.º 4 (primer arma), el primer teléfono público (checkpoint y llamada de Bodoque) y las credenciales 1 y 2.
- **Tutorial:** los pasos de `TUTORIAL_STEPS` (moverse, saltar, combo de 3, esquivar, parry, Parar el tiempo) caen naturalmente aquí. Bodoque guía por teléfono: «Bloquea justo a tiempo, como cuando te piden un comentario».

### Escenario 2 · MITAD — **El Hipódromo Hundido**

- **Lugar:** el reflejo del hipódromo de la Familia, con tribunas invertidas como estalactitas, pista de barro magenta, vallas y el marcador de apuestas congelado en la carrera de hace once años.
- **Ambiente:** más rápido y más tenso. Música `music-zone2` (mi armónica, 104 bpm), con relinchos lejanos y anuncios de altavoz distorsionados.
- **Enemigos:** Cobradores en grupo y Charcos en las zanjas.
- **Hitos:** credenciales 3 y 4 (el boleto con la firma de Bodoque) y **El Favorito** (minijefe) en la recta final. Al vencerlo, la ficha de Ríos **se agrieta**.
- **Revelación parcial:** tras El Favorito, el teléfono suena y Bodoque ya no bromea: «Eso no estaba en el guion, Ríos».

### Escenario 3 · FINAL — **La Torre de Transmisión y El Set**

- **Lugar:** la antena del Noticiero de Medianoche reflejada, una torre de acero colgando hacia abajo que se sube como un descenso. Arriba, que en realidad es abajo, flota **El Set**: el estudio del noticiero con su escritorio, cámaras, monitores y el letrero «AL AIRE», todo sobre una plataforma rodeada de agua negra. Detrás, en el cielo, gira La Banca.
- **Ambiente:** silencio, estática y lluvia que se detiene en el aire. Sin música hasta que empieza la pelea; después, `music-boss` (coro, re armónica, 140 bpm).
- **Hitos:** credenciales 5 y 6 («Perdón»). **Cinemática 2** al entrar a El Set y **pelea final**.

---

## 7. El jefe final: Juan Carlos Bodoque

**Nombre en la barra de vida:** `JUAN CARLOS BODOQUE`. Subtítulo opcional: `EL ÚLTIMO TITULAR`.

**Forma de pelea (64×64):** el mismo Bodoque, pero el Reverso le cobra el viaje mientras pelea. El pelaje rojo aparece mojado y apelmazado. Las costuras de su cuerpo se abren y dejan ver **luz magenta** dentro, como si estuviera relleno de neón. Las orejas, tiesas como antenas de televisión, chisporrotean. Su gabardina de reportero está hecha jirones y su ficha marcada, incrustada en el pecho, tiene una grieta que late. El micrófono vintage se convierte en arma: un **mazo** con el cable como látigo.

**Fases** (propuesta para basti; los eventos ya existen: `boss:phase {phase}`, `enemy:hit`, `enemy:killed`):

| Fase | Nombre | Vida | Idea | Ataques (todos con windup legible) |
|---|---|---|---|---|
| 1 | **«La Nota»** | 100–66 % | Bodoque todavía actúa como reportero. Se burla y presenta la pelea como una transmisión. | **Micrófono-mazo:** golpe vertical con windup de 500 ms, parryable. **Flash de cámara:** destello en cono que hay que esquivar con dash o mirando hacia otro lado. **«Última hora»:** se lanza en línea recta con un cartel de titular por delante. |
| 2 | **«La Apuesta»** | 66–33 % | Se le acaban las bromas. Invoca el Hipódromo: el escenario se llena de carriles. | **Carrera:** tres caballos espectrales cruzan por carriles marcados en el suelo con un número, y el carril seguro es el que Bodoque **no** grita. **Boletos:** lanza boletos de apuesta que caen como cuchillas. **Cobradores:** invoca dos cobradores. |
| 3 | **«Sin Señal»** | 33–0 % | La ficha se rompe y Bodoque se vuelve estática roja. Es desesperación pura. | **Robo de tiempo:** si el Luchador usa Parar el tiempo, Bodoque **sigue moviéndose a la mitad de velocidad** durante 1 s, porque es tiempo de La Banca y él también tiene crédito. Hay que usarlo con cabeza. Contra el Mago, absorbe la primera alma de cada ráfaga. **Traspasar:** desaparece en los monitores y sale por otro. **Cable-látigo:** barrido horizontal que se salta con doble salto. |

**Cierre:** al llegar a 0 de vida, Bodoque cae de rodillas sobre el escritorio del noticiero. La ruleta de La Banca deja de girar con un **clac**. La ficha de su pecho se rompe en dos y, por primera vez en once años, **empieza a llover hacia abajo**. Bodoque mira a Ríos y no dice nada. El agua se lo lleva hacia el cielo. → `enemy:killed {kind: 'boss'}` → créditos (el flujo «jefe → créditos» ya existe en `ui/index.ts`).

---

## 8. Cinemática 1 — «La Nota» (inicio del juego, 10 s)

**Cuándo:** al elegir JUGAR en el escenario 1 (partida nueva), entre el título y `GameScene`. Se puede saltar con ESC o ENTER.
**Objetivo:** presentar a Bodoque como mentor encantador, dar la misión, mostrar la ficha marcada y plantar **una sola** pista del giro.
**Audio:** lluvia constante. Primera frase del saxo de `music-title` a volumen bajo. Narrador con la voz de `vo-title` (TTS «onyx» con eco). La voz de Bodoque debe ser **una voz TTS genérica**, grave y con tono de locutor. No imitar ni clonar la voz del actor original.

### 8.1 Guion (timeline)

| Tiempo | Plano | Qué pasa | Audio y texto |
|---|---|---|---|
| **0.0–2.0 s** | **P1 · Plano general, picado suave.** La calle del título de noche y con lluvia. El letrero vertical de neón magenta parpadea. Al fondo, en un edificio, una ventana encendida con el rótulo «NOTICIERO DE MEDIANOCHE». | La cámara baja despacio hacia la ventana (*push-in*). | Lluvia y saxo. **NARRADOR:** «En Aguacero, todo se apuesta.» |
| **2.0–4.0 s** | **P2 · Interior, plano medio.** La oficina de Bodoque: persianas que proyectan rayas de luz azul, humo de café, máquina de escribir, recortes de prensa en la pared y un boleto de hipódromo clavado con chinche. Bodoque, de espaldas, mira la lluvia por la ventana con las orejas recortadas a contraluz. | Bodoque se gira lentamente hacia cámara con una sonrisa cansada. | Trueno lejano. |
| **4.0–6.5 s** | **P3 · Primer plano del escritorio, cenital.** La mano roja y afelpada de Bodoque desliza una carpeta con el sello «EXCLUSIVA». Encima va una foto de un charco en el que se ve **otra ciudad, boca abajo**, y una ficha de casino **magenta** con un ojo grabado. | La ficha gira sobre sí misma y se detiene con el ojo hacia arriba. | **BODOQUE:** «Una nota más, Ríos. La última. Cruza el charco y tráeme la verdad.» |
| **6.5–8.0 s** | **P4 · Contraplano.** Ríos en silueta (sombrero, gabardina, bufanda turquesa) con el reflejo de la ventana en el ala del sombrero. Toma la ficha y la aprieta en el puño. | Un brillo magenta se escapa entre sus dedos. | Zumbido grave muy corto, el «sonido de La Banca». |
| **8.0–8.7 s** | **P5 · Inserto rápido (pista).** Bajo el escritorio, la otra mano de Bodoque sostiene un **boleto de apuesta**. Solo se ve un fragmento: `N.º 7 · NO VUELVE`. | Dura menos de un segundo. Quien lo vio, lo vio. | Clic de ficha de casino. |
| **8.7–10.0 s** | **P6 · Calle, plano bajo a ras del agua.** El zapato de Ríos pisa un charco. El reflejo no salpica: **se traga** la imagen hacia abajo y la ciudad se da vuelta. | Corte a negro con onda magenta. Aparece el título «I · LOS BAJOS DEL MUELLE». | *Splash* invertido (sonido de agua en reversa) y silencio. |

### 8.2 Producción con video IA

**Herramientas posibles:** cualquier modelo de video con **imagen a video** (primer fotograma fijo), por ejemplo Sora, Veo, Kling o Runway. **No generéis los 10 s de una vez:** generad **6 clips cortos** (uno por plano, 1,5–3 s) a partir de un fotograma inicial generado como imagen, y montadlos. Así los personajes no cambian de cara entre planos.

**Flujo recomendado:**
1. Generar las **hojas de referencia** de Bodoque y Ríos (8.2.1) con `gpt-image` (ya se usa en el repo para el título).
2. Generar el **fotograma inicial** de cada plano usando la hoja como imagen de referencia.
3. Pasar cada fotograma a imagen a video con el prompt de movimiento.
4. Montar en un editor (o con ffmpeg), poner el audio y exportar a **960×540, 24 fps, H.264/WebM**.
5. Decidir el acabado. **Opción A:** reducir a 480×270 con la paleta de 24 colores, como el arte del título, para que se integre con el juego. **Opción B:** dejarlo en alta definición como «película dentro del juego», con barras negras. Recomendada: **A**, para que todo el juego tenga el mismo aspecto.

**Aviso práctico:** muchos generadores rechazan nombres de personajes con derechos (Juan Carlos Bodoque es de *31 minutos*, de Aplaplac). En los prompts **se describe al personaje** y no se nombra. Para una demo de hackatón el homenaje sirve, pero si el juego se publica fuera de la hackatón hay que revisarlo.

#### 8.2.1 Bloques fijos (pegar al principio de cada prompt)

**STYLE (video y fotogramas):**
```
Neo-noir animated film still, rainy night city, 1940s-meets-1980s aesthetic, heavy rain streaks,
wet reflective surfaces, limited palette: midnight blue #1a1033, deep violet #2b1a4f, neon magenta #d0148c,
cold cyan #7fd6e0, rain white #c9d4ff, accent blood red #c4223a only on the rabbit.
Strong chiaroscuro, venetian-blind light stripes, volumetric haze, film grain, anamorphic 2.39:1 framing
inside a 16:9 frame, shallow depth of field. Moody, serious, cinematic.
```

**BODOQUE (referencia de personaje):**
```
An anthropomorphic RED rabbit made of soft felt-like plush fabric, puppet-like proportions,
very long upright ears, large expressive eyes, a tired charming half-smile, a seasoned TV news reporter.
Wears a worn beige reporter trench coat over a loosened tie, a press badge on the lapel.
Holds a vintage chrome ribbon microphone with a round grille. Red fur slightly damp from rain.
```

**RÍOS (referencia de personaje):**
```
A slim androgynous figure in a soaked blue-grey trench coat with a raised collar, a teal scarf,
and a short-brimmed fedora casting the eyes in shadow; a lanyard press badge reading "PRENSA".
Face mostly hidden, silhouette-first design. Calm, determined posture.
```

**FICHA MARCADA:**
```
A glossy neon-magenta casino chip with an engraved stylized open eye in the center, faint inner glow.
```

**NEGATIVO (si el modelo lo admite):**
```
no text artifacts, no extra limbs, no cartoon slapstick, no bright daylight, no green or yellow tones,
no logos, no watermark, no modern smartphones
```

#### 8.2.2 Prompts por plano

| Plano | Fotograma inicial (imagen) | Movimiento (video) | Duración |
|---|---|---|---|
| P1 | `[STYLE] High-angle wide shot of a narrow rainy noir street at night, brick buildings, fire escapes, a tall vertical magenta neon sign, puddles reflecting neon. In the background a lit office window with a small glowing sign "NOTICIERO DE MEDIANOCHE".` | `Slow camera push-in and tilt down toward the lit window, rain falling steadily, neon sign flickering twice.` | 2,0 s |
| P2 | `[STYLE] [BODOQUE] Interior of a cramped 1940s newsroom office at night, venetian blinds casting blue stripes, typewriter, steaming coffee, newspaper clippings pinned on the wall, a horse-racing ticket pinned with a thumbtack. The red rabbit stands with his back to camera looking out the rainy window, long ears in silhouette.` | `The rabbit slowly turns his head and shoulders toward the camera, revealing a tired charming half-smile; rain shadows slide across the room.` | 2,0 s |
| P3 | `[STYLE] [FICHA MARCADA] Top-down close-up of a wooden desk. A red plush rabbit hand slides a manila folder stamped "EXCLUSIVA" toward camera. On top: a black-and-white photo of a puddle reflecting an upside-down city, and the magenta casino chip.` | `The hand slides the folder forward; the casino chip spins on its edge and settles with the engraved eye facing up, glowing softly.` | 2,5 s |
| P4 | `[STYLE] [RÍOS] Medium shot, reverse angle, the figure in backlight from the window, rain reflections on the hat brim. Their gloved hand closes around the magenta chip.` | `The hand closes into a fist; magenta light leaks between the fingers; slight camera push-in.` | 1,5 s |
| P5 | `[STYLE] Extreme close-up under the desk, dark, a red plush rabbit hand holding a horse-racing betting slip; legible fragment "N.º 7 · NO VUELVE".` | `Almost still; the fingers tighten slightly on the slip. Very short.` | 0,7 s |
| P6 | `[STYLE] Ground-level shot at water height on the rainy street, a shoe about to step into a puddle that mirrors a neon city upside-down.` | `The shoe steps in; instead of splashing, the reflection swallows the image downward and the whole frame inverts, ending in black with a magenta ripple.` | 1,3 s |

**Texto en pantalla:** los modelos de video escriben mal. El rótulo `N.º 7 · NO VUELVE`, la carpeta «EXCLUSIVA» y el título del escenario se añaden **en montaje** (o en Phaser) con la fuente Silkscreen del juego, no en el prompt.

### 8.3 Plan B: cómic animado

Si el video sale mal (caras que cambian, manos raras, movimiento gomoso), la cinemática se hace como **cómic en movimiento**: una página de 6 viñetas que la cámara recorre en 10 s, con viñetas que entran, zoom suave y texto en bocadillos.

**Estilo del cómic** (bloque fijo para cada viñeta, en vez de STYLE):
```
Dynamic modern superhero comic book panel, bold black ink linework with varied line weight,
visible halftone Ben-Day dot shading, slight CMYK offset misregistration, flat cel colors with
hatched shadows, noir rainy night, limited palette: midnight blue, deep violet, neon magenta,
cold cyan, rain white, blood red only on the rabbit. Dramatic angles, speed lines where motion occurs,
printed-paper texture. No speech balloons, no lettering (added later).
```
Referencia para humanos: cómic de superhéroes moderno y la estética de «cómic impreso» de las películas animadas recientes (puntos de trama, desfase de color, líneas cinéticas). En los prompts se usan las descripciones de arriba y nunca nombres de obras ni de artistas.

**Maquetación de la página** (lienzo 1920×1080; se muestra a 480×270 y la cámara recorre viñetas ampliadas):

```
┌──────────────────────────────┬─────────────┐
│ V1 calle (ancha, 2/3)        │ V2 Bodoque  │
│                              │  se gira    │
├─────────────┬────────────────┴─────────────┤
│ V3 cenital  │ V4 Ríos aprieta la ficha     │
│ escritorio  │       (ancha)                │
├─────┬───────┴──────────────────────────────┤
│ V5  │ V6 el charco traga la imagen         │
│ mini│  (sangra hasta el borde inferior)    │
└─────┴──────────────────────────────────────┘
```

| Viñeta | Tiempo | Composición y prompt (añadir el bloque de estilo) | Texto (se rotula después) | Efecto en el juego |
|---|---|---|---|---|
| **V1** | 0,0–1,8 s | Plano general picado de la calle noir con lluvia, letrero vertical magenta y una ventana encendida con el rótulo del noticiero. Lluvia dibujada como trazos diagonales blancos. | **Cartela del narrador** (caja amarilla pálida con borde negro): «EN AGUACERO, TODO SE APUESTA.» | La cámara entra desde arriba con *ken burns* lento hacia la ventana. |
| **V2** | 1,8–3,6 s | Bodoque de tres cuartos girándose desde la ventana, rayas de persiana sobre el pelaje rojo, sonrisa cansada y orejas que cortan la viñeta por arriba. | — | La viñeta aparece con *wipe* lateral y una gota de lluvia cruza el borde. |
| **V3** | 3,6–5,8 s | Vista cenital del escritorio: la mano roja desliza la carpeta «EXCLUSIVA», la foto del charco con la ciudad invertida y la ficha magenta girando con líneas de movimiento circulares. | **Bocadillo de Bodoque:** «UNA NOTA MÁS, RÍOS. LA ÚLTIMA.» · **Segundo bocadillo:** «CRUZA EL CHARCO. TRÁEME LA VERDAD.» · Onomatopeya: «TIC-TIC-TIC» junto a la ficha. | Zoom hacia la ficha con *pop* de los bocadillos uno tras otro. |
| **V4** | 5,8–7,6 s | Ríos de perfil a contraluz, con el puño cerrado del que sale luz magenta en rayos de trama. | Onomatopeya pequeña: «vmmm» en magenta. | La viñeta tiembla un poco al cerrar el puño (`shake` corto, respetando el ajuste de vibración). |
| **V5** | 7,6–8,4 s | Viñeta diminuta y oscura bajo el escritorio con la mano roja y el boleto `N.º 7 · NO VUELVE`. | — | Aparece **un instante** y se desatura. Es la pista. |
| **V6** | 8,4–10,0 s | Zapato pisando el charco a ras del agua. El reflejo se curva hacia abajo como un remolino y la ciudad del reflejo está invertida. La viñeta **sangra** hasta el borde de la página. | Onomatopeya grande invertida: «HSSPLASH» escrita **al revés**. | La cámara cae dentro de V6, la imagen se voltea 180° y hay fundido a negro. Título del escenario. |

**Rotulación:** bocadillos blancos con contorno negro de 2 px y letra Silkscreen o Barlow Condensed (ya están en `public/assets/ui/fonts`) **en mayúsculas**. Las cartelas del narrador van en cajas rectangulares. Las onomatopeyas van en magenta con contorno negro. Todo el texto se pone en Phaser o en un editor, nunca en el prompt.

---

## 9. Cinemática 2 — «La Última Apuesta» (final del juego, 10 s)

**Cuándo:** al entrar a **El Set** (escenario 3), justo antes de la pelea final. Termina en la barra de vida del jefe (`boss:phase {1}`) y con `music-boss`.
**Objetivo:** confirmar el giro (Bodoque es el villano y quería a Ríos muerto), explicar en una frase por qué viene en persona y mostrar su transformación.
**Audio:** sin música al principio. Estática de televisión, un teléfono que deja de sonar y la lluvia **suspendida** (un drone agudo). La entrada de Bodoque golpea con `sfx-boss-roar` y arranca el coro de `music-boss`.

### 9.1 Guion (timeline)

| Tiempo | Plano | Qué pasa | Audio y texto |
|---|---|---|---|
| **0.0–1.8 s** | **P1 · Plano general de El Set.** El estudio del noticiero flota sobre agua negra, con el escritorio vacío, cámaras de estudio apagadas y un muro de monitores con estática. Arriba, en el cielo, gira lenta una **ruleta gigante con un ojo** (La Banca). Las gotas de lluvia están **quietas en el aire**. Ríos entra por la izquierda en contraluz. | El letrero «AL AIRE» se enciende en **rojo**. | Estática y un zumbido. El letrero se enciende con un clac. |
| **1.8–3.8 s** | **P2 · Muro de monitores, plano medio.** Todos los monitores pasan a la vez de estática a la **cara de Bodoque**, en ángulos distintos. Ya no sonríe. | Bodoque mira a cámara (a Ríos) desde 12 pantallas. | **BODOQUE (por los altavoces):** «Tenías que quedarte allá abajo, Ríos.» |
| **3.8–5.6 s** | **P3 · Montaje relámpago, 3 insertos de 0,6 s.** (a) Seis **credenciales de PRENSA** ardiendo en llamas magenta. (b) El boleto de hace once años, «EL FAVORITO», firmado por Bodoque. (c) La ficha del pecho de Bodoque, **agrietada**. | Cortes secos al ritmo de tres golpes de bombo. | **BODOQUE:** «Aposté todo a eso. Hasta mi alma.» |
| **5.6–7.6 s** | **P4 · El monitor central, primer plano.** La pantalla del centro se **abomba como agua** y Bodoque la **atraviesa** saliendo del reflejo (Traspasar). Al salir crece hasta el triple de su tamaño: las costuras se abren con luz magenta, las orejas se vuelven antenas con chispas y la gabardina se rompe. | Las gotas suspendidas **caen todas de golpe**. | `sfx-boss-roar` y vidrio líquido. |
| **7.6–9.0 s** | **P5 · Contrapicado, Bodoque domina el plano.** Apoya el micrófono convertido en mazo sobre el escritorio del noticiero, que se parte. La ruleta de La Banca se detiene detrás de su cabeza como un halo. | Mira hacia abajo, hacia Ríos. | **BODOQUE:** «Si quieres que algo salga bien… lo cubres tú mismo.» |
| **9.0–10.0 s** | **P6 · Plano de Ríos, a la altura de los ojos.** Ríos levanta el arma (espada u Hoja del eclipse) con la ficha brillando en el puño. | Corte a la pantalla de juego: barra «JUAN CARLOS BODOQUE · EL ÚLTIMO TITULAR». | Entra el coro de `music-boss` (140 bpm). |

### 9.2 Producción con video IA

Mismo flujo que en 8.2: un clip por plano a partir de fotogramas fijos y montaje. Se reutilizan los bloques STYLE, RÍOS y FICHA MARCADA. Para el jefe se añade:

**BODOQUE CORRUPTO:**
```
The same red plush rabbit, now three times larger and monstrous but still recognizable: felt fur soaked
and matted, seams split open leaking bright neon-magenta light from inside as if stuffed with neon,
long ears rigid like old TV antennas crackling with sparks, reporter trench coat in tatters,
a cracked glowing magenta casino chip with an engraved eye embedded in his chest,
his vintage chrome microphone grown into a heavy mace with its cable coiled like a whip.
Expression: desperate fury, not cartoon evil.
```

**LA BANCA (fondo):**
```
In the sky behind, a colossal ornate roulette wheel slowly turning, its ball replaced by a single
glowing cyan eye, half-hidden by dark clouds; rain droplets frozen mid-air across the whole scene.
```

| Plano | Fotograma inicial (imagen) | Movimiento (video) | Duración |
|---|---|---|---|
| P1 | `[STYLE] [LA BANCA] Wide shot of a TV news studio set floating on black water in an upside-down city: empty anchor desk, unlit studio cameras, a wall of CRT monitors showing static, an "AL AIRE" sign. A lone figure [RÍOS] enters from the left in silhouette.` | `Rain droplets hang motionless; the "AL AIRE" sign snaps on in red; the roulette in the sky turns slowly; subtle camera dolly right.` | 1,8 s |
| P2 | `[STYLE] [BODOQUE] Medium shot of a wall of twelve CRT monitors; each screen shows the red rabbit reporter's face from a different angle, serious, no smile, scanlines and chromatic aberration.` | `All screens flick from static to his face simultaneously; his eyes shift to look straight at camera.` | 2,0 s |
| P3a | `[STYLE] Close-up of six press badges "PRENSA" burning in magenta flames on wet asphalt.` | `Flames flare, badges curl.` | 0,6 s |
| P3b | `[STYLE] Close-up of an old horse-racing betting slip reading "EL FAVORITO", signed in ink, rain-stained.` | `Slip trembles slightly.` | 0,6 s |
| P3c | `[STYLE] [FICHA MARCADA] Extreme close-up of the magenta casino chip embedded in red plush fur, a crack spreading across the engraved eye.` | `The crack spreads; light pulses inside.` | 0,6 s |
| P4 | `[STYLE] Close-up of the central CRT monitor bulging outward like a water surface, a red plush hand pushing through the glass.` | `[BODOQUE CORRUPTO] The rabbit pushes through the liquid screen and grows to three times his size; seams split with neon light; frozen raindrops all fall at once.` | 2,0 s |
| P5 | `[STYLE] [BODOQUE CORRUPTO] [LA BANCA] Low-angle shot, the giant corrupted rabbit dominates the frame, the microphone-mace resting on a cracked news desk, the roulette wheel stopped behind his head like a halo.` | `He slams the mace down; the desk splits; he leans forward, looking down at camera.` | 1,4 s |
| P6 | `[STYLE] [RÍOS] Eye-level medium shot, the figure raises a sword, magenta glow from the fist holding the chip, rain pouring down now.` | `Hero raises the blade into guard; quick push-in; hard cut.` | 1,0 s |

### 9.3 Plan B: cómic animado

Se usa el mismo bloque de estilo de cómic que en 8.3, pero la página es **más rota**: viñetas en diagonal y con bordes agrietados, porque el mundo se está rompiendo.

```
┌───────────────────────────────────────────┐
│ V1 El Set y la ruleta (panorámica)        │
├──────────────┬──────────────┬─────────────┤
│ V2 monitores │ V3a  │ V3b   │ V3c ficha   │
│ (12 caras)   │ PRENSA│BOLETO│ agrietada   │
├──────────────┴──────╲───────┴─────────────┤
│ V4 Bodoque atraviesa  ╲  V5 contrapicado  │
│    la pantalla         ╲   (gigante)      │
├─────────────────────────╲─────────────────┤
│ V6 Ríos en guardia (tira estrecha)        │
└───────────────────────────────────────────┘
```

| Viñeta | Tiempo | Composición (añadir el bloque de estilo) | Texto | Efecto en el juego |
|---|---|---|---|---|
| **V1** | 0,0–1,8 s | Panorámica de El Set flotando, gotas quietas dibujadas como puntos blancos, la ruleta con el ojo en el cielo y Ríos pequeño a la izquierda. | Onomatopeya: «KLAK» junto al letrero «AL AIRE» rojo. | *Pan* lento de izquierda a derecha. |
| **V2** | 1,8–3,6 s | Cuadrícula de 12 monitores con la cara seria de Bodoque, bordes de pantalla con trama de líneas. | **Bocadillo dentado (voz electrónica):** «TENÍAS QUE QUEDARTE ALLÁ ABAJO, RÍOS.» | Las caras aparecen pantalla por pantalla en 300 ms. |
| **V3a–c** | 3,6–5,4 s | Tres viñetas estrechas: credenciales ardiendo, boleto «EL FAVORITO» y la ficha agrietada en el pecho. | **Bocadillo:** «APOSTÉ TODO A ESO.» · **Bocadillo:** «HASTA MI ALMA.» | Cada viñeta golpea con un *punch zoom* de 0,6 s. |
| **V4** | 5,4–7,4 s | Bodoque saliendo del monitor como de un charco, con salpicaduras de vidrio líquido, costuras abiertas con luz magenta y líneas cinéticas radiales. | Onomatopeya enorme: «SKRRRAAASH». | La viñeta **se rompe** (efecto de grieta sobre el borde) y `shake`. |
| **V5** | 7,4–9,0 s | Contrapicado de Bodoque gigante, el mazo sobre el escritorio partido y la ruleta detenida como halo. | **Bocadillo:** «SI QUIERES QUE ALGO SALGA BIEN… LO CUBRES TÚ MISMO.» | Zoom hacia su cara y el ojo de la ficha destella. |
| **V6** | 9,0–10,0 s | Tira estrecha: los ojos de Ríos bajo el ala del sombrero y el filo de la espada reflejando el rojo. | — | Corte a blanco de 2 fotogramas y aparece la barra del jefe. |

---

## 10. Epílogo (opcional, no es cinemática)

Si sobra tiempo, antes de los créditos, se muestran **tres cartelas fijas** sobre la calle del título, ya sin lluvia, con el narrador:

1. «La Banca no perdió. La casa nunca pierde.»
2. «Solo cambió de deudor.»
3. Primer plano de una portada de periódico en un charco: **«DESAPARECE JUAN CARLOS BODOQUE»**, firmada por Ríos. Así Ríos ha escrito su primera nota de verdad.

---

## 11. Integración por dominio (propuestas, cada dueño decide)

| Dominio | Qué propone este lore | Contrato existente que se usa |
|---|---|---|
| **seba** (pantallas y audio) | Escena `CinematicScene`, que reproduce un video o recorre las viñetas del cómic con tweens, se salta con ESC y ENTER y al terminar arranca la escena siguiente con `scene.start`, sin evento nuevo. Cinemática 1 entre el título y GameScene cuando `newGame && stage === 1`. Cinemática 2 al recibir `room:entered` con el `roomId` de El Set. Voces nuevas `vo-cine1-*` y `vo-cine2-*` (nueva `VoiceKey` = cambio `shared`, va en su propio commit). Nombre «JUAN CARLOS BODOQUE» en la barra del jefe. | `VoiceKey`, `boss:phase`, flujo jefe → créditos en `ui/index.ts` |
| **vicho** (mundo) | Los tres escenarios (Los Bajos del Muelle, El Hipódromo Hundido, La Torre y El Set), teléfonos como checkpoints, lluvia que sube como partículas y la ruleta de La Banca como capa de parallax en el escenario 3. Al entrar a El Set, emitir `room:entered` con un `roomId` acordado (por ejemplo `set`) para lanzar la cinemática 2. | `checkpoint:reached`, `room:entered {roomId, zone}`, `zone:changed` |
| **basti** (combate y enemigos) | Charcos (`slime`), Cobradores (`knight`, el windup es «repartir»), El Favorito (`miniboss`, embestidas en carril) y Bodoque como jefe final de 3 fases (sección 7). La espada flotante es el arma del enviado n.º 4. | `enemies.json`, `boss:phase`, `enemy:killed`, `player:parry` |
| **alejandro** (personaje e ítems) | Las clases como pasados (Luchador y Mago), la ficha marcada como origen de Parar el tiempo, el lore de los 4 ítems y las credenciales de los enviados como coleccionables en los cofres ocultos. Sprite de Ríos (gabardina, sombrero, bufanda turquesa). | `classes.json`, `items.json`, `chest:opened {hidden}` |

**Ruta de los assets de las cinemáticas:** `public/assets/ui/cinematics/cine1/` y `cine2/` (dominio de seba), con `cine1.webm` o las viñetas `v1.png…v6.png` y `layout.json` (posición, tiempo y efecto de cada viñeta).
