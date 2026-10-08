# Lecciones aprendidas

## 2026-10-08 — "Siempre se marca rojo"

**Qué pasó:** el usuario reportó que las letras correctas no se pintaban de verde. El registro de eventos de su teclado real mostró que la detección era correcta: los rojos eran errores reales (`v` sin Mayús, `´`+`u` en vez de `¨`+`u`, teclas vecinas). El problema era el feedback: el verde se desvanecía enseguida, el rojo no explicaba qué se había escrito y no había señal en el lugar donde se mira.

**Reglas:**
- Las pruebas con eventos sintéticos validan la lógica, no la experiencia. Antes de cerrar una pantalla de práctica, mirarla mientras se escribe como lo haría alguien que aprende: ¿se entiende qué pasó con cada tecla?
- Para errores "de la misma letra" (mayúscula, tilde distinta), el feedback tiene que mostrar lo que se escribió, no solo marcar en rojo lo esperado.
- Ante un reporte de entrada de teclado, primero capturar los eventos reales (`keydown`/`beforeinput`/`input`/`composition*`) en el navegador del usuario; la automatización del navegador no envía teclas comunes al textarea y no sirve para reproducir.
