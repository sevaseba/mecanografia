# Revisión de diseño de las pantallas

Pedido: revisar el orden de las secciones, reubicar cuadros, medir fuentes, etc.

## Paso 1: relevamiento (sin tocar código)

- [x] Perfiles de prueba en local (infantil con progreso, adulto); respaldar y restaurar los datos reales.
- [x] Recorrer en 1366×641 (notebook) y 390×664 (celular), infantil y adulto:
      elegir perfil, formulario, inicio, mapa, guía, lección, resultados, progreso, teclado libre.
- [x] Medir en cada una: tamaños de letra, scroll, desbordes.
- [x] Lista de hallazgos con una propuesta por punto, ordenada por impacto.

### Hallazgos (1366×641 salvo que se indique)

1. Resultados infantil: 896 px de alto; "Siguiente lección" queda bajo el pliegue. Dos frases de ánimo seguidas (la del texto y la de la voz).
2. Inicio infantil: 786 px, con scroll; "Mi progreso / Cambiar de perfil / Editar" quedan abajo, fuera de vista. Tarjetas de 864 px a la izquierda, mitad derecha vacía.
3. Mapa: 4223 px (infantil) / 2930 (adulto); la primera lección aparece recién a ~490 px. Fichas de 248 px de alto, en 4 columnas para unidades de 5 (queda 4+1). Título repetido con las teclas ("f y j" + [f][j]). "Bloqueada: primero aprobá la anterior" repetido en cada ficha bloqueada.
4. Mi progreso infantil: las medallas (lo más motivador) están al final, a 1617 px; arriba "PPM promedio" (jerga). El selector de distribución va antes que los números. El fondo amarillo del teclado de errores es más ancho que el teclado.
5. Celular: scroll horizontal en Mi progreso (490 px), Editar perfil (grilla de avatares de 599 px) y Teclado libre (franja de estadísticas de 545 px). Mapa de 8564 px.
6. Tipografía: más de 30 tamaños distintos en el CSS, sin escala; textos de 14–15 px en adulto (resumen del perfil, número/estado de lección, pista de estadísticas, nombre de manos), bajo el mínimo de 18 px.
7. Formulario de perfil: 1401 px en una columna; "Guardar" a 1207 px. Orden: nombre, avatar, modo, tema, manos, ubicación, distribución, prueba de teclado.
8. Elegir perfil: el respaldo (exportar/importar) ocupa media pantalla en la puerta de entrada familiar; tarjetas alineadas a la izquierda.
9. Inicio adulto: no muestra ningún número (PPM, precisión, racha); "Mi progreso" es un link chico.

## Paso 2: el usuario elige qué cambiar

- [x] "todos".

## Paso 3: cambios elegidos, verificados en el navegador

- [x] 6. Escala tipográfica en `themes.css` (`--text-sm` … `--text-display`); h2 en base.css.
- [x] 1. Resultados en dos columnas (resumen + botones | estrellas); infantil con una sola frase (la de la voz); "Ver todas las lecciones" como enlace.
- [x] 2 y 9. Inicio: acciones lado a lado, enlaces junto al saludo, línea de números (`progress-summary.js`, con pruebas).
- [x] 3. Mapa: fichas compactas, 5 por fila, teclas o título (no los dos), candado sin frase, se abre en la lección actual.
- [x] 4. Mi progreso: infantil con medallas primero y textos sin jerga; selector junto al título; marco del teclado a su medida.
- [x] 5. Celular: `fieldset` con `min-width: 0`, barra de práctica y selector que se acomodan.
- [x] 7. Formulario en grupos (dos columnas) con "Guardar" fijo abajo.
- [x] 8. Elegir perfil: tarjetas centradas, respaldo plegado.

## Revisión

Medido en 1366×641 y 390×664, infantil y adulto, consola sin errores, 75 pruebas.
- Sin scroll en notebook: elegir perfil, inicio (los dos modos), resultados, práctica y guía.
- Siguen con scroll (por contenido): mapa (infantil 4223 → 2578 px, adulto 2930 → 1787), Mi progreso, formulario (1401 → 1152 px adulto, con Guardar siempre visible).
- Celular: sin scroll horizontal en ninguna pantalla.
- No se pudieron sacar capturas al final (ventana del navegador oculta): falta la mirada visual del usuario.
