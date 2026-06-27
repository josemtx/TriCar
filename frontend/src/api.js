// Cliente API centralizado para CocheCompartido.
// La URL base es dinámica: en producción se inyecta vía VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detalle = "";
    try {
      const data = await res.json();
      detalle = data.error || JSON.stringify(data);
    } catch {
      detalle = res.statusText;
    }
    throw new Error(detalle || `Error ${res.status}`);
  }
  return res.json();
}

export const ZONAS = ["NORTE", "SUR", "CUMBRE"];

export const api = {
  getAmigos: () => request("/amigos"),
  crearAmigo: (amigo) =>
    request("/amigos", { method: "POST", body: JSON.stringify(amigo) }),
  actualizarAmigo: (id, cambios) =>
    request(`/amigos/${id}`, { method: "PATCH", body: JSON.stringify(cambios) }),
  getPlanes: () => request("/planes"),
  crearPlan: (plan) =>
    request("/planes", { method: "POST", body: JSON.stringify(plan) }),
  getPropuesta: (planId) => request(`/planes/${planId}/propuesta`),
  fijarSorteo: (planId, amigoId) =>
    request(`/planes/${planId}/fijar-sorteo`, {
      method: "POST",
      body: JSON.stringify({ amigoId }),
    }),
  postularse: (planId, amigoId) =>
    request(`/planes/${planId}/postularse`, {
      method: "POST",
      body: JSON.stringify({ amigoId }),
    }),
  confirmarPlan: (planId, conductoresReales) =>
    request(`/planes/${planId}/confirmar`, {
      method: "POST",
      body: JSON.stringify({ conductoresReales }),
    }),
  // Solo desarrollo: borra planes y resetea contadores a 0.
  resetDev: () => request("/dev/reset", { method: "POST" }),
};
