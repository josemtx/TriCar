import { useState } from "react";
import { api } from "../api";

export default function EditarGrupo({ amigos, onCerrar, onCambio }) {
  const [nombre, setNombre] = useState("");
  const [poseeCoche, setPoseeCoche] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const añadir = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setError("");
    setGuardando(true);
    try {
      await api.crearAmigo({ nombre: nombre.trim(), poseeCoche });
      setNombre("");
      setPoseeCoche(true);
      onCambio?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const toggleCoche = async (amigo) => {
    setError("");
    try {
      await api.actualizarAmigo(amigo.id, { poseeCoche: !amigo.poseeCoche });
      onCambio?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Editar grupo</h3>
          <button
            onClick={onCerrar}
            className="text-slate-500 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Añadir nuevo amigo */}
        <form onSubmit={añadir} className="space-y-3 mb-5">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del nuevo amigo"
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          />
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={poseeCoche}
              onChange={(e) => setPoseeCoche(e.target.checked)}
              className="accent-indigo-500"
            />
            Posee coche
          </label>
          <button
            type="submit"
            disabled={guardando || !nombre.trim()}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 py-2 text-sm font-semibold text-white hover:opacity-90 hover:scale-[1.02] disabled:opacity-40 transition-all duration-300"
          >
            {guardando ? "Añadiendo…" : "+ Añadir amigo"}
          </button>
        </form>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        {/* Listado editable */}
        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
          Disponibilidad de coche
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {amigos.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2"
            >
              <span className="text-sm text-slate-200">{a.nombre}</span>
              <button
                onClick={() => toggleCoche(a)}
                className={`text-xs rounded-full px-3 py-1 font-medium transition-all duration-300 ${
                  a.poseeCoche
                    ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    : "bg-slate-700/40 text-slate-400 hover:bg-slate-700/60"
                }`}
              >
                {a.poseeCoche ? "🚗 Con coche" : "🚶 Sin coche"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
