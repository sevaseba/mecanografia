# Velocidad en las estrellas

**Pedido (2026-10-09):** entender cómo se evalúa el avance y si el tiempo influye. Hasta ahora solo contaba la precisión; la velocidad se medía pero no decidía nada.

**Decisión del usuario:** la velocidad cuenta **solo para las estrellas**, nunca para aprobar.

## Reglas

- Aprobar: ≥ 90 % de precisión (sin cambios).
- ★★: ≥ 95 % y la meta de PPM netas de la lección; ★★★: ≥ 98 % y la meta × 1,25.
- Meta por unidad y modo: ninguna en la primera unidad (fila guía); desde la segunda crece linealmente hasta la última. Infantil 5 → 15, adulto 10 → 30.
- Resultados: el adulto ve qué necesita para la próxima estrella (precisión y PPM); el chico, una frase positiva (más cuidado primero, después más velocidad).
- Las estrellas ganadas antes no se pierden.

## Tareas

- [x] `speedTargets`, `starsFor({ accuracy, wpm }, targets)`, `nextStar` en `course.js` + pruebas
- [x] `recordAttempt` usa las metas
- [x] Pantalla de resultados (adulto y infantil) + textos
- [x] `CLAUDE.md`
- [x] Verificación en navegador: adulto 100 % a 6 PPM → ★ y "necesitás 95 % y 10 PPM"; infantil 100 % a 5 PPM → ★★ y "probá un poquito más rápido"; consola sin errores

## Explicación de las estrellas (pedido posterior)

- [x] `starGoals(result, targets)`: qué pide cada estrella y qué faltó (`nextStar` se deriva de ahí) + prueba
- [x] Resultados: lista "¿Cómo se ganan las estrellas?" con las tres estrellas, el requisito de la lección y "✓ ¡Conseguida!" o lo que faltó. Infantil: "Acertá el 95 % y escribí 5 palabras por minuto" / "Te falta un poquito de velocidad". Reemplaza la frase suelta de "próxima estrella".
- [x] Verificado en navegador: infantil (94 %, lento) y adulto oscuro (97 %, 32 PPM), consola sin errores

## Revisión

Un error de carga (variable `next` repetida en `lesson.js`) dejó la lección en blanco; lo detectó la prueba en el navegador, no `node --test`. Ver `lessons.md`.
