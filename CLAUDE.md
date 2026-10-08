# Mecanografía — guía del proyecto

PWA para aprender mecanografía (dactilografía), pensada para usar en familia.

## Decisiones fijas

- **Stack:** HTML, CSS y JavaScript puros con ES modules. Sin frameworks, sin bundler, sin dependencias de npm (ni siquiera de desarrollo). Todo se sirve como archivos estáticos desde GitHub Pages.
- **Rutas relativas siempre** (`./js/app.js`, no `/js/app.js`): GitHub Pages sirve el sitio bajo `/<repo>/`, así que una ruta absoluta se rompe.
- **Idioma de la interfaz:** español rioplatense (Argentina), con voseo ("Elegí tu perfil", "Escribí la letra"). Mencionar "mecanografía" y "dactilografía" en la descripción del manifest y en el README.
- **Distribuciones de teclado:** Español Latinoamericano (ñ, tildes, diéresis, ¿ ¡) e Inglés (US). Se elige por perfil y se puede cambiar en cualquier momento.
  - Toda la lógica de teclado (mapa físico de teclas, caracteres por capa, dedo asignado, teclas muertas y sus composiciones) vive en archivos de datos: `js/layouts/es-latam.js` y `js/layouts/en-us.js`.
  - Ningún otro módulo puede tener conocimiento hardcodeado de una distribución. Agregar una distribución nueva = sumar un archivo en `js/layouts/` y registrarlo en `js/layouts/index.js`.
- **Perfiles:** guardados en `localStorage`. Cada perfil tiene nombre, distribución, modo (`kids` = infantil: lúdico, teclado grande, premios / `adult` = adulto: sobrio, foco en PPM y precisión) y su progreso.
- **Offline:** todo funciona sin conexión una vez instalada, vía service worker (`sw.js` en la raíz) con precache de todos los archivos de la app.
- **Accesibilidad:** navegable 100 % por teclado, foco visible, contraste mínimo WCAG AA (4.5:1 texto normal), fuentes generosas (base ≥ 18 px adulto, ≥ 24 px infantil), respetar `prefers-reduced-motion`, regiones `aria-live` para feedback.

## Estructura de carpetas

```
/
├── index.html            # única página; las pantallas se montan desde JS
├── manifest.webmanifest
├── sw.js                 # service worker (debe estar en la raíz por el scope)
├── css/                  # estilos: base, temas (infantil/adulto), componentes
├── js/
│   ├── app.js            # punto de entrada, router de pantallas
│   ├── storage.js        # acceso a localStorage (perfiles y progreso)
│   ├── profiles.js       # alta/baja/edición de perfiles
│   ├── input.js          # captura de teclado, teclas muertas, composición
│   ├── layout-check.js   # detección de distribución del SO vs. la elegida
│   ├── typing-session.js # motor de ejercicio: texto objetivo, errores, avance
│   ├── stats.js          # PPM, precisión, historial
│   ├── keyboard-view.js  # teclado en pantalla con dedos y resaltado
│   └── layouts/
│       ├── index.js      # registro de distribuciones disponibles
│       ├── es-latam.js
│       └── en-us.js
├── lessons/              # lecciones en JSON, por distribución
├── icons/                # íconos de la PWA (192, 512, maskable)
└── assets/               # sonidos, ilustraciones, fuentes
```

## Convenciones de código

- **Textos de UI en español**; **nombres de variables, funciones, archivos y comentarios técnicos en inglés**.
- **Un módulo JS por responsabilidad.** Si un módulo empieza a hacer dos cosas, se parte.
- Módulos ES nativos (`import`/`export`), sin variables globales.
- Los textos de la interfaz se centralizan (por ejemplo `js/strings.js`) para mantener consistencia del voseo.
- CSS con custom properties para los temas; nada de estilos inline desde JS salvo valores dinámicos.
- Para identificar teclas físicas se usa `KeyboardEvent.code`; para el carácter producido, `KeyboardEvent.key` (ver `input.js`).
- Cuando se agrega o renombra un archivo de la app, actualizar la lista de precache en `sw.js` y subir su versión de caché.

## Regla de verificación

Ninguna tarea se da por terminada sin abrir `index.html` **servido localmente** (no con `file://`, porque los ES modules y el service worker no funcionan así) y comprobar el cambio en el navegador, revisando también la consola sin errores. Por ejemplo:

```
python -m http.server 8000
```

y abrir <http://localhost:8000/>. Si el cambio toca el service worker, probar también con la red desactivada en DevTools.
