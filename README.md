# ROADVISION · frontend

Implementación en React (Vite) del prototipo de ROADVISION, con la paleta de marca
cambiada de verde señal a **azul tecnológico**.

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # bundle de producción en dist/
```

## Mapa de la paleta: verde → azul

El acento es **una sola voz de marca**. El rojo, el ámbar y el verde azulado siguen
reservados en exclusiva para severidad: no decoran nada.

| Rol | Antes (verde) | Ahora (azul) | Dónde se usa |
|---|---|---|---|
| `--acc` | `#C9F24E` | `#2563EB` | ítem activo del sidebar, botón primario, foco, ruta del mapa |
| `--acc-deep` | `#9BC02F` | `#1D4ED8` | hover del primario, bordes del acento |
| `--acc-bright` | — | `#4C8DFF` | glow, caja de detección de la IA, marcador seleccionado |
| `--acc-ink` | `#1A2108` (tinta oscura) | `#FFFFFF` | texto sobre el acento (en Dark/Night se invierte a `#061024`) |
| Serie «baches» | `#0F82AA` | `#2F6BFF` | gráficos de Estadísticas |
| Serie «grietas» | `#7C9C18` | `#7C9C18` (sin cambio) | gráficos de Estadísticas |
| Severidad alta / media / baja | `#D93F32` / `#D9862A` / `#0E9F8A` | sin cambio | insignias, marcadores, alertas |

Los neutros también se enfriaron para acompañar al azul: el lienzo pasa de un gris
cálido (`#F3F4F0`) a uno azulado (`#F1F4F9`), y la tinta de `#131614` a `#0D1420`.

Las dos series de datos están validadas para daltonismo contra la superficie clara y
la oscura (banda de luminosidad, suelo de croma, separación ΔE en protan/deutan/tritan
y contraste ≥ 3:1).

## Estructura

```
src/
  styles/tokens.css     Los tres temas (light · dark · night) como variables CSS
  styles/app.css        Base + todos los componentes del sistema
  theme/ThemeProvider   Tema y «reducir animaciones», persistidos en localStorage
  components/
    Icon.jsx            Set de iconos único (sin emojis en la interfaz)
    AppLayout, Header, Sidebar
    RoadMap.jsx         Mapa vectorial + minimapa + fotograma de evidencia
    charts.jsx          Sparklines, tendencia, barras agrupadas, ranking, densidad
    ui.jsx              Botones, tarjetas, insignias, tabla, modal, paginación…
    Toasts.jsx          Sistema de avisos + simulación de exportación
  data/mock.js          Datos de muestra (sustituir por la API)
  pages/                Login, Dashboard, Mapa, Incidentes, Detalle, Cámaras,
                        Vehículos, Estadísticas, Datos, Reportes, Configuración
```

## Cómo cambiar el tema desde el código

Todo cuelga de `data-theme` en `<html>`: `light`, `dark` o `night`. Ningún componente
lleva colores fijos salvo las miniaturas de tema de Configuración, que deben mostrar
los tres a la vez.

## Notas de implementación

- Los datos son ficticios pero coherentes entre pantallas (147 = 82 baches + 65 grietas,
  23 críticos, 8/10 cámaras). Los nombres de rutas, direcciones y personas son inventados.
- El sidebar se colapsa a 68 px desde el botón del header y muestra tooltips.
- Interacciones reales: búsqueda, filtros, ordenación, paginación, selección múltiple,
  confirmación en modal, avisos de exportación con progreso y cambio de tema.
