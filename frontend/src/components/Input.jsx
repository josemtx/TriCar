import { useId } from 'react';
import { components, typography, cn } from '@/styles/design-system';

/**
 * Input — campo de entrada reutilizable (text, email, number, password,
 * select, checkbox, textarea) con label, error y texto de ayuda.
 *
 * Props:
 * @param {'text'|'email'|'number'|'password'|'select'|'checkbox'|'textarea'} type  (default 'text')
 * @param {string}   label        Label opcional (se enlaza con htmlFor)
 * @param {string}   placeholder  Placeholder
 * @param {string|number} value   Valor controlado
 * @param {boolean}  checked      Estado del checkbox (solo type="checkbox")
 * @param {Function} onChange     Handler de cambio
 * @param {string}   error        Mensaje de error (pinta borde rojo si existe)
 * @param {boolean}  disabled     Deshabilitado
 * @param {boolean}  required     Requerido (añade * en el label)
 * @param {Array<{label:string,value:string|number}>} options  Solo type="select"
 * @param {string}   helperText   Texto de ayuda bajo el campo
 * @param {number}   rows         Filas del textarea (default 4)
 * @param {string}   className    Clases extra para el control
 * ...resto: props nativos del control (name, min, max, autoComplete, etc.)
 *
 * Ejemplos:
 *   <Input label="Descripción" placeholder="Concierto en la sierra…"
 *          value={desc} onChange={(e) => setDesc(e.target.value)} error={error} />
 *
 *   <Input type="select" label="Zona" value={zona}
 *          onChange={(e) => setZona(e.target.value)}
 *          options={[{label:'NORTE',value:'NORTE'},{label:'SUR',value:'SUR'}]} />
 *
 *   <Input type="checkbox" label="Posee coche"
 *          checked={poseeCoche} onChange={(e) => setPoseeCoche(e.target.checked)} />
 *
 *   <Input type="textarea" label="Notas" rows={5} value={notas}
 *          onChange={(e) => setNotas(e.target.value)} helperText="Opcional" />
 */

export default function Input({
  type = 'text',
  label,
  placeholder,
  value,
  checked,
  onChange,
  error,
  disabled = false,
  required = false,
  options = [],
  helperText,
  rows = 4,
  className = '',
  ...rest
}) {
  const id = useId(); // id único y estable para enlazar label ↔ control

  // Clase base del control + borde rojo si hay error
  const controlClass = cn(
    components.input,
    error && 'border-red-500/50 focus:ring-red-500/50',
    className,
  );

  // ── Caso especial: checkbox (layout horizontal, label a la derecha) ──
  if (type === 'checkbox') {
    return (
      <div className="space-y-1">
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2 select-none">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-950/60 text-indigo-500 focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-0"
            {...rest}
          />
          {label && <span className={typography.body}>{label}</span>}
        </label>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {helperText && !error && <p className={typography.small}>{helperText}</p>}
      </div>
    );
  }

  // ── Resto de tipos: label arriba, control debajo ──
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className={typography.label}>
          {label}
          {required && <span className="ml-0.5 text-red-400">*</span>}
        </label>
      )}

      {type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={controlClass}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          required={required}
          rows={rows}
          className={cn(controlClass, 'resize-y')}
          {...rest}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={controlClass}
          {...rest}
        />
      )}

      {/* Mensaje de error tiene prioridad sobre el helper */}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helperText && !error && <p className={typography.small}>{helperText}</p>}
    </div>
  );
}