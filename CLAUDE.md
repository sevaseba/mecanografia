# Mecanografía — guía del proyecto

PWA para aprender mecanografía (dactilografía), pensada para usar en familia.

## Decisiones fijas

- **Stack:** HTML, CSS y JavaScript puros con ES modules. Sin frameworks, sin bundler, sin dependencias de npm (ni siquiera de desarrollo). Todo se sirve como archivos estáticos desde GitHub Pages.
- **Rutas relativas siempre** (`./js/app.js`, no `/js/app.js`): GitHub Pages sirve el sitio bajo `/<repo>/`, así que una ruta absoluta se rompe.
- **Idioma de la interfaz:** español rioplatense (Argentina), con voseo ("Elegí tu perfil", "Escribí la letra"). Mencionar "mecanografía" y "dactilografía" en la descripción del manifest y en el README.
- **Distribuciones de teclado:** Español Latinoamericano (ñ, tildes, diéresis, ¿ ¡) e Inglés (US). Se elige por perfil y se puede cambiar en cualquier momento.
  - Toda la lógica de teclado (mapa físico de teclas, caracteres por capa, dedo asignado, teclas muertas y sus composiciones) vive en archivos de datos: `js/layouts/es-latam.js` y `js/layouts/en-us.js`.
  - Ningún otro módulo puede tener conocimiento hardcodeado de una distribución. Agregar una distribución nueva = sumar un archivo en `js/layouts/` y registrarlo en `js/layouts/index.js`.
- **Cursos por distribución:** las lecciones se organizan en `lessons/<layout-id>/` (`lessons/es-latam/`, `lessons/en-us/`), cada carpeta con su `index.json` que lista las lecciones en orden. Cada perfil ve solo el curso de su distribución; si cambia de distribución, pasa a ver el otro curso (el progreso se guarda por distribución).
- **Fila guía y orden de introducción de teclas:**
  - Español Latinoamericano: el nivel 1 es la fila guía completa **a s d f j k l ñ** (la ñ es una tecla más de la fila guía, no un caso especial). Tildes, diéresis y los signos ¿ ¡ se introducen en niveles posteriores.
  - Inglés (US): el nivel 1 es **a s d f j k l ;**.
- **Perfiles:** guardados en `localStorage`. Cada perfil tiene nombre, distribución, modo (`kids` = infantil: lúdico, teclado grande, premios / `adult` = adulto: sobrio, foco en PPM y precisión) y su progreso.
- **Offline:** todo funciona sin conexión una vez instalada, vía service worker (`sw.js` en la raíz) con precache de todos los archivos de la app.
- **Accesibilidad:** navegable 100 % por teclado, foco visible, contraste mínimo WCAG AA (4.5:1 texto normal), fuentes generosas (base ≥ 18 px adulto, ≥ 24 px infantil), respetar `prefers-reduced-motion`, regiones `aria-live` para feedback.

## Estructura de carpetas

```
/
├── index.html            # única página; las pantallas se montan desde JS
├── manifest.webmanifest
├── sw.js                 # service worker (debe estar en la raíz por el scope)
├── css/                  # base.css, themes.css (tokens por modo) y un archivo por componente
├── js/
│   ├── app.js            # punto de entrada: arranque y registro del service worker
│   ├── router.js         # navegación por hash (#/...), rutas con parámetros, redirecciones
│   ├── strings.js        # todos los textos de la interfaz
│   ├── dom.js            # helper el() para crear nodos sin innerHTML
│   ├── announcer.js      # anuncios para lectores de pantalla (aria-live)
│   ├── screens/          # una pantalla por módulo (exporta render(container))
│   ├── storage.js        # documento versionado en localStorage, migraciones, respaldo JSON
│   ├── profiles.js       # alta/baja/edición de perfiles, perfil activo, progreso por distribución
│   ├── dialog.js         # confirmación accesible con <dialog>
│   ├── calibration-view.js # prueba opcional de teclado (tecla a la derecha de la L, etc.)
│   ├── input.js          # captura de teclado, teclas muertas, composición
│   ├── keystrokes.js     # carácter ↔ secuencia de teclas físicas según la distribución
│   ├── layout-check.js   # detección de distribución del SO vs. la elegida
│   ├── typing-session.js # estado del ejercicio: texto objetivo, errores, tiempos
│   ├── stats.js          # PPM y precisión
│   ├── guidance.js       # qué teclas y dedos iluminar para el próximo carácter
│   ├── practice-view.js  # pantalla de práctica (teclado libre y lecciones)
│   ├── text-line-view.js # línea única de texto que se desplaza
│   ├── keyboard-view.js  # teclado en pantalla con colores por dedo
│   ├── hands-view.js     # manos en SVG (pictograma) con el dedo a usar iluminado
│   └── layouts/
│       ├── index.js      # registro de distribuciones disponibles
│       ├── es-latam.js
│       └── en-us.js
├── lessons/              # un curso por distribución
│   ├── es-latam/
│   │   ├── index.json    # orden de lecciones del curso
│   │   └── 01-fila-guia.json, ...
│   └── en-us/
│       ├── index.json
│       └── 01-home-row.json, ...
├── tests/                # pruebas de la lógica pura: `node --test` desde la raíz
├── icons/                # íconos de la PWA (192, 512, maskable)
└── assets/               # sonidos, ilustraciones, fuentes
```

## Datos y perfiles

- Todo se guarda en **una** clave de localStorage, `mecanografia`, como documento JSON con `version` (esquema documentado al principio de `js/storage.js`). Para cambiar la forma: subir `SCHEMA_VERSION` y agregar `MIGRATIONS[versiónVieja]`; nunca leer ni escribir localStorage fuera de `storage.js`.
- El progreso va en `profile.progress[layoutId]`: un curso por distribución dentro del mismo perfil.
- Respaldo: `{ app: "mecanografia", type: "backup", exportedAt, data }`. Importar valida, migra y reemplaza todo previa confirmación.
- Pantallas: `#/` elegir perfil (y respaldo; mostrarla deja sin perfil activo), `#/perfiles/nuevo`, `#/perfiles/:id/editar`, `#/inicio` del perfil activo. Las pantallas que necesitan un perfil activo redirigen a `#/`.
- El modo (`data-mode` en `<html>`) y la distribución de la práctica salen del perfil activo.

## Pantalla de práctica

Teclado libre y lecciones usan `practice-view.js`. Reglas de diseño:
- Todo entra en un viewport sin scroll; referencia mínima: notebook de 1366×768 (≈ 1366×641 útiles en Chrome). El tamaño de tecla sale del menor entre ancho y alto disponibles (container query units en `.practice-stage`).
- Orden vertical: franja fina de estadísticas → (aviso de distribución) → línea de texto → teclado → manos → texto corto del dedo. Nada entre la línea de texto y el teclado.
- Una sola línea de texto que se desplaza; lo escrito se desvanece a la izquierda.
- La guía es gráfica: tecla y dedo en el color saturado de su dedo, con contorno y pulso. Mayús/Alt Gr: se iluminan los dos dedos. Tecla muerta: globitos 1 y 2. El texto del dedo es complementario y se oculta en modo infantil.
- Modo infantil: tarjeta grande con el carácter actual a la izquierda de la línea; la franja solo muestra el progreso. Utilidades `.only-adult` / `.only-kids`.
- Errores: en modo infantil la práctica no avanza hasta la tecla correcta (la tarjeta se sacude en rojo); en modo adulto avanza y el error queda marcado. Debajo de cada error se muestra lo que se escribió (`v` bajo `V`). La tecla presionada destella verde o roja en el teclado. El desvanecido de lo escrito es corto: las últimas ~10 letras se ven nítidas.

## Convenciones de código

- **Textos de UI en español**; **nombres de variables, funciones, archivos y comentarios técnicos en inglés**.
- **Un módulo JS por responsabilidad.** Si un módulo empieza a hacer dos cosas, se parte.
- Módulos ES nativos (`import`/`export`), sin variables globales.
- Los textos de la interfaz se centralizan (por ejemplo `js/strings.js`) para mantener consistencia del voseo.
- CSS con custom properties para los temas; nada de estilos inline desde JS salvo valores dinámicos.
- Para identificar teclas físicas se usa `KeyboardEvent.code`. El carácter producido se toma de los eventos `input`/`compositionend` de un textarea oculto (no de `keydown`), porque ahí el sistema ya compuso las teclas muertas (´ + a → á). Ver `input.js`.
- El formato de los archivos de distribución está documentado al principio de `js/layouts/es-latam.js`.
- `navigator.keyboard.getLayoutMap()` (solo Chromium) devuelve únicamente la capa base, y las teclas muertas como su carácter de espaciado (`BracketLeft` → `´` en es-latam), nunca `"Dead"`. Verificado en Chrome 153 / Windows.
- Cuando se agrega o renombra un archivo de la app, actualizar la lista de precache en `sw.js` y subir su versión de caché.

## Regla de verificación

La lógica pura (sesión, almacenamiento, perfiles, detección de distribución) tiene pruebas en `tests/`, que se corren con `node --test` desde la raíz (Node viene con su propio runner, sin dependencias). Correrlas antes de cada commit.

Ninguna tarea se da por terminada sin abrir `index.html` **servido localmente** (no con `file://`, porque los ES modules y el service worker no funcionan así) y comprobar el cambio en el navegador, revisando también la consola sin errores. Por ejemplo:

```
python -m http.server 8000
```

y abrir <http://localhost:8000/>. Si el cambio toca el service worker, probar también con la red desactivada en DevTools.
