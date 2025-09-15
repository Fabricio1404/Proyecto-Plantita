import { model, Schema, Types } from "mongoose";

const ListSchema = new Schema(
  {
    list_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    author: {
      type: Types.ObjectId,
      ref: "User",
      required: true, //La idea es que este campo se rellene automáticamente
    },
    plants: [
      {
        type: Types.ObjectId,
        ref: "Plant",
      },
    ],
    insects: [
      {
        type: Types.ObjectId,
        ref: "Insect",
      },
    ],
  },
  { versionKey: false }
);

export const ListModel = model("List", ListSchema);
