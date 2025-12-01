## Guia de Frontend
### 1. Colores Principales

| Uso | Nombre | Código HEX | Descripción |
|-----|--------|------------|-------------|
| Primario | Tech Indigo | #6366F1 | Color principal de la marca. Usar en el logo, encabezados clave y elementos de navegación activos. Transmite tecnología y confianza. |
| Secundario | Midnight Blue | #1E1B4B | Color de soporte para fondos oscuros, barra lateral (sidebar) y textos de alto contraste. Aporta solidez y profundidad. |
| Acento | Growth Emerald | #10B981 | El color de la acción. Usar en botones de llamada a la acción (CTA) como "Crear Tienda", "Vender", indicadores de éxito y gráficos de ganancias. |
| Fondo | Clean Slate | #F8FAFC | Fondo general de la aplicación. Un tono casi blanco pero con un toque frío para descansar la vista y mantener la limpieza. |

### 2. Guía de Uso Rápida (UI)

**Botones Principales (Primary Button):** Fondo #6366F1 (Indigo) o #10B981 (Emerald) para acciones de conversión. Texto blanco.

**Texto Principal:** #1E1B4B (Midnight Blue) o un gris muy oscuro #1E293B.

**Bordes y Divisores:** #E2E8F0 (Gris claro compatible con el fondo).

**Estados de Alerta:**
- Éxito: #10B981 (El mismo del acento)
- Error: #EF4444 (Rojo suave)
- Warning: #F59E0B (Ámbar)

### 3. Tipografía

**Fuente principal:** Inter (Google Fonts)
**Fallback:** sans-serif

#### Escala de Tamaños

| Elemento | Tamaño (px/rem) | Peso (Font Weight) | Line Height | Uso |
|----------|----------------|-------------------|-------------|-----|
| H1 | 30px (1.875rem) | Bold (700) | 1.25 | Títulos de Página (Dashboard) |
| H2 | 24px (1.5rem) | SemiBold (600) | 1.3 | Subtítulos de sección |
| H3 | 20px (1.25rem) | Medium (500) | 1.4 | Títulos de tarjetas (Cards) |
| Body | 16px (1rem) | Regular (400) | 1.5 | Texto general |
| Small | 14px (0.875rem) | Regular (400) | 1.5 | Etiquetas, metadatos, hints |

#### Reglas de Texto

- **Color:** Nunca usar negro puro (#000000). Usar #1E293B para texto principal y #64748B para secundario.
- **Alineación:** El texto general debe estar alineado a la izquierda. Evitar justify en web.

### 4. UI & Componentes

#### Bordes y Redondeo (Radius)

Para mantener una estética moderna y amigable pero profesional:

- **Tarjetas y Modales:** border-radius: 8px (Tailwind: rounded-lg)
- **Botones e Inputs:** border-radius: 6px (Tailwind: rounded-md)
- **Bordes Sutiles:** Usar #E2E8F0 (border-slate-200) para separar secciones. No usar bordes oscuros a menos que sea un input activo.

#### Sombras (Elevation)

Usamos sombras para dar profundidad, no bordes gruesos:

- **Nivel 1 (Cards, Dropdowns):** box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1) (Tailwind: shadow-sm)
- **Nivel 2 (Modales, Hovers):** box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) (Tailwind: shadow-md)

### 5. Botones e Interacciones

#### Botón Primario (Acción Principal)

- **Fondo:** #6366F1 (Indigo) o #10B981 (Emerald - solo para ventas/crear)
- **Texto:** Blanco
- **Hover:** Oscurecer el fondo un 10%
- **Active:** Escalar 0.98 (efecto click sutil)

#### Botón Secundario (Cancelar, Volver)

- **Fondo:** Transparente o Blanco
- **Borde:** 1px sólido #E2E8F0
- **Texto:** #1E293B (Slate 800)
- **Hover:** Fondo #F1F5F9 (Slate 100)

#### Inputs (Formularios)

- **Estado Normal:** Fondo blanco, Borde #CBD5E1
- **Focus:** Borde #6366F1 (Indigo) + Ring de 2px con opacidad
- **Error:** Borde #EF4444 (Rojo) + Texto de ayuda rojo

### 6. Iconografía

- **Librería Estándar:** Lucide React (Recomendada por su consistencia y peso ligero)
- **Estilo:** Stroke (Línea), no relleno
- **Grosor:** 2px (o 1.5px si el icono es muy grande)
- **Tamaño:** 20px para botones, 24px para navegación

### 7. Espaciado (Spacing System)

Usamos un sistema base de 4px (escala estándar de Tailwind):

- **Padding Pequeño (Botones, Badges):** py-2 px-4 (8px vertical, 16px horizontal)
- **Separación de Elementos (Gap):**
    - Íconos y texto: gap-2 (8px)
    - Inputs en un form: gap-4 (16px)
    - Secciones grandes: gap-8 (32px)

### 8. Accesibilidad (A11y)

- **Contraste:** Todo texto debe ser legible sobre su fondo
- **Etiquetas:** Todos los botones que son solo ícono deben tener un aria-label o title
- **Imágenes:** Todas las etiquetas <img> deben tener atributo alt
