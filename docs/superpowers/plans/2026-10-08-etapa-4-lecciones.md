# Etapa 4 — Lecciones

Objetivo: un curso por distribución, con lecciones progresivas, mapa del curso, práctica de varios ejercicios, resultados con estrellas y progreso guardado por distribución.

## Decisiones validadas

- Desbloqueo: infantil en orden (se abre al aprobar la anterior); adulto libre, con la lección recomendada destacada.
- Aprobar: precisión ≥ 90 %. Estrellas: 1★ ≥ 90 %, 2★ ≥ 95 %, 3★ ≥ 98 %. Las PPM se muestran (adulto) pero no condicionan.
- Ejercicios: 3–4 textos fijos por lección + 1 generado al azar en cada intento con las palabras/teclas de la lección.

## Formato

`lessons/<layout>/index.json`: `{ "layout", "units": [{ "title", "lessons": ["01-f-j", …] }] }`
`lessons/<layout>/<id>.json`: `{ "id", "title", "newKeys": [...], "exercises": ["…"], "words": ["…"] }`

- Las teclas permitidas en una lección = espacio + todas las `newKeys` de esa lección y las anteriores (se calcula, no se repite en el JSON).
- `words`: banco para el ejercicio al azar (si tiene pocas palabras, se generan grupos de letras con las teclas nuevas).
- Una prueba verifica que todo texto use solo teclas permitidas y que la distribución pueda escribirlo.

Progreso en `profile.progress[layoutId]`:
`{ lessons: { [id]: { stars, bestAccuracy, bestWpm, attempts, completedAt } }, history: [{ lessonId, date, wpm, accuracy, durationMs }] }` (últimos 200 intentos).

## Tareas

- [x] Contenido: cursos es-latam (fila guía con ñ … tildes, números) y en-us (fila guía con ; … apóstrofos, números)
- [x] `js/course.js`: carga, teclas permitidas, estados (bloqueada/disponible/completada), recomendada, estrellas, registro de intentos
- [x] `js/exercise-generator.js`: ejercicio al azar (RNG inyectable)
- [x] `practice-view`: aviso de fin de ejercicio para encadenar varios
- [x] Pantallas: `#/lecciones` (mapa), `#/lecciones/:id` (práctica + resultados); inicio con "Continuar"
- [x] Service worker: guarda las lecciones listadas en cada `index.json`
- [x] Pruebas: reglas, generador, validación de contenido; verificación en navegador (ambos modos, 1366×641)

## Revisión

**Contenido:** 27 lecciones en es-latam (fila guía con ñ, g h, fila superior, fila inferior, mayúsculas, ; :, ¿ ?, ¡ !, á é, í ó ú, ü, mayúsculas acentuadas, números y símbolos) y 23 en en-us (fila guía con ;, …, apóstrofo y comillas, ? !, :, números y símbolos). Generadas con un script auxiliar fuera del repo y revisadas a mano; los textos de puntuación se reescribieron para no usar tildes antes de enseñarlas, y las lecciones de x/., c/,, z/- y z// tienen ejercicios escritos a mano.

**Pruebas automáticas:** `node --test` → 39/39 (incluye validación de todo el contenido contra teclas permitidas y la distribución, reglas de estrellas y desbloqueo, registro de intentos, generador al azar y estadísticas combinadas).

**En el navegador:**
- Service worker: 52 archivos de lecciones guardados leyendo los índices.
- Infantil: mapa con la 1 recomendada y el resto bloqueado (no enlaces); lección 1 completa → 3★, progreso guardado, foco en "Siguiente lección"; lección 2 con errores → "¡Casi!" 79 %, sin "Siguiente"; el mapa refleja el estado; abrir una bloqueada por URL redirige al mapa; luego aprobada con 97 % → 2★ y "¡Nuevo récord!".
- Adulto (en-us): todo abierto, recomendada la 1, se puede abrir la 17 directamente.
- 1366×641: práctica y resultados sin scroll en ambos modos (los resultados medían 888 px en infantil y se compactaron).
- Consola sin errores; datos de prueba borrados al terminar.

**Error encontrado y corregido:** mapa duplicado/triplicado con navegación rápida en la primera carga del curso (ver `docs/superpowers/lessons.md`).
