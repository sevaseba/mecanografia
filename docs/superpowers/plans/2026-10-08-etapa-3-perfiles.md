# Etapa 3 — Perfiles

Objetivo: perfiles con nombre, avatar, modo y distribución; crear, editar y borrar con confirmación; calibración opcional del teclado; esquema de localStorage versionado, preparado para progreso por distribución y para respaldo JSON.

## Esquema de localStorage

Una sola clave, `mecanografia` (en GitHub Pages el origen `usuario.github.io` es compartido entre repos, así que la clave lleva nombre propio). Un solo documento JSON, para que guardar, migrar y respaldar sean la misma operación:

```json
{
  "version": 1,
  "activeProfileId": "4f1c…",
  "profiles": [
    {
      "id": "4f1c…",
      "name": "Sofi",
      "avatar": "🦊",
      "mode": "kids",
      "layoutId": "es-latam",
      "createdAt": "2026-10-08T15:00:00.000Z",
      "updatedAt": "2026-10-08T15:00:00.000Z",
      "progress": {
        "es-latam": {},
        "en-us": {}
      }
    }
  ]
}
```

- `version`: versión del esquema. Al cargar, `MIGRATIONS[n]` lleva un documento de la versión n a la n+1, en cadena. Un documento de una versión más nueva que la app no se toca.
- `progress[layoutId]`: progreso de ese perfil en el curso de esa distribución. Cambiar de distribución no pierde el progreso de la otra. El contenido lo define la etapa 4.
- Los datos de distribuciones desconocidas se conservan tal cual (compatibilidad hacia adelante).
- Si el JSON guardado está dañado, se guarda una copia en `mecanografia.corrupt` y se arranca vacío.

Respaldo exportado: `{ "app": "mecanografia", "type": "backup", "exportedAt": "…", "data": <documento> }`. Importar valida, migra y **reemplaza** todos los perfiles, previa confirmación.

## Tareas

- [x] `js/storage.js`: carga, guardado, migraciones, normalización, exportar/importar
- [x] `js/profiles.js`: listar, crear, editar, borrar, perfil activo, aplicar modo
- [x] `js/dialog.js`: confirmación accesible con `<dialog>`
- [x] Router con parámetros (`/perfiles/:id/editar`) y redirección
- [x] Pantallas: `#/` elegir perfil (+ respaldo), `#/perfiles/nuevo`, `#/perfiles/:id/editar`, `#/inicio` del perfil activo
- [x] Calibración opcional: tecla a la derecha de la L (ñ vs ;) y tecla a la izquierda de Borrar (¿ vs ¡ vs =, distingue Latinoamericano de España)
- [x] Teclado libre toma distribución y modo del perfil activo
- [x] Pruebas `node --test tests/` para sesión, almacenamiento y perfiles; verificación en el navegador

## Revisión

**Pruebas automáticas:** `node --test` → 26/26 (sesión, almacenamiento: vacío, guardado, copia defensiva, normalización, datos de distribuciones desconocidas, JSON dañado, versión más nueva en solo lectura, sin localStorage, respaldo ida y vuelta, archivos inválidos; perfiles: alta, nombre vacío/repetido, edición conservando progreso, progreso por distribución, borrado del activo, avisos de cambio; calibración e inferencia).

**En el navegador (Chrome, servido local):**
- Sin perfiles: bienvenida con mecanografía/dactilografía, "Crear el primer perfil", exportar deshabilitado.
- Formulario: foco en el nombre, primer avatar libre, distribución detectada del sistema. Nombre vacío → error, `aria-invalid` y foco; nombre repetido (sin importar mayúsculas) → error.
- Calibración: tecla equivocada → "Esa no es"; ñ + ¿ → Español Latinoamericano, con "Usar…" si se había elegido otra; ñ + ¡ → aviso de distribución no soportada (España).
- Crear → `#/inicio` en modo infantil; el documento guardado coincide con el esquema.
- Teclado libre: distribución y modo del perfil (sin selector de distribución); la flecha vuelve a `#/inicio`; el botón del aviso de distribución cambia la distribución del perfil.
- Editar a Adulto + Inglés (US) → tema y texto de práctica cambian.
- Borrar: diálogo con foco en Cancelar; Escape cancela; confirmar borra, muestra el mensaje y lleva el foco al título.
- Respaldo: exportar (interceptado, sin descargar) genera `mecanografia-respaldo-AAAA-MM-DD.json`; importar rechaza no-JSON y no-respaldo con mensajes claros; un respaldo válido pide confirmación y reemplaza.
- Consola sin errores. Los perfiles de prueba se borraron al terminar.

**Errores encontrados y corregidos:** `container.append(null)` escribía "null" en pantalla; la flecha de la práctica volvía al selector (y sacaba el perfil activo) en lugar de al inicio del perfil; el botón deshabilitado no se veía deshabilitado.
