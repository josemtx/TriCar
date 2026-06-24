import mongoose from "mongoose";

const { Schema } = mongoose;

// Contador por zona reutilizable: {NORTE, SUR, CUMBRE}
const contadorSchema = new Schema(
  {
    NORTE: { type: Number, default: 0 },
    SUR: { type: Number, default: 0 },
    CUMBRE: { type: Number, default: 0 },
  },
  { _id: false }
);

const amigoSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    poseeCoche: { type: Boolean, default: true },
    viajesAsistidos: { type: contadorSchema, default: () => ({}) },
    viajesConducidos: { type: contadorSchema, default: () => ({}) },
    deudaViajes: { type: contadorSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Exponemos `id` (string) y ocultamos `_id`/`__v` en las respuestas JSON.
amigoSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

export const Amigo = mongoose.model("Amigo", amigoSchema);
