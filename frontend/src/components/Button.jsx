import { components, cn } from '@/styles/design-system';

/**
 * Button — botón reutilizable con variantes, tamaños, loading e icono.
 *
 * Props:
 * @param {'primary'|'secondary'|'success'|'danger'|'ghost'} variant  Estilo visual (default 'primary')
 * @param {'sm'|'md'|'lg'} size            Tamaño (default 'md')
 * @param {boolean}        disabled        Deshabilitado
 * @param {boolean}        loading         Muestra spinner + deshabilita
 * @param {React.ReactNode} icon           Icono Lucide opcional (lo pasa el padre)
 * @param {React.ReactNode} children       Contenido del botón
 * @param {string}         className       Clases extra opcionales
 * ...resto: cualquier prop nativo de <button> (onClick, type, aria-label, etc.)
 *
 * Nota de accesibilidad: si el botón es icon-only (sin children), pasa `aria-label`.
 *
 * Ejemplos:
 *   <Button variant="primary" size="md" onClick={handleSubmit}>Crear plan</Button>
 *   <Button variant="secondary" size="sm">Cancelar</Button>
 *   <Button variant="success" icon={<Check size={16} />}>Confirmar</Button>
 *   <Button variant="danger" loading>Eliminando…</Button>
 *   <Button variant="ghost" aria-label="Más opciones" icon={<MoreVertical size={18} />} />
 */

// ── Variantes: SOLO color + efectos (el padding lo controla `size`) ──
// Cada una refleja los tokens del design-system, sin el padding incrustado.
const VARIANTS = {
  primary:
    'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-black/20 hover:opacity-90 hover:scale-[1.02] active:scale-95',
  secondary:
    'border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/20',
  success:
    'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-black/20 hover:opacity-90 hover:scale-[1.02] active:scale-95',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-black/20 hover:opacity-90 hover:scale-[1.02] active:scale-95',
  ghost:
    'bg-transparent text-zinc-400 hover:text-white hover:bg-white/10',
};

// ── Tamaños: padding + tamaño de texto ──
const SIZES = {
  sm: 'py-1.5 px-3 text-xs',
  md: 'py-2.5 px-4 text-sm',
  lg: 'py-3.5 px-6 text-base',
};

// Spinner interno (SVG inline, sin dependencias de iconos)
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  children,
  className = '',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      // base del design-system + variante + tamaño + estados
      className={cn(
        components.buttonBase,
        'inline-flex items-center justify-center gap-2',
        VARIANTS[variant],
        SIZES[size],
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {/* Si hay children, se respetan también durante loading (texto a medida).
          Solo si NO hay children y está cargando se usa "Cargando…" por defecto. */}
      {children ?? (loading ? 'Cargando…' : null)}
    </button>
  );
}