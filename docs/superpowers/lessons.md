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
