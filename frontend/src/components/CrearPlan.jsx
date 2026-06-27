import { useState } from "react";
import { Plus, Dices, Car } from "lucide-react";
import { api, ZONAS } from "../api";
import Button from "./Button";
import Card from "./Card";
import Input from "./Input";
import { stateColors, cn } from "../styles/design-system";

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

  return (
    <Card variant="primary">
      <h2 className="text-lg font-bold text-white flex items-center gap-2">
        <Plus size={20} className="text-indigo-400" />
        Crear plan
      </h2>
      <p className="text-xs text-zinc-500 mb-4">
        El sistema propondrá conductores
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Concierto en la sierra…"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            type="select"
            label="Zona"
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            options={ZONAS.map((z) => ({ label: z, value: z }))}
          />
          <Input
            type="number"
            label="Nº coches"
            min={1}
            value={cochesNecesarios}
            onChange={(e) => setCochesNecesarios(e.target.value)}
          />
        </div>

        {/* Selector de pasajeros: chips tipo toggle (look propio, no es un
            checkbox plano). Coloreado con los tokens de estado del design-system. */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">
            Pasajeros que asisten
          </label>
          <div className="grid grid-cols-2 gap-2">
            {amigos.map((a) => {
              const sel = pasajeros.includes(a.id);
              const estado = sel ? stateColors.active : stateColors.neutral;
              return (
                <label
                  key={a.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm cursor-pointer transition-all duration-200",
                    estado.background,
                    estado.border,
                    estado.text,
                    !sel && "hover:border-zinc-700"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={sel}
                    onChange={() => togglePasajero(a.id)}
                    className="accent-indigo-500"
                  />
                  <span>{a.nombre}</span>
                  {!a.poseeCoche && (
                    <span className="text-[10px] text-zinc-500">(sin coche)</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          loading={enviando}
          className="w-full"
        >
          {enviando ? "Calculando propuesta…" : "Crear y proponer conductores"}
        </Button>
      </form>

      {resultado && resultado.requiereSorteo && (
        <Card variant="info" className="mt-4 rounded-xl border-indigo-500/40 bg-indigo-950/30">
          <p className="text-xs font-semibold text-indigo-200 mb-1 flex items-center gap-1.5">
            <Dices size={14} />
            Empate técnico ({resultado.zona})
          </p>
          <p className="text-sm text-indigo-100">
            {resultado.candidatosEmpatados.map((c) => c.nombre).join(" = ")}
          </p>
          <p className="text-[11px] text-indigo-300/70 mt-1">
            Nadie destaca: hay que sortear o que alguien se ofrezca.
          </p>
          {resultado.motivoExplicacion && (
            <p className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-snug text-zinc-300">
              {resultado.motivoExplicacion}
            </p>
          )}
          <Button
            variant="secondary"
            className="mt-2 w-full border-indigo-500/40 bg-indigo-500/10 text-indigo-200 hover:border-indigo-500/40 hover:bg-indigo-500/20 hover:text-indigo-200"
            onClick={irAHistorial}
          >
            Ir al sorteo en Historial →
          </Button>
        </Card>
      )}

      {resultado && !resultado.requiereSorteo && (
        <Card variant="success" className="mt-4 rounded-xl border-emerald-500/40 bg-emerald-950/30">
          <p className="text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
            <Car size={14} />
            Conductores propuestos ({resultado.zona})
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
          {resultado.motivoExplicacion && (
            <p className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-snug text-zinc-300">
              {resultado.motivoExplicacion}
            </p>
          )}
        </Card>
      )}
    </Card>
  );
}