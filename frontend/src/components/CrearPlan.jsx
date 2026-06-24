import { useState } from "react";
import { api, ZONAS } from "../api";

export default function CrearPlan({ amigos, onPlanCreado, irAHistorial }) {
  const [descripcion, setDescripcion] = useState("");
  const [zona, setZona] = useState("NORTE");
  const [cochesNecesarios, setCochesNecesarios] = useState(1);
  const [pasajeros, setPasajeros] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null); // respuesta de /propuesta

  const togglePasajero = (id) => {
    setPasajeros((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResultado(null);

    if (pasajeros.length === 0) {
      setError("Selecciona al menos un pasajero.");
      return;
    }

    setEnviando(true);
    try {
      const plan = await api.crearPlan({
        descripcion,
        zona,
        cochesNecesarios: Number(cochesNecesarios),
        pasajeros,
      });
      const prop = await api.getPropuesta(plan.id);
      setResultado(prop);
      setDescripcion("");
      setPasajeros([]);
      setCochesNecesarios(1);
      onPlanCreado?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all duration-200";

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-900/60 p-5 shadow-lg shadow-black/20 backdrop-blur-md">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        ➕ Crear plan
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        El sistema propondrá conductores
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Descripción
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Concierto en la sierra…"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Zona
            </label>
            <select
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className={inputCls}
            >
              {ZONAS.map((z) => (
                <option key={z} value={z} className="bg-slate-900">
                  {z}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Nº coches
            </label>
            <input
              type="number"
              min={1}
              value={cochesNecesarios}
              onChange={(e) => setCochesNecesarios(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Pasajeros que asisten
          </label>
          <div className="grid grid-cols-2 gap-2">
            {amigos.map((a) => {
              const sel = pasajeros.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm cursor-pointer transition-all duration-200 ${
                    sel
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-200"
                      : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sel}
                    onChange={() => togglePasajero(a.id)}
                    className="accent-indigo-500"
                  />
                  <span>{a.nombre}</span>
                  {!a.poseeCoche && (
                    <span className="text-[10px] text-slate-500">(sin coche)</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 transition-all duration-300"
        >
          {enviando ? "Calculando propuesta…" : "Crear y proponer conductores"}
        </button>
      </form>

      {resultado && resultado.requiereSorteo && (
        <div className="mt-4 rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-3">
          <p className="text-xs font-semibold text-indigo-200 mb-1">
            🎲 Empate técnico ({resultado.zona})
          </p>
          <p className="text-sm text-indigo-100">
            {resultado.candidatosEmpatados.map((c) => c.nombre).join(" = ")}
          </p>
          <p className="text-[11px] text-indigo-300/70 mt-1">
            Nadie destaca: hay que sortear o que alguien se ofrezca.
          </p>
          <button
            onClick={irAHistorial}
            className="mt-2 w-full rounded-lg border border-indigo-500/40 bg-indigo-500/10 py-2 text-sm font-medium text-indigo-200 transition-all duration-300 hover:bg-indigo-500/20 active:scale-95"
          >
            Ir al sorteo en Historial →
          </button>
        </div>
      )}

      {resultado && !resultado.requiereSorteo && (
        <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3">
          <p className="text-xs font-semibold text-emerald-300 mb-1">
            🚗 Conductores propuestos ({resultado.zona})
          </p>
          {resultado.conductoresPropuestos.length === 0 ? (
            <p className="text-sm text-emerald-100">
              No hay candidatos con coche entre los pasajeros.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {resultado.conductoresPropuestos.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200"
                >
                  {c.nombre}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
