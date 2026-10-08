# Etapa 2 — Distribuciones y motor de entrada

Objetivo: datos de teclado por distribución, captura de teclas con teclas muertas, detección de la distribución del sistema y una pantalla de "teclado libre" para probarlo todo.

- [x] Verificar qué devuelve `getLayoutMap()` para las teclas muertas
- [x] `js/layouts/es-latam.js` (ISO) y `js/layouts/en-us.js` (ANSI): filas físicas, caracteres por capa, dedos, teclas muertas y composiciones; registro en `js/layouts/index.js`
- [x] `js/keystrokes.js`: carácter → secuencia de pulsaciones (incluye tecla muerta previa), Mayús en la mano opuesta, Alt Gr
- [x] `js/input.js`: textarea oculto; `keydown` para la tecla física, `input`/`compositionend` para el carácter producido; estado "tecla muerta pendiente"
- [x] `js/typing-session.js`: texto objetivo, aciertos/errores por posición, Borrar
- [x] `js/layout-check.js`: detección por Keyboard Map API + inferencia por ventana deslizante mientras se escribe; aviso de teclado virtual
- [x] `js/keyboard-view.js`: teclado en pantalla con colores por dedo, tecla siguiente y modificadores resaltados, leyenda
- [x] Pantalla `#/teclado-libre`: selector de distribución, dos textos de prueba (español con tildes/diéresis/ñ/¿?, inglés con apóstrofes y punto y coma), verde/rojo por carácter, guía de la tecla siguiente con el paso de la tecla muerta, aviso de distribución con botón para corregir
- [x] Precache del SW actualizado, CLAUDE.md actualizado

## Revisión

**`getLayoutMap()` (Chrome 153, Windows, teclado Latinoamericano KLID 0000080A):** devuelve 48 teclas, solo la capa base. La tecla muerta `BracketLeft` vuelve como `´` (U+00B4), no como `"Dead"`. El resto: `Semicolon`→`ñ`, `Equal`→`¿`, `Quote`→`{`, `Backslash`→`}`, `Minus`→`'`, `Slash`→`-`, `IntlBackslash`→`<`, `Backquote`→`|`. Coincide al 100 % con `es-latam.js`, por lo que la detección compara todas las teclas con carácter base (umbral 95 %).

**Pruebas en el navegador (servido local, consola sin errores):**
- 28 comprobaciones de lógica OK: secuencias de á/É/Ü/¿/¡/ñ/?/@/´/â en es-latam, ' ; : en en-us, ñ/á no escribibles en en-us, ambos textos de prueba escribibles en su distribución, Mayús en la mano opuesta, inferencia (en-us escrito en latam → sugiere es-latam; comilla muerta de US-Internacional → distribución desconocida; Bloq Mayús no cuenta como diferencia; teclado virtual).
- Pantalla con eventos sintéticos: secuencia estilo Windows (`key: "Dead"` + `input`), estilo macOS/Linux (`compositionstart`/`compositionend`), tecla muerta + consonante (`´s` → dos errores), error + Borrar, cambio de distribución y de texto. La guía muestra el paso previo de la tecla muerta y, tras presionarla, la tecla siguiente.
- Aviso cuando la distribución elegida no coincide con la del sistema, con botón "Usar Español Latinoamericano".
- Modo infantil: teclado más grande, colores por dedo y leyenda correctos. Precache con los 28 archivos.

**Pendiente:** prueba con el teclado físico real. Los eventos sintéticos y los de la automatización del navegador no pasan por la distribución del sistema operativo, y no inyecté pulsaciones a nivel de Windows para no arriesgar que vayan a otra ventana.
