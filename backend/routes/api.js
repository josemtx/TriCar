import { Router } from "express";
import {
  getRankingAmigos,
  postCrearAmigo,
  patchAmigo,
  getPlanes,
  postCrearPlan,
  getPropuestaPlan,
  fijarSorteo,
  postularse,
  cerrarYConfirmarPlan,
} from "../controllers/repartoController.js";

const router = Router();

// Health check
router.get("/health", (req, res) => res.json({ status: "ok" }));

// Amigos
router.get("/amigos", getRankingAmigos);
router.post("/amigos", postCrearAmigo);
router.patch("/amigos/:id", patchAmigo);

// Planes
router.get("/planes", getPlanes);
router.post("/planes", postCrearPlan);
router.get("/planes/:id/propuesta", getPropuestaPlan);
router.post("/planes/:id/fijar-sorteo", fijarSorteo);
router.post("/planes/:id/postularse", postularse);
router.post("/planes/:id/confirmar", cerrarYConfirmarPlan);

export default router;
