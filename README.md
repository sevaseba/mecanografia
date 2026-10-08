# Mecanografía

Aplicación web progresiva (PWA) para aprender **mecanografía** —también llamada **dactilografía**—: escribir en el teclado con todos los dedos y sin mirar.

- **Para toda la familia:** cada persona tiene su perfil, con su avatar, su modo y su distribución de teclado.
  - **Modo infantil:** colores alegres, letra grande y redondeada, teclado más grande, ejercicios cortos al principio, estrellas, medallas, confeti y sonidos opcionales. La práctica espera a que se presione la tecla correcta.
  - **Modo adulto:** sobrio, con tema claro u oscuro, palabras por minuto (PPM) y precisión en vivo, y resultados con PPM bruto y neto y errores corregidos y sin corregir.
- **Dos teclados:** Español Latinoamericano (ñ, tildes, diéresis, ¿ ¡) e Inglés (US), cada uno con su curso. Podés cambiar la distribución de tu perfil cuando quieras.
- **Guía visual:** el teclado en pantalla y dos manos dibujadas muestran qué tecla y qué dedo usar.
- **Mi progreso:** PPM y precisión promedio, lecciones aprobadas, racha de días, gráfico de evolución y las teclas que más te cuestan.
- **Sin cuentas ni servidores:** todo se guarda en tu navegador. Podés exportar e importar un respaldo.
- **Funciona sin conexión** una vez abierta por primera vez.

## Instalarla como app

Mecanografía se puede usar directamente en el navegador, pero instalada se abre en su propia ventana y funciona sin internet.

### Windows (Chrome o Edge)

1. Abrí la página de Mecanografía.
2. Tocá el botón **Instalar app** (en la pantalla de perfiles o en tu inicio), o el ícono de instalar que aparece a la derecha de la barra de direcciones.
3. Confirmá con **Instalar**. Vas a encontrarla en el menú Inicio, y podés anclarla a la barra de tareas.

### Android (Chrome)

1. Abrí la página en Chrome.
2. Tocá **Instalar app**, o abrí el menú **⋮** y elegí **Instalar aplicación** (en algunas versiones, **Agregar a pantalla principal**).
3. Confirmá. El ícono aparece junto a tus otras apps.

Para practicar mecanografía en un celular o una tablet hace falta un **teclado físico** (por Bluetooth o USB); con el teclado de la pantalla no se pueden aprender las posiciones de los dedos.

### iPhone y iPad (Safari)

1. Abrí la página en **Safari** (en iPhone, la instalación se hace desde Safari).
2. Tocá el botón **Compartir** (el cuadrado con una flecha hacia arriba).
3. Elegí **Agregar a inicio** y confirmá con **Agregar**.

Igual que en Android, necesitás un teclado físico para practicar.

### Actualizaciones

Cuando hay una versión nueva, la app muestra **"Hay una actualización disponible"**. Tocá **Actualizar** cuando termines lo que estás haciendo.

## Correrla localmente

No hace falta instalar nada con npm. Solo necesitás servir la carpeta con cualquier servidor estático; abrir `index.html` con doble clic no alcanza, porque los módulos de JavaScript y el service worker requieren `http://`.

Con Python:

```
python -m http.server 8000
```

O con Node:

```
npx serve .
```

Después abrí <http://localhost:8000/> en el navegador.

### Pruebas

La lógica (sesiones, estadísticas, perfiles, almacenamiento, cursos y lecciones, detección de teclado, medallas) tiene pruebas que se corren con el runner que ya trae Node, sin dependencias:

```
node --test
```

## Publicación

El sitio son archivos estáticos con rutas relativas, así que se publica tal cual en **GitHub Pages**: en el repositorio, **Settings → Pages → Deploy from a branch**, rama `main`, carpeta `/ (root)`. Queda en `https://<usuario>.github.io/<repositorio>/`.

Antes de publicar una versión nueva, subí `CACHE_VERSION` en `sw.js` para que los usuarios reciban el aviso de actualización.

## Créditos

La fuente del modo infantil es [Nunito](https://github.com/googlefonts/nunito), con licencia SIL Open Font License (`assets/fonts/OFL.txt`).
