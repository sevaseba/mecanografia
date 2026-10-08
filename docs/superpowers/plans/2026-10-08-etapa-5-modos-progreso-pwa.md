# Etapa 5 — Modos, progreso y PWA

## Decisiones de interpretación

- **"Niveles 1 a 3"** = las tres primeras unidades del curso (Fila guía, Estiramientos, Fila superior). En modo infantil sus ejercicios se recortan a ≤ 40 caracteres, cortando entre palabras.
- **Medallas** (se guardan al ganarse, no se recalculan, para que no se pierdan si se recorta el historial): primera lección aprobada, 5 lecciones aprobadas, una por cada unidad completa ("nivel completo"), racha de 3 días y de 7 días. Se ven en modo infantil (resultados y "Mi progreso").
- **Racha**: días seguidos (hora local) con al menos un intento de lección, en cualquier distribución. Cuenta si el último día es hoy o ayer.
- **Sesión** para "Mi progreso" = intento de lección (el teclado libre no se registra).
- **Teclas con más errores**: por carácter esperado, se acumulan errores e intentos; las 5 peores por tasa de error (mínimo 10 intentos; si no hay datos suficientes, por cantidad de errores).
- **PPM bruto** = caracteres tecleados / 5 / minutos. **PPM neto** = bruto − errores no corregidos / minutos. **Errores corregidos** = errores cometidos que después se borraron; **no corregidos** = los que quedaron en el texto.
- **Tema** (adulto): Automático (sigue al sistema) / Claro / Oscuro, por perfil. **Sonido** (infantil): apagado por defecto, por perfil, con interruptor en la práctica.
- **Fuente redondeada**: Nunito (licencia OFL) guardada en `assets/fonts/` para que funcione sin conexión; `ui-rounded` solo existe en Apple.
- **Actualización**: el service worker nuevo queda en espera; la app muestra "Hay una actualización disponible" y al aceptar se activa y recarga.

## Esquema de datos v2

`profile.settings = { sound: false, theme: 'auto' }`, `profile.medals = { [medalId]: fechaISO }`, y en `progress[layoutId]` se suma `keyStats = { [carácter]: [errores, intentos] }`. Migración 1 → 2 agrega los valores por defecto.

## Tareas

- [x] Esquema v2 con migración; estadísticas (bruto/neto, corregidos/no corregidos, errores por tecla); racha y medallas; recorte a 40
- [x] Infantil: fuente Nunito, teclado más grande, ánimo variado sin mensajes negativos, medallas, confeti, sonidos con interruptor
- [x] Adulto: tema Automático/Claro/Oscuro; resultados con PPM bruto/neto y errores corregidos/no corregidos
- [x] "Mi progreso": PPM y precisión promedio (últimas 10), lecciones aprobadas/total, racha, gráfico SVG de PPM, 5 teclas con más errores en el teclado; selector de distribución
- [x] PWA: aviso de actualización, botón "Instalar app"
- [x] Revisión de accesibilidad; verificación offline y bajo una subruta (como GitHub Pages)
- [x] README con instalación en Windows, Android y iPhone

## Revisión

**Pruebas automáticas:** `node --test` → 51/51 (nuevas: migración v1→v2, ajustes y medallas del perfil, PPM bruto/neto, errores corregidos/no corregidos, errores por tecla, racha, medallas, teclas con más errores, recorte a 40, elección sin repetir).

**En el navegador (Chrome, servido local):**
- Actualización: con la v19 activa se publicó la v20 → apareció "Hay una actualización disponible" (role=status); "Actualizar" activó la v20, recargó y borró la caché vieja.
- Infantil: Nunito cargada desde el sitio; tema oculto en el formulario; sonido apagado por defecto y guardado al activarlo; teclas de 59 px (antes 52) en 1366×641; ejercicios de la lección 1 de 27–37 caracteres; ánimo variado sin repetir; confeti y medalla "Primera lección" al aprobar; resultados sin scroll en 1366×641 (se compactaron, medían 673 px).
- Adulto: tema Oscuro aplicado; sin interruptor de sonido ni confeti; resultados con 1 error corregido y 1 sin corregir.
- Mi progreso: promedios de las últimas 10 sesiones, lecciones aprobadas, racha (4 días con datos de prueba), gráfico SVG con eje de valores enteros, tooltip con mouse y con flechas (anunciado), tabla de datos, 5 teclas con más errores en lista y en el teclado (badge de ranking sin superponer en teclas compartidas, á y a), medallas solo en infantil, selector de distribución.
- Instalar: Chrome ofreció la instalación en localhost y apareció el botón "Instalar app" (no se pulsó para no instalar la app en el equipo).
- Accesibilidad (auditoría por script en todas las pantallas, infantil / adulto oscuro / adulto claro: nombres accesibles, ids, títulos, tabindex, contraste real): se corrigió el contraste de las estrellas vacías (1.98 → color de texto atenuado); queda la estrella llena en adulto claro con 3.64:1, válida para un gráfico (role=img con etiqueta). Además: confeti respeta `prefers-reduced-motion`, interruptor con `aria-pressed`, gráfico enfocable y con tabla.
- Subruta y sin conexión: servida como `/mecanografia/` → scope correcto, 108 archivos en caché sin salir de la subruta, manifest con `start_url`/`scope` relativos, ninguna petición fallida; con el servidor apagado funcionaron inicio, mapa, lección, progreso y teclado libre. Datos y caché de prueba borrados al terminar.

**Errores encontrados y corregidos:** estrellas vacías con bajo contraste; eje del gráfico con "22.5"; badges superpuestos en la misma tecla; resultados infantiles con medalla que requerían scroll; el mismo mensaje de ánimo repetido.

**Pendiente de prueba humana:** escuchar los sonidos (no se pueden oír desde la automatización) y ver PPM reales (las pruebas automáticas escriben demasiado rápido para medirlas).
