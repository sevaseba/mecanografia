# Primeros pasos más claros

Prueba con una persona nueva (adulta):
1. En "Nuevo perfil", "Elegí tus manos" / "Dónde se ven: Abajo del teclado · Sobre el teclado" se leyó como una indicación de dónde poner las manos de verdad, no como el dibujo de la pantalla.
2. Ya con el perfil creado, no supo por dónde empezar: "Fila guía" no le dijo nada y, en adulto, todas las lecciones se ven abiertas por igual.

## Plan

### 1. Manos del perfil: que se entienda que es el dibujo
- [x] `strings.hands`: etiqueta "Manos de la pantalla" (infantil: "Elegí las manos de la pantalla"), con una ayuda debajo: "Un dibujo de manos te muestra qué dedo usar para cada tecla."
- [x] "Dónde se ven" → "Dónde se dibujan".
- [ ] Revisar que el diálogo del paso 1 de la guía siga leyéndose bien con los textos nuevos (pendiente: usa el mismo selector, no lo abrí).

### 2. Inicio: el botón principal empieza la lección
- [x] El botón grande va directo a la lección recomendada (que ya muestra antes la guía "Posición de las manos" la primera vez).
  - Sin lecciones aprobadas: "Empezar" + "Lección 1: f y j".
  - Después: "Seguir" + "Lección N: …". Curso terminado: va al mapa.
- [x] Debajo, enlace "Ver todas las lecciones" al mapa.

### 3. Mapa: explicar la fila guía y marcar el comienzo
- [x] Cada unidad lleva una línea que la explica en palabras simples (`description` en `index.json` de cada curso), p. ej. Fila guía: "La fila del medio, donde descansan los dedos: a s d f j k l ñ."
- [x] La lección recomendada dice "Empezá acá" si todavía no se aprobó ninguna (después, "Seguí acá").
- [x] Adulto: la línea de arriba aclara "Conviene hacerlas en orden; podés saltar a cualquiera."

### Verificación
- [x] `node --test`, `node --check` de los módulos tocados.
- [x] Navegador (1366×641): perfil nuevo adulto e infantil → inicio → empezar → guía → lección; mapa; consola sin errores.
- [x] Subir `CACHE_VERSION` (cambian lecciones y textos); actualizar CLAUDE.md (formato de `index.json`, inicio).

### 4. Pedido extra: "Mi progreso" en el recorrido
- [x] Enlace en el mapa (junto a "Volver al inicio") y en los resultados de cada lección; "Mi progreso" enlaza a su vez a las lecciones. No en la práctica, para no distraer.

## Revisión
- Probado en local con perfiles nuevos adulto e infantil: formulario (ayuda de las manos), inicio ("Empezar · Lección 1" → lección 1 con la guía; después de aprobarla, "Seguir · Lección 2"), mapa (descripciones, "Empezá acá", aviso de orden), resultados con "Mi progreso", consola sin errores.
- Se corrigió de paso el resumen del mapa, que unía dos frases sin punto ("aprobadas Aprobá…").
- `node --test` en verde; `node --check` de los módulos tocados; `CACHE_VERSION` v39.
