---
name: SIGEH - Sistema de Gestión Hotelera
description: Sistema Integral de Gestión Hotelera — serio, confiable, tradicional
colors:
  primary: "#4F46E5"
  primary-hover: "#4338CA"
  primary-light: "#EEF2FF"
  primary-muted: "#C7D2FE"
  success: "#059669"
  success-light: "#ECFDF5"
  warning: "#F59E0B"
  warning-light: "#FEF3C7"
  danger: "#DC2626"
  danger-light: "#FEE2E2"
  neutral-bg: "#F9FAFB"
  surface: "#FFFFFF"
  border: "#E5E7EB"
  border-input: "#D1D5DB"
  text-primary: "#111827"
  text-secondary: "#6B7280"
  text-muted: "#9CA3AF"
  overlay: "rgba(0, 0, 0, 0.5)"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.025em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.1
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  xxl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
    border: "1px solid {colors.border}"
  card-default:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.md}"
    border: "1px solid {colors.border}"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    border: "1px solid {colors.border-input}"
  input-focus:
    border: "2px solid {colors.primary}"
  badge-success:
    backgroundColor: "{colors.success-light}"
    textColor: "{colors.success}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badge-warning:
    backgroundColor: "{colors.warning-light}"
    textColor: "{colors.warning}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badge-danger:
    backgroundColor: "{colors.danger-light}"
    textColor: "{colors.danger}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badge-primary:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
---

# Design System: SIGEH

## 1. Overview

**Creative North Star: "El Mostrador Confiable"**

SIGEH es un sistema de gestión hotelera que abraza su herencia profesional con sobriedad y orden. Cada pantalla comunica confianza a través de la claridad visual: espacios generosos, jerarquía tipográfica predecible y color usado con propósito. No hay concesiones a lo decorativo; cada elemento existe porque cumple una función en la operación diaria del hotel.

El diseño rechaza explícitamente el corporativismo frío — no es un ERP genérico. La personalidad viene del rigor: la tipografía es limpia y legible, los colores son directos y las interacciones son predecibles. El usuario que trabaja en mostrador necesita velocidad y certeza, no sorpresa ni distracción.

**Key Characteristics:**
- Sobriedad como identidad: sin adornos superfluos, sin gradientes decorativos, sin glassmorphism
- Jerarquía clara en cada pantalla: una sola acción primaria, datos a un vistazo
- Consistencia transversal: botones, inputs, badges y tablas se comportan igual en todos los módulos
- Plano por diseño: profundidad comunicada por cambios de tono y color, no por sombras
- El color indigo es la firma visual — contenido, no estridente

## 2. Colors: La Paleta del Mostrador

Una paleta sobria donde el indigo (#4F46E5) actúa como ancla visual. Los colores semánticos (verde, ámbar, rojo) se reservan estrictamente para estados operativos: disponible, reservado, ocupado, mantenimiento. Los neutros grises proporcionan la estructura de fondo, bordes y texto.

### Primary
- **Indigo Profesional** (#4F46E5): Color primario. Botones principales, enlaces activos, headers de módulo, indicadores de selección. Es la firma visual del sistema.
- **Indigo Hover** (#4338CA): Estado hover del primario. Botones y enlaces en interacción.
- **Indigo Tenue** (#EEF2FF): Fondos de badges, filas seleccionadas, notificaciones informativas.
- **Indigo Pálido** (#C7D2FE): Borde de campos enfocados.

### Success
- **Verde Mostrador** (#059669): Check-in, ingresos, habitaciones disponibles. Siempre significa "disponible" o "positivo".
- **Verte Tenue** (#ECFDF5): Fondos de badges de éxito, resúmenes de caja positivos.

### Warning
- **Ámbar Alerta** (#F59E0B): Reservas, saldos pendientes, estados transicionales.
- **Ámbar Tenue** (#FEF3C7): Fondos de badges de reserva, avisos.

### Danger
- **Rojo Precaución** (#DC2626): Mantenimiento, gastos, errores, botones de eliminar. Siempre señala atención requerida.
- **Rojo Tenue** (#FEE2E2): Fondos de badges de error o mantenimiento.

### Neutral
- **Fondo Mostrador** (#F9FAFB): Color de fondo del body. Gris claro que da descanso visual sin ser frío.
- **Superficie Blanca** (#FFFFFF): Cards, modales, dropdowns. Contraste limpio sobre el fondo.
- **Borde** (#E5E7EB): Líneas divisorias, bordes de card, bordes de tabla.
- **Borde Input** (#D1D5DB): Límites de campos de formulario.

### Text
- **Tinta** (#111827): Texto primario. Títulos, celdas, labels. Negro apenas suavizado para lectura cómoda.
- **Tinta Secundaria** (#6B7280): Metadatos, descripciones, textos de ayuda.
- **Tinta Muda** (#9CA3AF): Placeholders, textos deshabilitados, timestamps.

### Overlay
- **Cortina** (rgba(0, 0, 0, 0.5)) + backdrop-blur-sm: Fondo de modales. Suficiente para enfocar la atención sin aislar.

### Named Rules
**La Regla del Color con Propósito.** Verde, ámbar y rojo se usan exclusivamente para estados operativos del hotel. No se usan decorativamente. Si un elemento no comunica un estado, usa indigo o neutros.

## 3. Typography

**Body Font:** System UI Sans (ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif)

**Character:** Sans-serif funcional, sin ambiciones decorativas. La tipografía es vehículo de información, no de expresión. La jerarquía se logra con peso (bold/semibold) y tamaño, no con cambios de familia ni tracking excesivo.

### Hierarchy
- **Display** (800, 30px, 1.1): Números grandes en KPI cards, totales en caja. Uso exclusivo para datos numéricos de alto impacto.
- **Headline** (700, 24px, 1.2): Títulos de vista (Dashboard, Calendario, Caja).
- **Title** (700, 18px, 1.3): Títulos de sección dentro de una vista, headers de modal.
- **Body** (400, 14px, 1.5): Texto corrido, celdas de tabla, descripciones. Máximo 75 caracteres por línea.
- **Label** (600, 12px, 1, 0.025em tracking): Labels de formulario, badges, indicadores de estado. Tracking mínimo para legibilidad.

## 4. Elevation

Profundidad cero en reposo. SIGEH adopta una filosofía plana (flat): no se usan sombras. La jerarquía visual se comunica exclusivamente mediante:
- Color de fondo (blanco sobre gris claro para superficies)
- Bordes (1px solid gray-200 para cards y contenedores)
- Contraste de color (texto más oscuro sobre fondo más claro)

Los modales usan una cortina semitransparente (rgba(0,0,0,0.5) + backdrop-blur-sm) para aislar el contenido sin recurrir a sombras.

## 5. Components

### Buttons
- **Shape:** Rectangular con esquinas suavemente redondeadas (8px radius / rounded-lg).
- **Primary (Indigo):** Fondo indigo (#4F46E5), texto blanco, padding 8px 16px. Hover: fondo indigo-700 (#4338CA). Transiciones suaves (150ms ease).
- **Success (Verde):** Fondo verde (#059669), texto blanco. Para acciones de confirmación (check-in, abrir caja).
- **Danger (Rojo):** Fondo rojo (#DC2626), texto blanco. Para acciones destructivas (eliminar, cerrar caja).
- **Ghost (Outline):** Fondo transparente, borde 1px solid gray-300, texto gray-700. Hover: fondo gray-50. Para acciones secundarias y cancelar.
- **Disabled:** Fondo gray-300, cursor not-allowed. Nunca oculto, siempre visible para indicar indisponibilidad.
- Densidad vertical: `py-2` (8px) en contextos normales, `py-1.5` (6px) en variante small, `py-2.5` (10px) en variante large.

### Badges / Tags de Estado
- **Shape:** Rectangular con esquinas redondeadas (4px radius / rounded), inline-block.
- **Color semántico:** Fondo tenue + texto del mismo color en saturación completa. Ej: badge success = bg-emerald-50 + text-emerald-600.
- **Tipografía:** Label (600, 12px).
- **Variantes:** success (operativo), warning (transicional), danger (problema), primary (informativo).

### Cards / Contenedores
- **Shape:** Rectangular con esquinas redondeadas (12px radius / rounded-xl), borde 1px solid gray-200, fondo blanco.
- **Sin sombras en reposo.** La card se distingue del fondo por el color de superficie y el borde.
- **Padding interno:** 16px (p-4) estándar, 20px (p-5) para contenedores de dashboard.
- **Uso:** Contenedores de módulos, KPIs, listas, tablas. No se anidan cards.

### Inputs / Fields
- **Shape:** Rectangular con esquinas redondeadas (6px radius / rounded-md), borde 1px solid gray-300, fondo blanco.
- **Focus:** Borde 2px solid indigo, sin glow ni sombra exterior.
- **Padding:** 8px vertical (py-2), 12px horizontal (px-3).
- **Disabled:** Fondo gray-100, texto opaco, cursor not-allowed.
- **Error:** (a definir — actualmente usa alert() nativo, no inline validation).

### Modals / Dialogs
- **Container:** Fondo blanco, esquinas redondeadas (16px radius / rounded-2xl), borde 1px solid gray-200.
- **Overlay:** rgba(0,0,0,0.5) + backdrop-blur-sm.
- **Padding interno:** 20px (p-5).
- **Max width:** 32rem (max-w-lg) estándar, hasta 48rem (max-w-3xl) para modales de detalle.

### Tables
- **Header:** Fondo gray-50, texto gray-500 semibold 14px, padding 12px horizontal.
- **Rows:** Borde inferior 1px solid gray-100. Hover: fondo gray-50.
- **Celdas:** Texto gray-700 14px, padding 12px. Alineación izquierda (texto) o derecha (montos).
- **Sin stripes.** Las filas alternan solo por hover.

### Navigation (Tabs)
- **Tab activo:** Fondo indigo-50, texto indigo-700, border-bottom 2px solid indigo.
- **Tab inactivo:** Texto gray-500, hover gray-700 + gray-50.
- **Transición de color suave.**

## 6. Do's and Don'ts

### Do:
- **Do** usar indigo (#4F46E5) como el único color activo primario del sistema.
- **Do** mantener fondos neutros (gray-50 body, white cards) en toda la aplicación.
- **Do** usar colores semánticos (verde, ámbar, rojo) exclusivamente para estados operativos.
- **Do** mantener padding generoso (16px mínimo) dentro de cards y contenedores.
- **Do** usar la tipografía system-ui sin mezclar familias.
- **Do** mantener botoles con texto descriptivo explícito ("Check-In", no "OK").
- **Do** usar border en lugar de sombras para separar superficies.
- **Do** deshabilitar botones (no ocultarlos) cuando una acción no está disponible.

### Don't:
- **Don't** usar sombras en cards o contenedores en reposo. Zero shadow policy.
- **Don't** usar glassmorphism, gradientes decorativos ni fondos con blur salvo en overlays de modal.
- **Don't** anidar cards. Una card nunca contiene otra card.
- **Don't** usar texto gris sobre fondos de color. Si el fondo es tintado, el texto debe ser del mismo tono más oscuro.
- **Don't** usar tipos de letra decorativos ni caros (Inter, system-ui es suficiente y no requiere carga).
- **Don't** usar tracking excesivo (más de 0.05em) en ningún texto.
- **Don't** poner gradientes en texto (background-clip: text). El énfasis se logra con peso y tamaño.
- **Don't** usar bounce, elastic ni curvas de easing llamativas. Transiciones lineales o ease-out suaves únicamente.
- **Don't** copiar el patrón SaaS de "número grande + label pequeño + gradient accent". SIGEH no es una startup, es un sistema hotelero.
