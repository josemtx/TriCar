import { useState } from "react";
import { X, Plus, Car, Footprints } from "lucide-react";
import { api } from "../api";
import Button from "./Button";
import Card from "./Card";
import Input from "./Input";
import { stateColors, cn } from "../styles/design-system";

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

  // Pill de estado de coche (mismo patrón "tinte de estado" que los chips de
  // CrearPlan): color de texto desde tokens, forma de píldora sin borde.
  const cocheCls = (tiene) =>
    cn(
      "text-xs rounded-full px-3 py-1 font-medium transition-all duration-300 inline-flex items-center gap-1",
      tiene
        ? cn(stateColors.positive.text, "bg-emerald-500/15 hover:bg-emerald-500/25")
        : cn(stateColors.neutral.text, "bg-zinc-700/40 hover:bg-zinc-700/60")
    );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/70 backdrop-blur-sm p-4"
      onClick={onCerrar}
    >
      <Card
        variant="primary"
        className="w-full max-w-md p-6 shadow-2xl bg-none bg-zinc-900/90"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Editar grupo</h3>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Cerrar"
            icon={<X size={18} />}
            onClick={onCerrar}
          />
        </div>

        {/* Añadir nuevo amigo */}
        <form onSubmit={añadir} className="space-y-3 mb-5">
          <Input
            type="text"
            aria-label="Nombre del nuevo amigo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del nuevo amigo"
          />
          <Input
            type="checkbox"
            label="Posee coche"
            checked={poseeCoche}
            onChange={(e) => setPoseeCoche(e.target.checked)}
          />
          <Button
            type="submit"
            variant="primary"
            loading={guardando}
            disabled={!nombre.trim()}
            icon={<Plus size={16} />}
            className="w-full py-2"
          >
            {guardando ? "Añadiendo…" : "Añadir amigo"}
          </Button>
        </form>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        {/* Listado editable */}
        <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
          Disponibilidad de coche
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {amigos.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"
            >
              <span className="text-sm text-zinc-200">{a.nombre}</span>
              <button
                onClick={() => toggleCoche(a)}
                aria-label={a.poseeCoche ? "Quitar coche" : "Marcar con coche"}
                className={cocheCls(a.poseeCoche)}
              >
                {a.poseeCoche ? (
                  <>
                    <Car size={12} /> Con coche
                  </>
                ) : (
                  <>
                    <Footprints size={12} /> Sin coche
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}