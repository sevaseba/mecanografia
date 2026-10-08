# Mecanografía

Aplicación web progresiva (PWA) para aprender **mecanografía** —también llamada **dactilografía**—: escribir en el teclado con todos los dedos y sin mirar.

- Pensada para toda la familia: cada persona tiene su perfil, en modo **infantil** (lúdico, teclado grande y premios) o **adulto** (sobrio, con foco en palabras por minuto y precisión).
- Soporta teclados **Español Latinoamericano** (ñ, tildes, diéresis, ¿ ¡) e **Inglés (US)**. Podés elegir la distribución en tu perfil y cambiarla cuando quieras.
- Funciona sin conexión una vez instalada.
- No necesita cuentas ni servidores: tu progreso se guarda en tu navegador.

> Estado: en desarrollo inicial.

## Cómo correrla localmente

No hace falta instalar nada con npm. Solo necesitás servir la carpeta con cualquier servidor estático (abrir `index.html` con doble clic no alcanza, porque los módulos de JavaScript y el service worker requieren `http://`).

Con Python:

```
python -m http.server 8000
```

O con Node:

```
npx serve .
```

Después abrí <http://localhost:8000/> en el navegador.

## Publicación

El sitio se publica como archivos estáticos en GitHub Pages, directamente desde la rama `main`.
