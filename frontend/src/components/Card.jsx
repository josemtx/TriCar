import { components, typography, stateColors, effects, cn } from '@/styles/design-system';

/**
 * Card — contenedor de tarjeta base con variantes y secciones opcionales.
 *
 * Props:
 * @param {'default'|'primary'|'info'|'alert'|'success'|'error'} variant  Estilo (default 'default')
 * @param {string}          title         Título opcional
 * @param {string}          subtitle      Subtítulo opcional
 * @param {React.ReactNode} children      Contenido principal
 * @param {React.ReactNode} footer        Pie opcional
 * @param {boolean}         interactive   Añade hover/escala si true
 * @param {string}          className     Clases extra (para sobrescribir)
 * ...resto: props nativos del <div> (onClick, role, etc.)
 *
 * Ejemplos:
 *   <Card title="Panel de control" subtitle="Ranking de equidad" variant="primary" interactive>
 *     …contenido…
 *   </Card>
 *
 *   <Card variant="alert">
 *     <p>Empate técnico — hay que sortear</p>
 *   </Card>
 */

// Variantes coloreadas construidas sobre stateColors (base estructural común).
const COLORED_BASE = 'rounded-2xl border p-3 transition-all duration-300';

const VARIANTS = {
  // default y primary vienen tal cual del design-system
  default: components.card,
  primary: components.cardPrimary,
  info: cn(COLORED_BASE, stateColors.active.background, stateColors.active.border),
  alert: cn(COLORED_BASE, stateColors.alert.background, stateColors.alert.border),
  success: cn(COLORED_BASE, stateColors.positive.background, stateColors.positive.border),
  error: cn(COLORED_BASE, stateColors.error.background, stateColors.error.border),
};

export default function Card({
  variant = 'default',
  title,
  subtitle,
  children,
  footer,
  interactive = false,
  className = '',
  ...rest
}) {
  return (
    <div
      className={cn(
        VARIANTS[variant],
        interactive && cn(effects.scaleHover, 'cursor-pointer hover:border-zinc-700'),
        className,
      )}
      {...rest}
    >
      {/* Cabecera opcional */}
      {(title || subtitle) && (
        <div className="mb-2">
          {title && <h3 className={typography.cardTitle}>{title}</h3>}
          {subtitle && <p className={typography.small}>{subtitle}</p>}
        </div>
      )}

      {/* Contenido */}
      {children}

      {/* Pie opcional */}
      {footer && (
        <div className="mt-3 border-t border-zinc-800/60 pt-3">{footer}</div>
      )}
    </div>
  );
}