import { cn } from '@/styles/design-system';

/**
 * TabBar — barra de navegación inferior fija (mobile-first).
 *
 * Props:
 * @param {Array<{id:string,label:string,icon?:React.ComponentType<{size?:number}>,badge?:number}>} tabs
 * @param {string}   activeTab   id del tab activo
 * @param {Function} onChange    (tabId) => void
 * @param {string}   className   Clases extra opcionales
 *
 * Accesibilidad: contenedor role="tablist", cada botón role="tab"
 * con aria-selected. Los iconos se pasan como REFERENCIA de componente
 * Lucide (no instanciados); TabBar los renderiza como <Icon /> en su body.
 *
 * Ejemplo:
 *   <TabBar
 *     tabs={[
 *       { id: 'ranking',   label: 'Ranking',   icon: BarChart3 },
 *       { id: 'crear',     label: 'Crear',     icon: Car },
 *       { id: 'historial', label: 'Historial', icon: History, badge: 3 },
 *     ]}
 *     activeTab={tab}
 *     onChange={setTab}
 *   />
 */

export default function TabBar({ tabs = [], activeTab, onChange, className = '' }) {
  return (
    <nav
      role="tablist"
      aria-label="Navegación principal"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 grid border-t border-white/10 bg-black/80 backdrop-blur-xl',
        // padding seguro para iPhone (notch inferior)
        'pb-[env(safe-area-inset-bottom)]',
        className,
      )}
      // grid dinámico purge-safe: evita clases tipo grid-cols-{n} que Tailwind no detecta
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((t) => {
        const isActive = t.id === activeTab;
        // Instanciamos el icono DENTRO del render (referencia -> componente).
        // Mayúscula inicial obligatoria para que JSX lo trate como componente.
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            aria-label={t.label}
            onClick={() => onChange?.(t.id)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-200',
              isActive ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            {/* Indicador superior cuando está activo */}
            {isActive && (
              <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-indigo-500" />
            )}

            {/* Badge opcional */}
            {typeof t.badge === 'number' && t.badge > 0 && (
              <span className="absolute right-6 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
                {t.badge}
              </span>
            )}

            {/* Icono (escala ligera cuando activo) */}
            {Icon && (
              <span className={cn('transition-transform duration-200', isActive && 'scale-[1.02]')}>
                <Icon size={20} />
              </span>
            )}

            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}