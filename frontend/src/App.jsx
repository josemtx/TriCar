import { useCallback, useEffect, useState } from "react";
import { BarChart3, Car, History, RotateCw } from "lucide-react";
import { api } from "./api";
import Dashboard from "./components/Dashboard";
import CrearPlan from "./components/CrearPlan";
import Historial from "./components/Historial";
import TabBar from "./components/TabBar";
import Button from "./components/Button";
import Card from "./components/Card";

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
    <div className="min-h-screen bg-black text-zinc-200 selection:bg-indigo-500/30">
      {/* Resplandores decorativos (profundidad premium sobre negro) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute bottom-0 -right-32 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>

      {/* Header compacto y pegajoso (nav translúcida estilo iOS) */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
              <Car size={18} className="text-white" />
            </span>
            <div className="leading-tight">
              <h1 className="text-base font-bold tracking-tight text-white">
                CocheCompartido
              </h1>
              <p className="text-[10px] text-zinc-500">Reparto justo de conductores</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Recargar datos"
            icon={<RotateCw size={16} />}
            onClick={cargarDatos}
          />
        </div>
      </header>

      {/* Contenido (con espacio inferior para la barra de pestañas) */}
      <main className="relative mx-auto max-w-2xl px-4 pb-28 pt-5">
        {errorGlobal && (
          <Card variant="error" className="mb-4 text-sm text-red-300">
            {errorGlobal}
          </Card>
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

      {/* Barra de pestañas inferior (mobile-first).
          Pasamos REFERENCIAS de componente (icon: BarChart3), no elementos
          ya instanciados; TabBar los renderiza como <Icon /> en su propio body. */}
      <TabBar
        tabs={[
          { id: "ranking", label: "Ranking", icon: BarChart3 },
          { id: "crear", label: "Crear", icon: Car },
          { id: "historial", label: "Historial", icon: History, badge: pendientes },
        ]}
        activeTab={tab}
        onChange={setTab}
      />
    </div>
  );
}

export default App;