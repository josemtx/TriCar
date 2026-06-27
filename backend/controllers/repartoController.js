// ──────────────────────────────────────────────────────────────────────────
// Lógica de reparto equitativo de conductores (MongoDB + Mongoose).
// ──────────────────────────────────────────────────────────────────────────
import { ZONAS } from "../data/store.js";
import { Amigo } from "../models/Amigo.js";
import { Plan } from "../models/Plan.js";

// Ratio de conducción en una zona: conducidos / asistidos (0 si no ha asistido).
const ratioConduccion = (amigo, zona) => {
  const asistidos = amigo.viajesAsistidos[zona] || 0;
  const conducidos = amigo.viajesConducidos[zona] || 0;
  return asistidos === 0 ? 0 : conducidos / asistidos;
};

// Total de viajes conducidos sumando todas las zonas.
const totalConducidos = (amigo) =>
  ZONAS.reduce((sum, z) => sum + (amigo.viajesConducidos[z] || 0), 0);

// Explicaciones en lenguaje natural según el criterio que decidió la propuesta.
const MOTIVOS = {
  deuda:
    "📌 Propuesto(s) de forma directa por tener la mayor deuda acumulada viajando a esta zona.",
  total:
    "⚖️ Empate en deuda de zona resuelto: Seleccionado por llevar menos viajes totales conducidos en la app a nivel global.",
  ratio:
    "📊 Empate máximo resuelto por consumo: Seleccionado por haber ido más veces de copiloto en proporción a los viajes en esta zona.",
  sorteo:
    "🚨 Empate técnico absoluto en deudas, totales y ratio. Se requiere sorteo en la ruleta.",
};

// Determina qué criterio (deuda / total / ratio / sorteo) explica la propuesta.
// `conMetricas` debe venir YA ordenado por P1 deuda↓, P2 total↑, P3 ratio↑.
const determinarMotivo = (conMetricas, cochesNecesarios, requiereSorteo) => {
  if (requiereSorteo) return MOTIVOS.sorteo;
  if (conMetricas.length === 0) return "";
  // P1: si el mejor candidato arrastra deuda en la zona, esa es la razón.
  if (conMetricas[0].deuda > 0) return MOTIVOS.deuda;
  // Sin deuda: miramos qué desempató en el corte (último elegido vs primer excluido).
  const elegidos = conMetricas.slice(0, cochesNecesarios);
  const excluidos = conMetricas.slice(cochesNecesarios);
  if (excluidos.length === 0) return MOTIVOS.total; // no hubo competencia: conteo plano
  const ult = elegidos[elegidos.length - 1];
  const prim = excluidos[0];
  if (ult.total !== prim.total) return MOTIVOS.total; // P2: conteo plano
  if (ult.ratio !== prim.ratio) return MOTIVOS.ratio; // P3: ratio de zona
  return MOTIVOS.total;
};

// Carga un conjunto de amigos por id y los devuelve en un Map { id -> doc }.
const cargarAmigosMap = async (ids) => {
  const unicos = [...new Set(ids)];
  const docs = await Amigo.find({ _id: { $in: unicos } });
  return new Map(docs.map((a) => [a.id, a]));
};

// ──────────────────────────────────────────────────────────────────────────
// ALGORITMO DE SUGERENCIA AUTOMÁTICA
// Devuelve { confirmados, empatados, slotsRestantes, requiereSorteo }.
// Orden de prioridades votado por el grupo (encuesta P1):
//   P1: MAYOR deuda en la zona            (y.deuda - x.deuda)
//   P2: MENOS viajes conducidos TOTALES   (x.total - y.total)  ← "conteo plano"
//   P3: MENOR ratio en la zona            (x.ratio - y.ratio)  ← desempate final
// Si en el corte hay un empate técnico ABSOLUTO (misma deuda, total y ratio)
// que no cabe en los slots restantes, NO elige al azar: marca requiereSorteo.
// ──────────────────────────────────────────────────────────────────────────
export const calcularCandidatos = async (plan) => {
  const { zona, cochesNecesarios } = plan;

  console.log(
    `\n🧮 [calcularCandidatos] Plan "${plan.descripcion || plan.id}" | zona=${zona} | coches necesarios=${cochesNecesarios}`
  );

  const amigosMap = await cargarAmigosMap(plan.pasajeros);
  const elegibles = plan.pasajeros
    .map((id) => amigosMap.get(id))
    .filter((a) => a && a.poseeCoche);

  console.log(
    `   Pasajeros con coche elegibles: ${elegibles.map((a) => a.nombre).join(", ") || "(ninguno)"}`
  );

  const conMetricas = elegibles.map((a) => {
    const m = {
      id: a.id,
      nombre: a.nombre,
      deuda: a.deudaViajes[zona] || 0,
      ratio: ratioConduccion(a, zona),
      total: totalConducidos(a),
    };
    console.log(
      `   • ${a.nombre}: deuda[${zona}]=${m.deuda} | ratio=${m.ratio.toFixed(3)} ` +
        `(${a.viajesConducidos[zona]}/${a.viajesAsistidos[zona]}) | totalConducidos=${m.total}`
    );
    return m;
  });

  console.log(
    "   Orden de prioridades (voto del grupo): P1 deuda↓ · P2 totalConducidos↑ (conteo plano) · P3 ratio↑"
  );

  // Ordenación por prioridades (SIN azar: el azar se delega al sorteo visual):
  conMetricas.sort((x, y) => {
    if (y.deuda !== x.deuda) return y.deuda - x.deuda; // P1: mayor deuda en la zona
    if (x.total !== y.total) return x.total - y.total; // P2: menos conducidos TOTALES (conteo plano)
    return x.ratio - y.ratio; // P3: menor ratio en la zona (desempate final)
  });

  // Empate técnico ABSOLUTO = misma deuda, total y ratio (mismo orden que P1/P2/P3).
  const clave = (m) => `${m.deuda}|${m.total}|${m.ratio}`;

  const confirmados = [];
  let empatados = [];
  let slotsRestantes = 0;
  let i = 0;

  while (i < conMetricas.length && confirmados.length < cochesNecesarios) {
    const k = clave(conMetricas[i]);
    const grupo = [];
    let j = i;
    while (j < conMetricas.length && clave(conMetricas[j]) === k) {
      grupo.push(conMetricas[j]);
      j++;
    }
    const restantes = cochesNecesarios - confirmados.length;
    if (grupo.length <= restantes) {
      confirmados.push(...grupo.map((m) => m.id));
      i = j;
    } else {
      empatados = grupo;
      slotsRestantes = restantes;
      break;
    }
  }

  const requiereSorteo = empatados.length > 0;
  const motivoExplicacion = determinarMotivo(conMetricas, cochesNecesarios, requiereSorteo);
  console.log(
    `   ✅ Confirmados: ${confirmados.map((id) => amigosMap.get(id)?.nombre).join(", ") || "(ninguno)"}`
  );
  if (requiereSorteo) {
    console.log(
      `   🎲 EMPATE: ${empatados.map((m) => m.nombre).join(" = ")} -> sorteo para ${slotsRestantes} plaza(s)`
    );
  }
  console.log(`   💬 Motivo: ${motivoExplicacion}`);

  return { confirmados, empatados, slotsRestantes, requiereSorteo, motivoExplicacion };
};

// ──────────────────────────────────────────────────────────────────────────
// CONTROLADORES DE LOS ENDPOINTS
// ──────────────────────────────────────────────────────────────────────────

// GET /api/amigos -> ranking detallado con ratios, deudas y viajes.
export const getRankingAmigos = async (req, res) => {
  const amigos = await Amigo.find().sort({ createdAt: 1 });
  const ranking = amigos.map((a) => ({
    id: a.id,
    nombre: a.nombre,
    poseeCoche: a.poseeCoche,
    viajesAsistidos: a.viajesAsistidos,
    viajesConducidos: a.viajesConducidos,
    deudaViajes: a.deudaViajes,
    ratios: ZONAS.reduce(
      (acc, z) => ({ ...acc, [z]: Number(ratioConduccion(a, z).toFixed(3)) }),
      {}
    ),
    totalConducidos: totalConducidos(a),
  }));
  res.json(ranking);
};

// POST /api/amigos -> añade un amigo al grupo.
export const postCrearAmigo = async (req, res) => {
  const { nombre, poseeCoche } = req.body;
  if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
    return res.status(400).json({ error: "'nombre' es obligatorio" });
  }
  const amigo = await Amigo.create({
    nombre: nombre.trim(),
    poseeCoche: poseeCoche !== false,
  });
  console.log(`👥 [postCrearAmigo] Añadido ${amigo.nombre} (poseeCoche=${amigo.poseeCoche})`);
  res.status(201).json(amigo);
};

// PATCH /api/amigos/:id -> actualiza nombre y/o poseeCoche.
export const patchAmigo = async (req, res) => {
  const amigo = await Amigo.findById(req.params.id);
  if (!amigo) return res.status(404).json({ error: "Amigo no encontrado" });

  const { nombre, poseeCoche } = req.body;
  if (typeof nombre === "string" && nombre.trim()) amigo.nombre = nombre.trim();
  if (typeof poseeCoche === "boolean") amigo.poseeCoche = poseeCoche;

  await amigo.save();
  console.log(`👥 [patchAmigo] ${amigo.nombre} actualizado (poseeCoche=${amigo.poseeCoche})`);
  res.json(amigo);
};

// GET /api/planes -> todos los planes (orden fecha desc) con detalle de nombres.
export const getPlanes = async (req, res) => {
  const planes = await Plan.find().sort({ fecha: -1 });
  const amigos = await Amigo.find();
  const mapa = new Map(amigos.map((a) => [a.id, a]));

  const detalle = (id) => {
    const a = mapa.get(id);
    return a ? { id: a.id, nombre: a.nombre, poseeCoche: a.poseeCoche } : { id };
  };

  const enriquecido = planes.map((p) => {
    const obj = p.toJSON();
    return {
      ...obj,
      pasajerosDetalle: p.pasajeros.map(detalle),
      conductoresPropuestosDetalle: p.conductoresPropuestos.map((id) => {
        const a = mapa.get(id);
        return a ? { id: a.id, nombre: a.nombre } : { id };
      }),
      candidatosSorteoDetalle: p.sorteoPendiente
        ? p.sorteoPendiente.candidatos.map((id) => {
            const a = mapa.get(id);
            if (!a) return { id };
            return {
              id: a.id,
              nombre: a.nombre,
              deuda: a.deudaViajes[p.zona] || 0,
              ratio: Number(ratioConduccion(a, p.zona).toFixed(3)),
              total: totalConducidos(a),
            };
          })
        : [],
    };
  });

  res.json(enriquecido);
};

// POST /api/planes -> crea un plan.
export const postCrearPlan = async (req, res) => {
  const { descripcion, fecha, zona, pasajeros, cochesNecesarios } = req.body;

  if (!zona || !ZONAS.includes(zona)) {
    return res
      .status(400)
      .json({ error: `'zona' es obligatoria y debe ser una de: ${ZONAS.join(", ")}` });
  }
  if (!Array.isArray(pasajeros) || pasajeros.length === 0) {
    return res
      .status(400)
      .json({ error: "'pasajeros' debe ser un array con al menos un amigoId" });
  }

  const existentes = await cargarAmigosMap(pasajeros);
  const inexistentes = pasajeros.filter((id) => !existentes.has(id));
  if (inexistentes.length > 0) {
    return res
      .status(400)
      .json({ error: `Pasajeros inexistentes: ${inexistentes.join(", ")}` });
  }

  const coches =
    Number.isInteger(cochesNecesarios) && cochesNecesarios > 0 ? cochesNecesarios : 1;

  const plan = await Plan.create({
    descripcion,
    fecha: fecha ? new Date(fecha) : Date.now(),
    zona,
    pasajeros,
    cochesNecesarios: coches,
  });

  console.log(
    `\n📅 [postCrearPlan] Creado plan ${plan.id} "${plan.descripcion}" | zona=${zona} | pasajeros=${pasajeros.length} | coches=${coches}`
  );

  res.status(201).json(plan);
};

// GET /api/planes/:id/propuesta -> ejecuta el algoritmo y devuelve candidatos.
export const getPropuestaPlan = async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return res.status(404).json({ error: "Plan no encontrado" });
  if (plan.estado === "confirmado_post_viaje") {
    return res.status(409).json({ error: "El plan ya está confirmado" });
  }

  const { confirmados, empatados, slotsRestantes, requiereSorteo, motivoExplicacion } =
    await calcularCandidatos(plan);

  plan.conductoresPropuestos = confirmados;
  plan.motivoExplicacion = motivoExplicacion;
  if (requiereSorteo) {
    plan.estado = "en_sorteo";
    plan.sorteoPendiente = {
      candidatos: empatados.map((m) => m.id),
      slots: slotsRestantes,
    };
  } else {
    plan.estado = "abierto";
    plan.sorteoPendiente = null;
  }
  await plan.save();

  const amigosMap = await cargarAmigosMap(confirmados);
  const detalle = (id) => {
    const a = amigosMap.get(id);
    return { id, nombre: a?.nombre };
  };

  res.json({
    planId: plan.id,
    zona: plan.zona,
    cochesNecesarios: plan.cochesNecesarios,
    estado: plan.estado,
    requiereSorteo,
    slotsRestantes,
    conductoresPropuestos: confirmados.map(detalle),
    candidatosEmpatados: empatados,
    motivoExplicacion,
  });
};

// POST /api/planes/:id/fijar-sorteo -> consolida el resultado del sorteo visual.
export const fijarSorteo = async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return res.status(404).json({ error: "Plan no encontrado" });
  if (plan.estado !== "en_sorteo" || !plan.sorteoPendiente) {
    return res.status(409).json({ error: "El plan no está en estado de sorteo" });
  }

  const { amigoId } = req.body;
  if (!amigoId || !plan.sorteoPendiente.candidatos.includes(amigoId)) {
    return res.status(400).json({
      error: "'amigoId' debe ser uno de los candidatos empatados en sorteo",
    });
  }

  plan.conductoresPropuestos.push(amigoId);
  plan.sorteoPendiente.candidatos = plan.sorteoPendiente.candidatos.filter(
    (id) => id !== amigoId
  );
  plan.sorteoPendiente.slots -= 1;

  const elegido = await Amigo.findById(amigoId);
  console.log(`🎲 [fijarSorteo] Plan ${plan.id}: ${elegido?.nombre} sale elegido en el sorteo`);

  if (plan.sorteoPendiente.slots <= 0) {
    plan.estado = "abierto";
    plan.sorteoPendiente = null;
    console.log(`   ✅ Sorteo resuelto: plan ${plan.id} vuelve a "abierto"`);
  }

  await plan.save();
  res.json(plan);
};

// POST /api/planes/:id/postularse -> un voluntario se ofrece a conducir.
// Lo fija como conductor propuesto, cancela el sorteo y limpia los empatados.
export const postularse = async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return res.status(404).json({ error: "Plan no encontrado" });
  if (plan.estado === "confirmado_post_viaje") {
    return res.status(409).json({ error: "El plan ya está confirmado" });
  }

  const { amigoId } = req.body;
  const amigo = amigoId ? await Amigo.findById(amigoId).catch(() => null) : null;
  if (!amigo) return res.status(400).json({ error: "'amigoId' inválido" });
  if (!amigo.poseeCoche) {
    return res
      .status(400)
      .json({ error: `${amigo.nombre} no posee coche y no puede postularse` });
  }

  // El voluntario pasa a conductor propuesto (sin duplicar).
  if (!plan.conductoresPropuestos.includes(amigo.id)) {
    plan.conductoresPropuestos.push(amigo.id);
  }
  // Un voluntario asiste: si no estaba entre los pasajeros, lo añadimos.
  if (!plan.pasajeros.includes(amigo.id)) {
    plan.pasajeros.push(amigo.id);
  }
  // Se cancela el sorteo y se limpian los empatados.
  plan.sorteoPendiente = null;
  plan.estado = "abierto";

  await plan.save();
  console.log(`🙋 [postularse] ${amigo.nombre} se postula como conductor del plan ${plan.id}`);
  res.json(plan);
};

// POST /api/planes/:id/confirmar -> cierra el plan aplicando la lógica post-viaje.
export const cerrarYConfirmarPlan = async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) return res.status(404).json({ error: "Plan no encontrado" });
  if (plan.estado === "confirmado_post_viaje") {
    return res.status(409).json({ error: "El plan ya estaba confirmado" });
  }

  const { conductoresReales, viajeSoloJustificado } = req.body;
  if (!Array.isArray(conductoresReales)) {
    return res
      .status(400)
      .json({ error: "'conductoresReales' debe ser un array de amigoId" });
  }
  const soloJustificado = viajeSoloJustificado === true;

  const { zona } = plan;

  // Cargamos todos los amigos implicados (pasajeros + propuestos + reales).
  const idsImplicados = [
    ...plan.pasajeros,
    ...plan.conductoresPropuestos,
    ...conductoresReales,
  ];
  const amigosMap = await cargarAmigosMap(idsImplicados);

  // Validamos que los conductores reales existan y posean coche.
  for (const id of conductoresReales) {
    const a = amigosMap.get(id);
    if (!a) return res.status(400).json({ error: `Conductor real inexistente: ${id}` });
    if (!a.poseeCoche)
      return res
        .status(400)
        .json({ error: `${a.nombre} no posee coche y no puede figurar como conductor real` });
  }

  const propuestos = plan.conductoresPropuestos;
  const realesSet = new Set(conductoresReales);

  // Un sustituto externo que conduce también asiste.
  for (const id of conductoresReales) {
    if (!plan.pasajeros.includes(id)) {
      plan.pasajeros.push(id);
      console.log(`   ➜ ${amigosMap.get(id)?.nombre} era sustituto externo: añadido a pasajeros`);
    }
  }

  // "Viaje en solitario": el conductor fue solo, sin copilotos (único asistente).
  // Por voto del grupo, un viaje solo cuenta como conducido si va con pasajeros
  // normales o, yendo solo, si está justificado (fuerza mayor: trabajo/estudios).
  const viajeEnSolitario = plan.pasajeros.length <= 1;
  const cuentaComoConducido = !viajeEnSolitario || soloJustificado;

  console.log(`\n🏁 [cerrarYConfirmarPlan] Cerrando plan ${plan.id} | zona=${zona}`);
  console.log(`   Propuestos: ${propuestos.map((id) => amigosMap.get(id)?.nombre).join(", ") || "(ninguno)"}`);
  console.log(`   Reales:     ${conductoresReales.map((id) => amigosMap.get(id)?.nombre).join(", ") || "(ninguno)"}`);

  // 1) Propuestos que NO condujeron -> +1 deuda.
  for (const id of propuestos) {
    if (!realesSet.has(id)) {
      const a = amigosMap.get(id);
      if (!a) continue;
      a.deudaViajes[zona] += 1;
      a.markModified("deudaViajes");
      console.log(`   ➕ ${a.nombre} no condujo: deuda[${zona}] -> ${a.deudaViajes[zona]}`);
    }
  }

  // 2) Conductores reales -> saldan deuda (si la hay) y suman conducido.
  for (const id of conductoresReales) {
    const a = amigosMap.get(id);

    // Viaje en solitario por gusto (no justificado): NO ayuda al grupo, así que
    // ni suma conducido ni salda deuda (la deuda queda congelada).
    if (!cuentaComoConducido) {
      console.log(
        `⚠️  [cerrarYConfirmarPlan] Conductor fue solo por gusto: NO suma conducidos y NO salda deuda (${a.nombre})`
      );
      continue;
    }

    if (a.deudaViajes[zona] > 0) {
      a.deudaViajes[zona] -= 1;
      a.markModified("deudaViajes");
      console.log(`   ➖ ${a.nombre} salda deuda: deuda[${zona}] -> ${a.deudaViajes[zona]}`);
    }
    a.viajesConducidos[zona] += 1;
    a.markModified("viajesConducidos");
    console.log(`   🚗 ${a.nombre} condujo: viajesConducidos[${zona}] -> ${a.viajesConducidos[zona]}`);
  }

  // 3) Todos los pasajeros -> +1 asistido.
  for (const id of plan.pasajeros) {
    const a = amigosMap.get(id);
    if (!a) continue;
    a.viajesAsistidos[zona] += 1;
    a.markModified("viajesAsistidos");
    console.log(`   👤 ${a.nombre} asistió: viajesAsistidos[${zona}] -> ${a.viajesAsistidos[zona]}`);
  }

  // 4) Persistimos amigos y cerramos el plan.
  await Promise.all([...amigosMap.values()].map((a) => a.save()));

  plan.conductoresReales = conductoresReales;
  plan.viajeSoloJustificado = soloJustificado;
  plan.estado = "confirmado_post_viaje";
  await plan.save();

  console.log(`   ✅ Plan ${plan.id} confirmado_post_viaje`);
  res.json(plan);
};
