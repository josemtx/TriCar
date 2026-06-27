import { useState } from "react";
import { History, CheckCircle, Car } from "lucide-react";
import { api } from "../api";
import SorteoRuleta from "./SorteoRuleta";
import Button from "./Button";
import Card from "./Card";
import { stateColors, cn } from "../styles/design-system";

function PlanConfirmable({ plan, amigos, onConfirmado }) {
  // Por defecto, los conductores reales = los propuestos (editables para pactos).
  const [reales, setReales] = useState(plan.conductoresPropuestos);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState("");

  const candidatos = amigos.filter((a) => a.poseeCoche);
  const nombre = (id) => amigos.find((a) => a.id === id)?.nombre ?? id;

  const toggle = (id) =>
    setReales((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const handleConfirmar = async () => {
    setError("");
    setConfirmando(true);
    try {
      await api.confirmarPlan(plan.id, reales);
      onConfirmado?.();
    } catch (err) {
      setError(err.message);
      setConfirmando(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-semibold text-zinc-100 text-sm">
            {plan.descripcion || "(sin descripción)"}
          </p>
          <p className="text-[11px] text-zinc-500">
            {plan.zona} · {plan.cochesNecesarios} coche(s) ·{" "}
            {plan.pasajeros.length} pasajeros
          </p>
        </div>
        <span className="text-[10px] rounded-full bg-amber-500/15 text-amber-300 px-2 py-0.5">
          abierto
        </span>
      </div>

      <p className="text-[11px] text-zinc-500 mb-2">
        Propuestos:{" "}
        <span className="text-emerald-300">
          {plan.conductoresPropuestos.map(nombre).join(", ") || "—"}
        </span>
      </p>

      {plan.motivoExplicacion && (
        <p className="mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-snug text-zinc-300">
          {plan.motivoExplicacion}
        </p>
      )}

      <p className="text-xs font-medium text-zinc-400 mb-1">
        Conductores reales:
      </p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {candidatos.map((a) => {
          const sel = reales.includes(a.id);
          const estado = sel ? stateColors.positive : stateColors.neutral;
          return (
            <label
              key={a.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2 py-1 text-sm cursor-pointer transition-all duration-200",
                estado.background,
                estado.border,
                estado.text,
                !sel && "hover:border-zinc-700"
              )}
            >
              <input
                type="checkbox"
                checked={sel}
                onChange={() => toggle(a.id)}
                className="accent-emerald-500"
              />
              <span>{a.nombre}</span>
            </label>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

      <Button
        variant="success"
        loading={confirmando}
        icon={<CheckCircle size={16} />}
        className="w-full"
        onClick={handleConfirmar}
      >
        {confirmando ? "Confirmando…" : "Confirmar y cerrar viaje"}
      </Button>
    </Card>
  );
}

function ViajePasado({ plan, amigos }) {
  const nombre = (id) => amigos.find((a) => a.id === id)?.nombre ?? "—";
  const fecha = new Date(plan.fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-200">
          {plan.descripcion || "(sin descripción)"}
        </p>
        <span className="text-[10px] text-zinc-500">{fecha}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px]">
        <span className="text-zinc-500">
          {plan.zona} · {plan.pasajeros.length} pasajeros
        </span>
        <span className="text-emerald-300 inline-flex items-center gap-1">
          <Car size={12} />
          {plan.conductoresReales.map(nombre).join(", ") || "—"}
        </span>
      </div>
    </Card>
  );
}

export default function Historial({ planes, amigos, loading, onCambio }) {
  // Planes en sorteo (prioridad), listos para confirmar, y viajes ya pasados.
  const enSorteo = planes.filter((p) => p.estado === "en_sorteo");
  const confirmables = planes.filter(
    (p) => p.estado === "abierto" && p.conductoresPropuestos.length > 0
  );
  const pasados = planes.filter((p) => p.estado === "confirmado_post_viaje");

  const vacio =
    !loading &&
    enSorteo.length === 0 &&
    confirmables.length === 0 &&
    pasados.length === 0;

  return (
    <Card variant="primary">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <History size={20} className="text-indigo-400" />
        Historial y pendientes
      </h2>
      <p className="text-xs text-zinc-500 mb-4">
        Resuelve sorteos, confirma viajes y consulta los pasados
      </p>

      {loading && <p className="text-sm text-zinc-500">Cargando planes…</p>}

      {vacio && (
        <p className="text-sm text-zinc-500">
          No hay viajes pendientes. Crea un plan para empezar.
        </p>
      )}

      <div className="space-y-3">
        {enSorteo.map((plan) => (
          <SorteoRuleta
            key={plan.id}
            plan={plan}
            amigos={amigos}
            onResuelto={onCambio}
          />
        ))}
        {confirmables.map((plan) => (
          <PlanConfirmable
            key={plan.id}
            plan={plan}
            amigos={amigos}
            onConfirmado={onCambio}
          />
        ))}
      </div>

      {pasados.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Viajes pasados
          </p>
          <div className="space-y-2">
            {pasados.map((plan) => (
              <ViajePasado key={plan.id} plan={plan} amigos={amigos} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}