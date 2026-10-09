# Posición de las manos (introducción guiada)

**Pedido:** que lo primero que enseñe la app sea la posición de los dedos en el teclado.

**Decisiones del usuario (2026-10-09):**
- Guía **interactiva por pasos** (avanza presionando las teclas pedidas).
- Se muestra **automáticamente la primera vez**, antes de la primera lección; después queda accesible desde el mapa.
- Alcance: **fila guía + zona de cada dedo** (sin consejos de postura).

## Diseño

### Pasos de la guía

1. **Tus dedos** — manos con cada dedo en su color: "Cada dedo tiene un color. Las teclas del mismo color se presionan con ese dedo." → botón *Siguiente*.
2. **La fila guía** — se iluminan las 8 teclas de la fila guía y los 8 dedos; los índices destacados. "Apoyá los índices sobre F y J: tienen un relieve que se siente con el dedo. Los demás dedos van al lado. Los pulgares descansan sobre la barra espaciadora." → *Siguiente*.
3. **Probá cada dedo** (interactivo) — de a una: a s d f j k l ñ (en-us: `;`) y espacio, con la tecla y el dedo iluminados como en la práctica. Tecla equivocada: aviso suave (nunca negativo en infantil), no avanza.
4. **La zona de cada dedo** (interactivo) — para cada dedo (meñique izq. → meñique der.) se ilumina toda su zona de teclas y se pide *ir y volver*: la tecla de arriba de su zona y otra vez la de la fila guía (por ejemplo `e` → `d`). Enseña que el dedo siempre vuelve a casa.
5. **¡Listo!** — "Ya sabés dónde va cada dedo." → *Empezar la lección* (o *Volver al mapa* si se abrió desde el mapa).

Siempre visible un botón *Saltear* (marca la guía como vista). Contador "Paso N de 5".

Las teclas se identifican por `KeyboardEvent.code` (posición física), no por el carácter: lo que importa es el dedo y el lugar, y así funciona aunque el SO tenga otra distribución.

### Datos de la distribución (sin conocimiento hardcodeado)

- Nuevo campo en el contrato de `js/layouts/*.js`: `homeRow` = códigos de la fila guía de meñique izquierdo a meñique derecho (`['KeyA', …, 'Semicolon']`). Se documenta en el encabezado de `es-latam.js`.
- Las zonas salen del `finger` de cada tecla (ya existe). La "tecla de arriba" de cada dedo = la tecla de su zona en la fila superior a la fila guía que está en la misma columna (o la primera de su zona en esa fila).
- Relieves = teclas de la fila guía de los índices (L2 / R2), derivado.

### Módulos

- `js/hands-intro.js` (lógica pura, con pruebas): `buildIntroSteps(keyIndex)` → lista de pasos `{ id, kind: 'info'|'keys', keys: [code…], zone? }`; `targetsFor(keyIndex, code, zoneCodes)` → targets para `keyboard-view` / `hands-view`.
- `js/hands-intro-view.js` (UI): teclado + manos + panel del paso; usa `attachKeyboardInput` (solo `onKey`). Expone `{ element, focus, destroy }` y llama `onDone()` / `onSkip()`.
- `js/guidance.js`: nuevo rol `zone` en `ROLE_RANK` (el menos urgente) + estilos en `css/keyboard.css` (tecla en el color suave de su dedo, sin pulso).
- `js/screens/hands-intro.js`: ruta `#/posicion-de-las-manos` (desde el mapa; al terminar vuelve al mapa).
- `js/screens/lesson.js`: si el curso de esta distribución no tiene `introCompletedAt`, muestra la guía antes del primer ejercicio y al terminar/saltear arranca la lección.
- Progreso: `profile.progress[layoutId].introCompletedAt` (ISO). Por distribución, igual que el resto del curso; no cambia el esquema (el objeto de progreso es libre), sin migración.
- `js/screens/lessons-map.js`: enlace "Posición de las manos" arriba de las unidades.
- `js/strings.js`: textos nuevos en `strings.handsIntro` (voseo).
- `css/hands-intro.css`: todo en un viewport, como la práctica (1366×641).
- `sw.js`: agregar los 3 archivos nuevos y subir `CACHE_VERSION`.
- `CLAUDE.md`: documentar la guía, la ruta, `homeRow` e `introCompletedAt`.

## Tareas

- [x] `homeRow` en `es-latam.js` y `en-us.js` + documentación del contrato
- [x] `js/hands-intro.js` + `tests/hands-intro.test.js` (pasos para ambas distribuciones, teclas existentes con dedo, ida y vuelta por dedo)
- [x] Rol `zone` en guidance + CSS de teclado y manos
- [x] `js/hands-intro-view.js` + `css/hands-intro.css` + strings
- [x] Ruta `#/posicion-de-las-manos` y enlace en el mapa
- [x] Integración en `lesson.js` (primera vez por distribución)
- [x] `sw.js` (precache + versión) y `CLAUDE.md`
- [x] `node --test` en verde
- [x] Verificación en navegador (servido local): infantil y adulto, es-latam y en-us, saltear, repetir desde el mapa, 1366×641 sin scroll, consola sin errores, foco y anuncios

## Revisión

- Hecho según el diseño. Ajustes durante la verificación:
  - En "Probá cada dedo" la fila guía queda contorneada mientras se ilumina la tecla actual (si no, se perdía la referencia).
  - El panel ocupa el ancho del escenario, no el del teclado: con el ancho del teclado, en infantil a 1366×641 el texto no entraba y las teclas quedaban de 33 px. Ahora: infantil 45 px, adulto 47 px, sin scroll.
- Pedido durante la implementación: textos distintos por modo. Infantil usa frases cortas ("Apretá la tecla que brilla.", "Estirá el dedo y volvé a tu lugar."); adulto conserva la explicación completa.
- Arreglo aparte: `css/practice.css` tenía selectores rotos desde d236ac8 (bloques pegados en medio de `.practice-stage:focus-within`, `:not(:focus-within)` e `.is-done`): no aparecía "Hacé clic acá para escribir" y al terminar no se ocultaba la línea de texto. Restaurado y verificado.
- Verificado: `node --test` (62 en verde), recorrido completo infantil es-latam desde la lección 1 (guarda `introCompletedAt` y arranca la lección; al volver no se repite), adulto en-us oscuro desde el mapa con "Saltear", consola sin errores.
- No verificable con automatización: teclas reales del teclado físico (se probaron con `keydown` sintéticos). Conviene probarlo a mano.

## Voz para infantil (2026-10-09)

Pedido: audio opcional para las indicaciones, sobre todo para chicos.
Decisiones: clips grabados (no la voz del navegador), solo modo infantil, prendida por defecto con interruptor y botón "Escuchar".
Se probaron 3 voces de Higgsfield (Marisol, Inés, Elena; ≈1,8 créditos): descartadas, acento "yankee" y voseo mal pronunciado. Primero se eligió Azure `es-AR-ElenaNeural`; después el usuario prefirió usar su cuenta de ElevenLabs (voces rioplatenses de la biblioteca). Las letras sueltas se leen por su nombre en español ("la efe") para que el modelo multilingüe no las lea en inglés.

- [x] `hands-intro-copy.js`: textos por modo, compartidos por la vista y el script
- [x] `voice-clips.js` (frase → archivo) y `voice.js` (reproducción en cola, solo clips del índice)
- [x] `settings.voice` (esquema v3 con migración), interruptor "Voz" y botón "Escuchar"
- [x] `tools/generate-voice.mjs` (ElevenLabs, `--list`, `--force`, borra clips sin uso, escribe el índice)
- [x] Service worker: precache del índice y los clips
- [x] Generar los clips: 33 mp3, 736 KB (el usuario corrió el script con su clave)
- [x] Verificado en el navegador: suenan explicación, "¡Casi!" e indicación por tecla; el service worker precachea los 33 clips + índice (v26); consola sin errores
- [ ] Escuchar la guía completa en infantil y revisar pronunciación

## Dedos por color en infantil (2026-10-09)

Observación del usuario: un chico puede no saber cuál es su dedo anular o mayor.
- [x] Indicaciones infantiles: "Apretá la A con el dedo rosa." (sin mano: la muestra el dibujo; pulgar se mantiene)
- [x] Leyenda de colores con los nombres en el paso "Tus dedos" (ambos modos)
- [x] Prueba: las indicaciones infantiles no usan nombres de dedos ni izquierda/derecha
- [x] Regenerar todos los clips con --force a velocidad 0,95 (33 clips, 672 KB)

## Para más adelante

- **Teclado numérico** (decidido el 2026-10-09 dejarlo para después): sección aparte y optativa, sin afectar el desbloqueo ni las medallas del curso; posición base 4-5-6, luego 7-8-9 / 1-2-3, 0, Entrar y decimal. Ojo con Bloq Num apagado y con el decimal, que depende de la configuración regional (`.` o `,`).
