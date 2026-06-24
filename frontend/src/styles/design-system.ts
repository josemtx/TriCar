/**
 * ============================================================
 *  DESIGN SYSTEM — Fuente única de verdad (single source of truth)
 * ============================================================
 *
 *  Todas las clases son Tailwind estándar (NO variables CSS).
 *  Cada valor es una cadena lista para copiar/pegar en el JSX.
 *
 *  Importa solo lo que necesites:
 *    import { colors, components, typography } from '@/styles/design-system';
 *
 *  Para combinar clases condicionalmente, usa `clsx` o `cn`:
 *    className={cn(components.card, isActive && stateColors.active.border)}
 * ============================================================
 */

import { twMerge } from 'tailwind-merge';

/* ------------------------------------------------------------
 * 1. PALETA DE COLORES (colores semánticos)
 * ---------------------------------------------------------- */
export const colors = {
  // Fondos
  background: {
    primary: 'bg-black',              // Negro puro — fondo de la app
    surface: 'bg-zinc-900',           // Tarjetas / superficies elevadas
    surfaceSubtle: 'bg-zinc-950/40',  // Elementos menos prominentes
  },

  // Estados y significado (nombres base de la familia de color de Tailwind)
  semantic: {
    primary: 'indigo',   // Acciones principales, focus
    secondary: 'emerald', // Positivos, conducidos, saldos a favor
    alert: 'orange',     // Advertencias, deudas
    error: 'red',        // Errores críticos
    info: 'blue',        // Información neutra
  },

  // Texto
  text: {
    primary: 'text-white',       // Títulos, contenido principal
    secondary: 'text-zinc-400',  // Subtítulos, descripciones
    tertiary: 'text-zinc-500',  // Hints, metadatos
    inverse: 'text-zinc-900',   // Texto sobre fondos claros
  },

  // Bordes (hairlines estilo iOS sobre negro)
  border: {
    primary: 'border-indigo-500/40',
    secondary: 'border-white/10',
    subtle: 'border-white/5',
  },
} as const;

/* ------------------------------------------------------------
 * 2. ESPACIADO ESTANDARIZADO
 * ---------------------------------------------------------- */
export const spacing = {
  // Padding horizontal de contenedores
  containerPadding: 'px-4', // usa 'px-5' para layouts más anchos

  // Separación vertical entre bloques (space-y-*)
  blockSpacing: {
    tight: 'space-y-2',
    normal: 'space-y-3',
    relaxed: 'space-y-4',
    loose: 'space-y-6',
  },

  // Padding interno de tarjetas
  cardPadding: 'p-3', // usa 'p-4' si quieres más aire

  // Gaps entre elementos inline (flex/grid)
  gapTight: 'gap-1.5',
  gapNormal: 'gap-2',
  gapRelaxed: 'gap-3',
} as const;

/* ------------------------------------------------------------
 * 3. TIPOGRAFÍA ESTANDARIZADA
 * ---------------------------------------------------------- */
export const typography = {
  sectionTitle: 'text-2xl font-bold text-white',        // Títulos de sección
  cardTitle: 'text-base font-semibold text-zinc-100',   // Título de tarjeta
  label: 'text-xs font-medium text-zinc-400',           // Labels pequeños
  body: 'text-sm text-zinc-300',                        // Texto de cuerpo
  small: 'text-[11px] text-zinc-500',                   // Metadatos
  micro: 'text-[10px] text-zinc-600',                   // Microtexto
} as const;

/* ------------------------------------------------------------
 * 4. COMPONENTES BASE (clases reutilizables)
 * ---------------------------------------------------------- */
export const components = {
  // Tarjeta base (superficie iOS: gris muy oscuro + hairline blanco)
  card: 'rounded-2xl border border-white/10 bg-zinc-900 p-4 transition-all duration-300 hover:border-white/20',

  // Tarjeta primaria (más destacada: cristal translúcido sobre negro)
  cardPrimary: 'rounded-3xl border border-white/10 bg-zinc-900/70 p-5 shadow-xl shadow-black/40 backdrop-blur-xl',

  // Input base
  input: 'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-all duration-200',

  // Botón base (combínalo con una variante)
  buttonBase: 'rounded-xl transition-all duration-300 font-semibold text-sm',

  // Botón primario (acciones principales)
  buttonPrimary: 'bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 px-4 text-white hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 active:scale-95',

  // Botón secundario (acciones menos prominentes)
  buttonSecondary: 'border border-white/10 bg-white/5 px-3 py-1.5 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20',

  // Badge / chip de estado
  badge: 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
} as const;

/* ------------------------------------------------------------
 * 5. EFECTOS Y TRANSICIONES
 * ---------------------------------------------------------- */
export const effects = {
  glass: 'backdrop-blur-md',                 // Glassmorphism
  transition: 'transition-all duration-200', // Transición estándar
  scaleHover: 'hover:scale-[1.02]',          // Escala hover elástica
  shadowSubtle: 'shadow-lg shadow-black/20', // Sombra sutil
} as const;

/* ------------------------------------------------------------
 * 6. VARIANTES DE COLORES (para estados)
 * ---------------------------------------------------------- */
export const stateColors = {
  // Activo (checkbox, toggle seleccionado, etc.)
  active: {
    border: 'border-indigo-500/50',
    background: 'bg-indigo-500/10',
    text: 'text-indigo-200',
  },

  // Positivo (conductores confirmados, deudas pagadas)
  positive: {
    background: 'bg-emerald-500/10',
    border: 'border-emerald-500/50',
    text: 'text-emerald-300',
  },

  // Neutro / inactivo
  neutral: {
    background: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-zinc-300',
  },

  // Alerta / warning (deudas, advertencias)
  alert: {
    background: 'bg-orange-500/10',
    border: 'border-orange-500/40',
    text: 'text-orange-300',
  },

  // Error crítico
  error: {
    background: 'bg-red-950/40',
    border: 'border-red-900/60',
    text: 'text-red-300',
  },
} as const;

/* ------------------------------------------------------------
 * Helper para unir clases con resolución de conflictos (tailwind-merge).
 * El último valor gana: cualquier className que pases a un componente
 * sobrescribe limpiamente el token base (p. ej. bg, border, padding).
 *   cn(components.card, 'bg-indigo-950/30')  →  gana bg-indigo-950/30
 * Requiere: npm i tailwind-merge
 * ---------------------------------------------------------- */
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  twMerge(classes.filter(Boolean).join(' '));