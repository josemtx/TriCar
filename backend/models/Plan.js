import mongoose from "mongoose";
import { ZONAS } from "../data/store.js";

const { Schema } = mongoose;

const sorteoPendienteSchema = new Schema(
  {
    candidatos: { type: [String], default: [] }, // ids de amigos empatados
    slots: { type: Number, default: 0 },
  },
  { _id: false }
);

const planSchema = new Schema(
  {
    descripcion: { type: String, default: "", trim: true },
    fecha: { type: Date, default: Date.now },
    zona: { type: String, enum: ZONAS, required: true },
    pasajeros: { type: [String], default: [] }, // ids de amigos
    cochesNecesarios: { type: Number, default: 1, min: 1 },
    conductoresPropuestos: { type: [String], default: [] },
    conductoresReales: { type: [String], default: [] },
    // Marca si un viaje en solitario fue por fuerza mayor (cuenta como conducido).
    viajeSoloJustificado: { type: Boolean, default: false },
    // Explicación en lenguaje natural del porqué de la propuesta de conductores.
    motivoExplicacion: { type: String, default: "" },
    sorteoPendiente: { type: sorteoPendienteSchema, default: null },
    estado: {
      type: String,
      enum: ["abierto", "en_sorteo", "confirmado_post_viaje"],
      default: "abierto",
    },
  },
  { timestamps: true }
);

planSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Plan = mongoose.model("Plan", planSchema);
