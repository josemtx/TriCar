import { Router } from "express";
import { Amigo } from "../models/Amigo.js";
import { Plan } from "../models/Plan.js";
import { contadorPorZona } from "../data/store.js";

const router = Router();

// Bloqueo de seguridad: este router NUNCA debe operar en producción.
// Evita que alguien borre la base de datos real en Render por error.
router.use((req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res
      .status(403)
      .json({ error: "Endpoint de desarrollo deshabilitado en producción" });
  }
  next();
});

// POST /api/dev/reset -> borra planes y pone a 0 los contadores de los amigos.
router.post("/reset", async (req, res) => {
  const planesBorrados = await Plan.deleteMany({});

  // Reinicia los tres contadores por zona de TODOS los amigos (los 9 reales).
  const r = await Amigo.updateMany(
    {},
    {
      $set: {
        viajesConducidos: contadorPorZona(),
        viajesAsistidos: contadorPorZona(),
        deudaViajes: contadorPorZona(),
      },
    }
  );

  console.log(
    `🧪 [dev/reset] ${planesBorrados.deletedCount} planes borrados · ${r.modifiedCount} amigos reseteados a 0`
  );

  res.json({
    ok: true,
    planesBorrados: planesBorrados.deletedCount,
    amigosReseteados: r.modifiedCount,
  });
});

export default router;
