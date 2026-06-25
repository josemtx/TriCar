// ──────────────────────────────────────────────────────────────────────────
// Conexión a MongoDB (Mongoose) y siembra inicial de datos.
// Sustituye al antiguo almacén en memoria + db.json.
// ──────────────────────────────────────────────────────────────────────────
import mongoose from "mongoose";
import dns from "node:dns";

export const ZONAS = ["NORTE", "SUR", "CUMBRE"];

// Salvaguarda DNS: si el resolvedor de Node solo apunta a loopback (127.0.0.1),
// las búsquedas SRV de mongodb+srv:// fallan con ECONNREFUSED. En ese caso
// recurrimos a DNS públicos para poder resolver el clúster de Atlas.
const asegurarDNSResoluble = () => {
  const servers = dns.getServers();
  const soloLoopback = servers.every(
    (s) => s.startsWith("127.") || s === "::1" || s.startsWith("::1")
  );
  if (soloLoopback) {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    console.warn(
      `⚠️  [store] DNS del sistema no resoluble (${servers.join(", ")}); usando DNS público (1.1.1.1, 8.8.8.8)`
    );
  }
};

// Helper: contador por zona inicializado a 0 -> {NORTE:0, SUR:0, CUMBRE:0}
export const contadorPorZona = () =>
  ZONAS.reduce((acc, zona) => ({ ...acc, [zona]: 0 }), {});

// Datos semilla del grupo real (solo se insertan si la colección está vacía).
const SEMILLA_AMIGOS = [
  { nombre: "Alvaro", poseeCoche: true },
  { nombre: "Cyn", poseeCoche: true },
  { nombre: "Lucia", poseeCoche: true },
  { nombre: "Isa", poseeCoche: true },
  { nombre: "Mataix", poseeCoche: true }, // administrador / usuario principal
  { nombre: "Gema", poseeCoche: true },
  { nombre: "Emmi", poseeCoche: true },
  { nombre: "Adrito", poseeCoche: true },
  { nombre: "Isidro", poseeCoche: true },
];

// Inserta la semilla si no hay ningún amigo todavía.
export const sembrarSiVacio = async () => {
  // Import dinámico para evitar dependencias circulares con el modelo.
  const { Amigo } = await import("../models/Amigo.js");
  const total = await Amigo.countDocuments();
  if (total === 0) {
    await Amigo.insertMany(SEMILLA_AMIGOS);
    console.log(`🌱 [seed] Base de datos vacía: insertados ${SEMILLA_AMIGOS.length} amigos semilla`);
  } else {
    console.log(`💾 [store] Base de datos con ${total} amigos existentes`);
  }
};

// Si no hay MONGODB_URI, intenta levantar un MongoDB EFÍMERO en memoria
// (solo disponible en desarrollo, donde mongodb-memory-server está instalado).
// En producción esa dependencia no existe, así que exige MONGODB_URI.
const obtenerUri = async () => {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  try {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mem = await MongoMemoryServer.create();
    console.warn(
      "⚠️  [store] Sin MONGODB_URI: usando MongoDB EN MEMORIA (los datos se " +
        "perderán al reiniciar). Configura MONGODB_URI para usar tu BD real."
    );
    return mem.getUri();
  } catch {
    throw new Error(
      "Falta la variable de entorno MONGODB_URI. Configúrala en backend/.env " +
        "(ver backend/.env.example)."
    );
  }
};

// Conecta a MongoDB y siembra si procede.
export const conectarDB = async () => {
  const uri = await obtenerUri();

  // Solo relevante para cadenas SRV (Atlas): garantiza un DNS resoluble.
  if (uri.startsWith("mongodb+srv://")) asegurarDNSResoluble();

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("✅ [store] Conectado a MongoDB");

  await sembrarSiVacio();
};
