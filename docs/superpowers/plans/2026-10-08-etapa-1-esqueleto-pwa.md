# Etapa 1 — Esqueleto de la PWA

Objetivo: una app instalable que abre sin conexión, con temas infantil/adulto y navegación por pantallas, sin funcionalidad de mecanografía todavía.

- [x] `index.html` con `lang="es-AR"`, enlace de salto, `<main>` y región `aria-live`
- [x] `manifest.webmanifest` (nombre, descripción con mecanografía/dactilografía, rutas relativas, íconos)
- [x] Íconos 192, 512 y 512 maskable + `icon.svg` fuente
- [x] `css/base.css` (tokens, tipografía, foco visible, reduced motion) y `css/themes.css` (`data-mode="kids" | "adult"`)
- [x] `js/strings.js`, `js/router.js` (hash, foco al título al cambiar de pantalla), `js/app.js`
- [x] `js/screens/home.js` y `js/screens/not-found.js`
- [x] `sw.js`: precache versionado, limpieza de cachés viejas, cache-first, fallback de navegación a `index.html`
- [x] Verificación: servido local, consola sin errores, SW activo, manifest válido, recarga offline funciona, navegación por teclado, contraste AA en ambos temas

## Revisión

Verificado en Chrome, servido con `python -m http.server` en 127.0.0.1:
- Consola sin errores; SW activo y controlando la página; 17 archivos en `mecanografia-v1`.
- Subir a `v2` instaló la nueva caché y borró la vieja (camino de actualización probado).
- Con el servidor apagado: recarga en `#/no-existe` muestra la pantalla de "no encontrada" con estilos; el botón vuelve al inicio y el foco pasa al `<h1>`; el título del documento se actualiza.
- Tema adulto (claro y oscuro por `prefers-color-scheme`) e infantil (24 px, fondo cálido, bordes redondeados) se aplican con `data-mode`.
- Contraste calculado: todo texto ≥ 6:1, foco ≥ 4.2:1 en los tres temas.
- Primer Tab enfoca el enlace "Saltar al contenido", visible y con contorno.

Pendiente para etapas siguientes: aviso de "hay una versión nueva" (hoy el SW nuevo toma control directo con `skipWaiting`).
