import { useEffect, useRef, useState } from "react";
import { Dices, Hand, Car, CheckCircle } from "lucide-react";
import { api } from "../api";
import Button from "./Button";
import Card from "./Card";

// Componente de "Sorteo de Conductor": ruleta que alterna entre los candidatos
// empatados y se detiene dramáticamente sobre el elegido.
export default function SorteoRuleta({ plan, onResuelto }) {
  const candidatos = plan.candidatosSorteoDetalle || [];

  const [girando, setGirando] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const [ganador, setGanador] = useState(null); // el "perdedor" que conducirá
  const [fijando, setFijando] = useState(false);
  const [voluntarioId, setVoluntarioId] = useState(null);
  const [error, setError] = useState("");
  const timeoutsRef = useRef([]);

  const postularVoluntario = async (amigoId) => {
    if (girando) return;
    setError("");
    setVoluntarioId(amigoId);
    try {
      await api.postularse(plan.id, amigoId);
      onResuelto?.();
    } catch (err) {
      setError(err.message);
      setVoluntarioId(null);
    }
  };

  // Limpieza de timers al desmontar.
  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const lanzarSorteo = () => {
    if (girando || candidatos.length < 2) return;
    setError("");
    setGanador(null);
    setGirando(true);

    // Elegimos el ganador real de antemano (aleatorio en el cliente).
    const idxGanador = Math.floor(Math.random() * candidatos.length);

    // Programamos "ticks" con intervalos crecientes (efecto desaceleración).
    const DURACION = 3500; // ms
    let t = 0;
    let intervalo = 70;
    const ticks = [];
    let idx = indiceActivo;
    while (t < DURACION) {
      idx = (idx + 1) % candidatos.length;
      ticks.push({ at: t, idx });
      intervalo = Math.min(intervalo * 1.12, 420); // se va ralentizando
      t += intervalo;
    }
    // Forzamos que el último tick caiga en el ganador.
    const totalTicks = ticks.length;
    const ajuste =
      (idxGanador - ticks[totalTicks - 1].idx + candidatos.length * 10) %
      candidatos.length;

    ticks.forEach((tick, i) => {
      const id = setTimeout(() => {
        setIndiceActivo((tick.idx + ajuste) % candidatos.length);
        if (i === totalTicks - 1) {
          setGanador(candidatos[idxGanador]);
          setGirando(false);
        }
      }, tick.at);
      timeoutsRef.current.push(id);
    });
  };

  const confirmarResultado = async () => {
    if (!ganador) return;
    setFijando(true);
    setError("");
    try {
      await api.fijarSorteo(plan.id, ganador.id);
      onResuelto?.();
    } catch (err) {
      setError(err.message);
      setFijando(false);
    }
  };

  return (
    <Card
      variant="info"
      className="animate-sorteo-glow rounded-xl border-indigo-500/40 bg-indigo-950/30 p-4"
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-indigo-200 text-sm flex items-center gap-2">
          <Dices size={16} />
          Sorteo de conductor
        </p>
        <span className="text-[10px] rounded-full bg-indigo-500/20 text-indigo-300 px-2 py-0.5">
          empate técnico
        </span>
      </div>
      <p className="text-[11px] text-indigo-300/70 mb-3">
        {plan.descripcion || "(sin descripción)"} · {plan.zona} — nadie destaca,
        decide la suerte
      </p>

      {plan.motivoExplicacion && (
        <p className="mb-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-snug text-zinc-300">
          {plan.motivoExplicacion}
        </p>
      )}

      {/* Carrusel de candidatos (estados acoplados a la animación → se queda como div) */}
      <div
        className="grid gap-2 mb-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(candidatos.length, 3)}, minmax(0, 1fr))`,
        }}
      >
        {candidatos.map((c, i) => {
          const activo = i === indiceActivo;
          const esGanador = ganador && c.id === ganador.id;
          return (
            <div
              key={c.id}
              className={`rounded-xl border px-3 py-4 text-center transition-all duration-150 ${
                esGanador
                  ? "border-indigo-400 bg-indigo-500/30 scale-105 shadow-lg shadow-indigo-900/50"
                  : activo && girando
                  ? "border-violet-400 bg-violet-500/25 scale-105"
                  : "border-zinc-700 bg-zinc-950/40"
              }`}
            >
              <p
                className={`font-bold ${
                  esGanador
                    ? "text-white"
                    : activo && girando
                    ? "text-violet-100"
                    : "text-zinc-300"
                }`}
              >
                {c.nombre}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                deuda {c.deuda} · ratio {Math.round((c.ratio || 0) * 100)}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Resultado */}
      {ganador && (
        <div className="mb-3 rounded-lg bg-indigo-500/15 border border-indigo-400/40 px-3 py-2 text-center">
          <p className="text-xs text-indigo-300/80 inline-flex items-center gap-1">
            Le toca conducir <Car size={12} />
          </p>
          <p className="text-lg font-extrabold text-white tracking-tight">
            {ganador.nombre}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

      {!ganador ? (
        <>
          <Button
            variant="primary"
            loading={girando}
            disabled={candidatos.length < 2}
            icon={<Dices size={16} />}
            className="w-full"
            onClick={lanzarSorteo}
          >
            {girando ? "Girando…" : "Lanzar sorteo"}
          </Button>

          {/* Alternativa: alguien se ofrece voluntario y se evita el azar. */}
          {!girando && (
            <div className="mt-3 border-t border-indigo-500/20 pt-3">
              <p className="mb-2 text-[11px] text-indigo-300/70">
                …o que alguien se ofrezca voluntario:
              </p>
              <div className="flex flex-wrap gap-2">
                {candidatos.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => postularVoluntario(c.id)}
                    disabled={!!voluntarioId}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950/50 px-3 py-1 text-xs text-zinc-300 transition-all duration-300 hover:border-emerald-500/50 hover:text-emerald-200 disabled:opacity-50 active:scale-95"
                  >
                    <Hand size={12} />
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Button
          variant="success"
          loading={fijando}
          icon={<CheckCircle size={16} />}
          className="w-full"
          onClick={confirmarResultado}
        >
          {fijando ? "Consolidando…" : `Confirmar a ${ganador.nombre} como conductor`}
        </Button>
      )}
    </Card>
  );
}