import { Schema, model } from "mongoose";

const ListItemSchema = new Schema(
  {
    taxon_id: { 
      type: Number, required: true },          // ID iNaturalist
    nombre: { type: String, default: null },             // nombre común (ES) - opcional
    nombre_cientifico: { type: String, required: true }, // nombre científico
    foto_url: { type: String, default: null },
    notes: { type: String, default: null },
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const ListSchema = new Schema(
  {
    owner: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true },
    name: { 
      type: String, 
      required: true, 
      trim: true },
    type: { 
      type: String, 
      enum: ["plantas", "insectos", "mixta"], 
      default: "mixta" },
    items: 
    { type: [ListItemSchema], 
      default: [] },
  },
  { timestamps: true }
);

// Unicidad: un mismo usuario no puede repetir nombre de lista
ListSchema.index({ owner: 1, name: 1 }, { unique: true });

export const ListModel = model("List", ListSchema);
