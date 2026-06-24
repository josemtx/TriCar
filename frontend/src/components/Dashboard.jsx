import { useState } from "react";
import { BarChart3, Settings } from "lucide-react";
import { ZONAS } from "../api";
import EditarGrupo from "./EditarGrupo";
import Button from "./Button";
import Card from "./Card";
import { effects } from "../styles/design-system";

const pct = (ratio) => `${Math.round((ratio || 0) * 100)}%`;

// Color del ratio: esmeralda si conduce su parte justa, ámbar si va por debajo.
const ratioColor = (ratio) =>
  ratio >= 0.5
    ? "text-emerald-400"
    : ratio > 0
    ? "text-amber-400"
    : "text-zinc-500";

function ZonaBadges({ valores, color }) {
  return (
    <div className="flex gap-1">
      {ZONAS.map((z) => (
        <span
          key={z}
          title={z}
          className={`inline-flex flex-col items-center rounded-md px-1.5 py-0.5 text-[10px] leading-tight ${color}`}
        >
          <span className="font-semibold opacity-70">{z[0]}</span>
          <span className="font-bold">{valores[z] ?? 0}</span>
        </span>
      ))}
    </div>
  );
}

export default function Dashboard({ amigos, loading, onCambioGrupo }) {
  const [editando, setEditando] = useState(false);

  return (
    <Card variant="primary">
      {/* Cabecera: título + acción (layout propio, por eso no uso la prop title) */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-400" />
            Panel de control
          </h2>
          <p className="text-xs text-zinc-500">Ranking de equidad del grupo</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Settings size={14} />}
          onClick={() => setEditando(true)}
        >
          Editar grupo
        </Button>
      </div>

      {loading && <p className="text-sm text-zinc-500">Cargando amigos…</p>}

      <div className="space-y-3">
        {amigos.map((a) => (
          <Card key={a.id} className={effects.scaleHover}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100">{a.nombre}</span>
                {!a.poseeCoche && (
                  <span className="text-[10px] rounded-full bg-zinc-800 text-zinc-400 px-2 py-0.5">
                    sin coche
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-500">
                {a.totalConducidos} conducidos
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-zinc-500 mb-1">Conducidos</p>
                <ZonaBadges
                  valores={a.viajesConducidos}
                  color="bg-emerald-500/10 text-emerald-300"
                />
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Asistidos</p>
                <ZonaBadges
                  valores={a.viajesAsistidos}
                  color="bg-sky-500/10 text-sky-300"
                />
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Deudas</p>
                <ZonaBadges
                  valores={a.deudaViajes}
                  color="bg-amber-500/10 text-amber-300"
                />
              </div>
            </div>

            <div className="mt-2 flex gap-3 text-[11px] text-zinc-500">
              {ZONAS.map((z) => (
                <span key={z}>
                  {z}:{" "}
                  <strong className={ratioColor(a.ratios[z])}>
                    {pct(a.ratios[z])}
                  </strong>
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {editando && (
        <EditarGrupo
          amigos={amigos}
          onCerrar={() => setEditando(false)}
          onCambio={onCambioGrupo}
        />
      )}
    </Card>
  );
}