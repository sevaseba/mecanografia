# Manos sobre el teclado, con aspectos para elegir

**Pedido (2026-10-09):** las manos actuales "no parecen manos". Ponerlas apoyadas sobre el teclado y, en infantil, poder elegir su aspecto.

**Decisiones del usuario:**
- Manos **apoyadas sobre el teclado** (la punta de cada dedo sobre su tecla de la fila guía), como en los programas clásicos.
- Aspectos para infantil: **Superhéroe, Animal, Monstruo, Robot**.
- Mano "normal" (adultos y por defecto en infantil) con **5 tonos de piel**.
- Se eligen **en el perfil** (con vista previa) **y en el paso 1 de la guía** ("Elegí tus manos").
- (2026-10-10) **Dos ubicaciones a elegir:** "Abajo del teclado" (**por defecto**: las manos nuevas en una franja debajo, sólidas; el dedo en uso se ilumina y se inclina un poco hacia su tecla, sin estirarse) o "Sobre el teclado" (translúcidas, el dedo se estira hasta la tecla). Ajuste `settings.handsPlacement` junto a `settings.hands`.
- (2026-10-10) Aspectos infantiles: Telaraña, Armadura, Tigre, Brillos, Robot (rehecho: panel con núcleo y circuitos, bisagras en los dedos) y Monstruo (aprobado). **Elefante se quitó.** Los dibujos internos también son translúcidos (40 % sobre el teclado, 80 % abajo), con líneas finas.
- (2026-10-10) Sobre el teclado: piel al 7 % (dedo en uso 18 %), disfraces 12 % (tigre 18 %), contornos al 50 % y **uñas translúcidas** (40 %), para que siempre se lean las letras.

## Diseño

### Geometría: manos que se arman solas sobre cualquier distribución

- Nuevo módulo `js/keyboard-geometry.js`: centro de cada tecla en unidades de tecla (x, fila), calculado desde `layout.rows`. Reemplaza el cálculo privado de `keyAbove` en `hands-intro.js` y lo usa la vista de manos.
- Cada dedo es una forma ahusada con la punta redondeada, que va de su **base** (fija, en el borde de la palma) a su **punta** (la tecla). La palma y la muñeca quedan debajo de la fila inferior; los pulgares, sobre la barra espaciadora.
- **El dedo se estira hasta la tecla.** Si la tecla a presionar no es la de la fila guía, la punta se mueve a esa tecla y el dedo se alarga y gira desde su base (con una transición corta; sin animación si `prefers-reduced-motion`). Por ejemplo, para la R el índice izquierdo se estira de la F a la R, y para Mayús el meñique va hasta Mayús. Muestra el movimiento real, no solo qué dedo usar.
- Manos semitransparentes para que se lean las teclas; el dedo activo opaco, con contorno y pulso; los demás atenuados (igual que hoy).

### El color del dedo se mantiene en todos los aspectos

Las indicaciones infantiles dicen "con el dedo rosa": la **punta de cada dedo va pintada con el color de su dedo** (rosa, amarillo, verde, azul; pulgar gris) en cualquier aspecto (uña pintada, punta del guante, almohadilla, punta metálica). El resto de la mano lleva el aspecto elegido.

### Aspectos (`js/hand-skins.js`, datos + adornos SVG)

| id | Nombre | Para | Aspecto |
|---|---|---|---|
| `tone-1` … `tone-5` | Mano (5 tonos) | todos | piel de clara a oscura, contorno suave, nudillos |
| `hero` | Superhéroe | infantil | guante de color, puño en la muñeca, estrella en el dorso |
| `animal` | Animal | infantil | pelaje naranja, mechones en los bordes, uñitas |
| `monster` | Monstruo | infantil | verde con manchas y garras |
| `robot` | Robot | infantil | metálico con remaches y dedos segmentados |

- Ajuste nuevo `settings.hands` (por defecto `tone-3`). Esquema **v4** con migración. Un perfil adulto con un aspecto infantil (por haber cambiado de modo) se ve con `tone-3`.
- Selector `js/hands-picker.js`: grupo de radios accesible con vista previa en miniatura de cada aspecto (adultos: solo los tonos). Se usa en el formulario del perfil y en el paso 1 de la guía ("Tus dedos" pasa a ser "Elegí tus manos" + la leyenda de colores; para adultos queda igual pero con el selector de tonos).

### Pantallas

- `hands-view.js` se reescribe: superpone las manos al teclado (`createHandsView(keyIndex)` dentro del mismo contenedor que el teclado), misma API `show(targets)` + `setSkin(id)`.
- Práctica y guía: desaparece la fila de manos debajo del teclado; queda un margen para palmas y muñecas, así que **el teclado puede crecer**. Actualizar la regla de orden vertical en `CLAUDE.md`.
- Sigue siendo `aria-hidden`: el texto del dedo y el lector de pantalla no cambian.

## Riesgo principal y cómo lo controlamos

Dibujar manos lindas en SVG a mano es lo difícil. Por eso el **primer paso es un prototipo** del dibujo (mano normal + un aspecto infantil sobre el teclado, con un dedo estirándose), que se mira en capturas **antes** de construir el resto.

## Tareas

- [x] 1. Prototipo: `keyboard-geometry.js` + dibujo de la mano normal sobre el teclado, dedo que se estira → capturas para aprobar el estilo
- [x] 2. Los 5 tonos y los 4 aspectos infantiles → capturas para aprobar
- [x] 3. `settings.hands` (esquema v4, migración, pruebas)
- [x] 4. `hands-picker.js` en el formulario del perfil y en el paso 1 de la guía
- [x] 5. Integrar en práctica y guía (nuevo cálculo de tamaños, sin fila de manos), reduced motion
- [x] 6. `sw.js` (archivos nuevos + versión), `CLAUDE.md`
- [x] 7. Verificación: `node --test`; navegador infantil y adulto, es-latam y en-us, claro y oscuro, 1366×641 sin scroll, teclas con Mayús/Alt Gr/tecla muerta (dedos estirándose), consola sin errores

## Revisión

- Esquema v4: `settings.hands` (tone-3) y `settings.handsPlacement` (`below`), con migración y pruebas (73 pasan).
- `hands-overlay.js` pasó a ser `hands-view.js` y reemplazó al pictograma; estilos en `css/hands.css`. Teclado y manos van juntos en `.keyboard-board`; `--hands-units` (adulto 2,2 / infantil 2) reserva el lugar de las manos, así que el teclado tiene casi el mismo tamaño que antes.
- Abajo del teclado se muestra desde las puntas de los dedos hasta un poco de palma, escalado a la franja; sobre el teclado se recorta bajo el teclado (las muñecas se desvanecen).
- Selector (`hands-picker.js`): grupos de radios con ícono (emoji) y nombre; en la guía, compacto (solo íconos) dentro del panel del paso 1, que crece a 11,5rem en ese paso.
- Verificado en el navegador: guía y teclado libre, infantil y adulto, claro y oscuro, es-latam y en-us, abajo y sobre el teclado, cambio en vivo desde la guía guardado en el perfil, formulario del perfil (los disfraces se ocultan en adulto), migración de un perfil v3 real, 1366×641 sin scroll, consola sin errores.
- Pendiente de mirar: en infantil, el paso 1 de la guía deja el teclado más chico (teclas de ~36 px en 1366×641) por el lugar del selector.
