# Rediseño de la pantalla de práctica

Objetivo: texto y teclado visibles a la vez en un solo viewport (1366×768 mínimo), con guía gráfica de dedos en lugar de texto.

Decisiones validadas: manos centradas debajo del teclado (índices bajo F y J) para que la vista recorra una sola línea vertical; en modo infantil la tarjeta va a la izquierda de la línea de texto; en modo infantil la franja muestra solo la barra de progreso.

- [x] Pulgares explícitos en los datos (`L1`/`R1`; `T` = cualquiera, para Espacio)
- [x] `guidance.js`: teclas/dedos a iluminar con roles (ahora, mantener, después) y orden 1/2
- [x] `hands-view.js`: manos SVG tipo pictograma, un dedo = una forma, colores por dedo
- [x] `keyboard-view.js`: tecla siguiente en color saturado del dedo + contorno + pulso; globitos 1/2; se quita la leyenda
- [x] `text-line-view.js`: línea única con el carácter actual anclado al 40 %, lo escrito se desvanece
- [x] `stats.js` + tiempos en `typing-session.js`: PPM y precisión en vivo
- [x] `practice-view.js`: franja de estadísticas, aviso de distribución, tarjeta infantil, línea, teclado, manos, texto del dedo (solo adulto), pista completa para lectores de pantalla
- [x] Router: limpieza al salir de una pantalla y respeto del foco que pone la pantalla
- [x] Teclado libre usa la vista; selector temporal "Vista: Adulto/Infantil" hasta que existan perfiles
- [x] Verificación a 1366×641 en ambos modos

## Revisión

Probado en Chrome dentro de un iframe de 1366×641 (la pantalla real tiene escalado de 125 %, así que redimensionar la ventana no daba 1366×768 en CSS):
- Adulto: franja 46 px, línea 81, teclado 865×292 (teclas de 52 px), manos 135, texto del dedo; `scrollHeight` = 641, sin scroll.
- Infantil: tarjeta + línea 120 px, teclado 874×295 (teclas de 53 px), manos 120; sin scroll; PPM, precisión y texto del dedo ocultos.
- Mayús + V: V (índice izq.) y Mayús derecha (meñique der.) iluminadas en teclado y manos.
- ü: antes de la tecla muerta, ¨ con "1" + Mayús izquierda y U punteada con "2" (también en las manos); después, solo U.
- en-us (ANSI): índice izquierdo a 1 px de la F y derecho a 1 px de la J. Aviso de distribución en dos líneas sin generar scroll.
- Final del texto: mensaje y anuncio "¡Terminaste! … PPM · … % de precisión"; Reiniciar vuelve a 0; sin foco aparece "Hacé clic acá para escribir".
- Desde el inicio, el foco queda directamente en el área de escritura. Consola sin errores.

Errores encontrados y corregidos durante la prueba: el escenario medía 0 px de alto cuando el aviso estaba oculto (grilla → flex); la mano derecha estaba corrida una tecla (J está a 3 teclas de F, no 4); los selectores de teclado libre leían `.value` del objeto equivocado (el modo quedaba en "undefined").

No verificado: `prefers-reduced-motion` (no se puede emular desde la página; lo cubre la regla global de `base.css`) y la prueba con el teclado físico real, pendiente desde la etapa 2.

## Ajuste: feedback de aciertos y errores (reporte "siempre se marca rojo")

Diagnóstico con el registro de eventos del teclado real (Chrome, Windows, Latinoamericano): la detección era correcta; los 6 rojos eran errores reales (`v` sin Mayús, `a` por `e`, `ñ` por `l`, `´`+`i` por `p`, `n` por `i`, `´`+`u` = `ú` por `ü`) y los 13 aciertos estaban en verde. Confirma además que las teclas muertas reales llegan como `keydown "Dead"` + `input` con la letra compuesta.

- [x] Desvanecido de lo escrito acotado al 12 % izquierdo (las últimas ~10 letras quedan nítidas)
- [x] Debajo de cada error, lo que se escribió (reemplaza al subrayado ondulado como señal que no depende del color)
- [x] La tecla presionada destella verde (acierto) o roja (error) en el teclado en pantalla
- [x] Modo infantil: no avanza en el error (`type(char, { advanceOnError: false })`); la tarjeta se sacude en rojo. Modo adulto: avanza como antes
- [x] Pruebas de `typing-session` (node:test, 3/3), repetición de la sesión real del usuario en 1366×641, modo infantil sin avance en el error, consola sin errores
