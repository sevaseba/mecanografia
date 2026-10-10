# Lecciones aprendidas

## 2026-10-08 — "Siempre se marca rojo"

**Qué pasó:** el usuario reportó que las letras correctas no se pintaban de verde. El registro de eventos de su teclado real mostró que la detección era correcta: los rojos eran errores reales (`v` sin Mayús, `´`+`u` en vez de `¨`+`u`, teclas vecinas). El problema era el feedback: el verde se desvanecía enseguida, el rojo no explicaba qué se había escrito y no había señal en el lugar donde se mira.

**Reglas:**
- Las pruebas con eventos sintéticos validan la lógica, no la experiencia. Antes de cerrar una pantalla de práctica, mirarla mientras se escribe como lo haría alguien que aprende: ¿se entiende qué pasó con cada tecla?
- Para errores "de la misma letra" (mayúscula, tilde distinta), el feedback tiene que mostrar lo que se escribió, no solo marcar en rojo lo esperado.
- Ante un reporte de entrada de teclado, primero capturar los eventos reales (`keydown`/`beforeinput`/`input`/`composition*`) en el navegador del usuario; la automatización del navegador no envía teclas comunes al textarea y no sirve para reproducir.

## 2026-10-08 — Mapa de lecciones duplicado

**Qué pasó:** varios `hashchange` seguidos (navegación rápida) dibujaban el mapa varias veces; cada render esperaba la carga del curso y, al llegar, agregaba las lecciones al contenedor, que ya pertenecía al render siguiente. Solo pasaba en la primera carga del curso, por eso no aparecía al repetir la prueba.

**Reglas:**
- Toda pantalla con trabajo asíncrono devuelve una limpieza que marca "ya salí" y descarta resultados tardíos.
- Al probar algo asíncrono, probar también con la caché en frío (recargar la página), no solo la segunda vez.
- En pestañas en segundo plano Chrome frena los temporizadores: los scripts de prueba no deben esperar por carácter; esperar condiciones, no tiempos.

## 2026-10-09 — Verificando CSS con el service worker activo

**Qué pasó:** después de cambiar `css/hands-intro.css`, las mediciones en el navegador no cambiaban: el service worker (cache-first) seguía sirviendo la copia precacheada al instalarse.

**Reglas:**
- Antes de verificar un cambio en el navegador, desregistrar el service worker y borrar las cachés (`navigator.serviceWorker.getRegistrations()` + `caches.keys()`), y recargar. Repetirlo después de cada cambio de archivos.
- Si una medición "no cambia" después de editar, sospechar primero de la caché.

## 2026-10-09 — "No se ve el botón Demo"

**Qué pasó:** el prototipo `tools/hands-prototype.html` no le cargaba al usuario: en ese puerto ya había un service worker de la app, que respondía a *toda* navegación con `index.html`. En mi navegador funcionaba porque yo había desregistrado el service worker antes de probar.

**Reglas:**
- El service worker solo devuelve la app al navegar a la raíz de la app (o `index.html`); el resto de las páginas del sitio van a la red.
- Antes de decirle al usuario "abrí tal página", probarla en las mismas condiciones que él: con el service worker de la app registrado, no con todo limpio.

## 2026-10-09 — Pantalla en blanco por una variable repetida

**Qué pasó:** al agregar la "próxima estrella" en `lesson.js`, un parámetro nuevo `next` chocaba con una `const next` que ya existía en la misma función. El módulo no cargaba y la lección quedaba en blanco, sin error en la consola de la página. Las pruebas pasaban porque no cargan las pantallas.

**Reglas:**
- Después de tocar cualquier módulo, correr `node --check` sobre todos los `.js` (detecta errores de sintaxis como declaraciones repetidas), no solo `node --test`.
- Si una pantalla queda en blanco sin errores, probar `await import('/js/…')` desde la consola: muestra el error de carga del módulo.

## 2026-10-10 — "No tiene audio" en GitHub Pages

**Qué pasó:** el audio solo se había probado con el service worker desregistrado. Con la app instalada, el service worker respondía los pedidos de audio por partes (`Range`) con el archivo entero (200), y Safari no reproduce eso. Además, en el navegador del usuario seguía activa la versión vieja, esperando que tocara "Actualizar".

**Reglas:**
- Después de verificar con el service worker limpio, repetir la prueba de lo que toque audio, video o caché con el service worker activo, como lo usa la familia.
- El service worker responde 206 a los pedidos con `Range` (función `partial` en `sw.js`).
- Al publicar algo nuevo, recordarle al usuario que toque "Actualizar" en el aviso.

## 2026-10-10 — "Cancelar" en Editar perfil daba 404

**Qué pasó:** el enlace usaba la ruta del router sin `#` (`href: '/inicio'`), así que el navegador salía de la app hacia `/inicio` en el servidor. `navigate()` agrega el `#` solo, pero un `href` no; y en localhost el 404 también aparece, solo que nadie probó ese botón.

**Reglas:**
- Todo `href` interno empieza con `#/` (buscar `href:` en `js/` al agregar enlaces).
- Al verificar un formulario, probar también los botones secundarios (Cancelar, Volver), no solo el envío.

## 2026-10-10 — "La lección nunca comienza" (siempre vuelve a Posición de las manos)

**Qué pasó:** en el navegador del usuario corría la app vieja del service worker (v34, esquema 3), pero los datos ya estaban en esquema 4: alguna carga sin service worker (Ctrl+Shift+R) había corrido la versión nueva y los migró. La app vieja abre datos más nuevos en solo lectura, así que no guardaba nada: ni la guía hecha, ni estrellas. En local no se veía porque siempre se prueba con el service worker limpio.

**Reglas:**
- Ante un error que solo pasa en GitHub Pages, mirar primero el estado del navegador del usuario (versión de `caches.keys()`, `version` de los datos, worker en espera) antes de buscar en el código.
- Un cambio de esquema hace que la app vieja no pueda guardar: por eso, con datos más nuevos, la app se actualiza sola (`outdated` en `pwa.js`).
- No sugerir Ctrl+Shift+R en el sitio publicado: mezcla versiones. Para actualizar, "Actualizar" en el aviso.

## 2026-10-10 — "Fila guía" no se entiende

**Qué pasó:** una persona que nunca estudió mecanografía no supo por dónde empezar: el mapa abría con la unidad "Fila guía" y la guía de las manos tenía un paso con ese título, pero nunca se explicaba. Además, "Tus manos / Dónde se ven" en el perfil se leyó como dónde apoyar las manos de verdad.

**Reglas:**
- Ningún término técnico del oficio (fila guía, PPM sin explicar, etc.) en la interfaz si no se define donde aparece; mejor reemplazarlo por palabras comunes.
- Al nombrar algo que es un dibujo o una opción de la app, decirlo ("de la pantalla"), para que no se lea como una instrucción física.
- Revisar cada pantalla nueva leyéndola como alguien que nunca escribió a máquina.
