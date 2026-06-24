import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api.js";
import { conectarDB } from "./data/store.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API (incluye /api/health)
app.use("/api", apiRouter);

// Manejador de errores: responde JSON limpio ante fallos (CastError, etc.).
app.use((err, req, res, _next) => {
  console.error("💥 [error]", err.message);
  const status = err.name === "CastError" ? 400 : err.status || 500;
  res.status(status).json({ error: err.message || "Error interno del servidor" });
});

// Conectamos a MongoDB y solo entonces levantamos el servidor.
const arrancar = async () => {
  try {
    await conectarDB();
    app.listen(PORT, () => {
      console.log(`🚗 Servidor de CocheCompartido escuchando en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error("❌ No se pudo iniciar el servidor:", err.message);
    process.exit(1);
  }
};

arrancar();
