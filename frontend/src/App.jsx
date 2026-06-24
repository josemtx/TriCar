import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import Dashboard from "./components/Dashboard";
import CrearPlan from "./components/CrearPlan";
import Historial from "./components/Historial";

const TABS = [
  { id: "ranking", icon: "📊", label: "Ranking" },
  { id: "crear", icon: "🚗", label: "Crear" },
  { id: "historial", icon: "📜", label: "Historial" },
];

function App() {
  const [tab, setTab] = useState("ranking");
  const [amigos, setAmigos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState("");

  const cargarDatos = useCallback(async () => {
    setErrorGlobal("");
    try {
      const [amigosData, planesData] = await Promise.all([
        api.getAmigos(),
        api.getPlanes(),
      ]);
      setAmigos(amigosData);
      setPlanes(planesData);
    } catch (err) {
      setErrorGlobal(`No se pudo conectar con el servidor (${err.message}).`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Nº de viajes que requieren atención (sorteo o confirmación) para el badge.
  const pendientes = planes.filter(
    (p) =>
      p.estado === "en_sorteo" ||
      (p.estado === "abierto" && p.conductoresPropuestos.length > 0)
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Resplandores decorativos */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 -right-32 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      {/* Header compacto y pegajoso */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg shadow-lg shadow-indigo-900/40">
              🚗
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight text-white">
                CocheCompartido
              </h1>
              <p className="text-[10px] text-slate-500">Reparto justo de conductores</p>
            </div>
          </div>
          <button
            onClick={cargarDatos}
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-400 transition-all duration-300 hover:border-slate-700 hover:text-white active:scale-95"
          >
            ↻
          </button>
        </div>
      </header>

      {/* Contenido (con espacio inferior para la barra de pestañas) */}
      <main className="relative mx-auto max-w-2xl px-4 pb-28 pt-5">
        {errorGlobal && (
          <div className="mb-4 rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300 backdrop-blur-md">
            {errorGlobal}
          </div>
        )}

        {tab === "ranking" && (
          <Dashboard amigos={amigos} loading={loading} onCambioGrupo={cargarDatos} />
        )}
        {tab === "crear" && (
          <CrearPlan
            amigos={amigos}
            onPlanCreado={cargarDatos}
            irAHistorial={() => setTab("historial")}
          />
        )}
        {tab === "historial" && (
          <Historial
            planes={planes}
            amigos={amigos}
            loading={loading}
            onCambio={cargarDatos}
          />
        )}
      </main>

      {/* Barra de pestañas inferior (mobile-first) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-lg">
        <div className="mx-auto grid max-w-2xl grid-cols-3">
          {TABS.map((t) => {
            const activo = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-all duration-300 ${
                  activo ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className={`text-xl transition-transform duration-300 ${activo ? "scale-110" : ""}`}>
                  {t.icon}
                </span>
                <span>{t.label}</span>
                {t.id === "historial" && pendientes > 0 && (
                  <span className="absolute right-6 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
                    {pendientes}
                  </span>
                )}
                {activo && (
                  <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;
