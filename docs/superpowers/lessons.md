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
