import { Schema, model, Types } from "mongoose";

const InsectSchema = new Schema(
  {
    reino: {
      type: String,
      default: "Animalia",
    },
    filo: {
      type: String,
      default: "Arthropoda",
    },
    clase: {
      type: String,
      default: "Insecta",
    },
    orden: {
      type: String,
      required: true,
    },
    familia: {
      type: String,
      required: true,
    },
    subfamilia: {
      type: String,
    },
    tribu: {
      type: String,
    },
    subtribu: {
      type: String,
    },
    genero: {
      type: String,
      required: true,
    },
    especie: {
      type: String,
      required: true,
    },
    subespecie: {
      type: String,
    },
    nombreComun: [
      {
        nombre: { type: String, trim: true },
        region: { type: String, trim: true },
        idioma: { type: String, trim: true },
      },
    ],
  },
  {
    versionKey: false,
    toJSON: { virtuals: true }, // toJson y toObject son configuraciones que permiten que enviar datos
    toObject: { virtuals: true }, // al cliente, incluyendo los campos virtuales
  }
);

InsectSchema.virtual("lists", {
  ref: "List",
  localField: "_id",
  foreignField: "insects",
});

export const InsectModel = model("Insect", InsectSchema);
