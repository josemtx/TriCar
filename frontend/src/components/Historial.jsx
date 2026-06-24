import { useState } from "react";
import { api } from "../api";
import SorteoRuleta from "./SorteoRuleta";

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
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 transition-all duration-300 hover:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-semibold text-slate-100 text-sm">
            {plan.descripcion || "(sin descripción)"}
          </p>
          <p className="text-[11px] text-slate-500">
            {plan.zona} · {plan.cochesNecesarios} coche(s) ·{" "}
            {plan.pasajeros.length} pasajeros
          </p>
        </div>
        <span className="text-[10px] rounded-full bg-amber-500/15 text-amber-300 px-2 py-0.5">
          abierto
        </span>
      </div>

      <p className="text-[11px] text-slate-500 mb-2">
        Propuestos:{" "}
        <span className="text-emerald-300">
          {plan.conductoresPropuestos.map(nombre).join(", ") || "—"}
        </span>
      </p>

      <p className="text-xs font-medium text-slate-400 mb-1">
        Conductores reales:
      </p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {candidatos.map((a) => {
          const sel = reales.includes(a.id);
          return (
            <label
              key={a.id}
              className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-sm cursor-pointer transition-all duration-200 ${
                sel
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                  : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700"
              }`}
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

      <button
        onClick={handleConfirmar}
        disabled={confirmando}
        className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 py-2 text-sm font-semibold text-white hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 transition-all duration-300"
      >
        {confirmando ? "Confirmando…" : "✓ Confirmar y cerrar viaje"}
      </button>
    </div>
  );
}

function ViajePasado({ plan, amigos }) {
  const nombre = (id) => amigos.find((a) => a.id === id)?.nombre ?? "—";
  const fecha = new Date(plan.fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-200">
          {plan.descripcion || "(sin descripción)"}
        </p>
        <span className="text-[10px] text-slate-500">{fecha}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">
          {plan.zona} · {plan.pasajeros.length} pasajeros
        </span>
        <span className="text-emerald-300">
          🚗 {plan.conductoresReales.map(nombre).join(", ") || "—"}
        </span>
      </div>
    </div>
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
    <section className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-900/60 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        📜 Historial y pendientes
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Resuelve sorteos, confirma viajes y consulta los pasados
      </p>

      {loading && <p className="text-sm text-slate-500">Cargando planes…</p>}

      {vacio && (
        <p className="text-sm text-slate-500">
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Viajes pasados
          </p>
          <div className="space-y-2">
            {pasados.map((plan) => (
              <ViajePasado key={plan.id} plan={plan} amigos={amigos} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
