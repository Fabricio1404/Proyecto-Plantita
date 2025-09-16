import { model, Schema, Types } from "mongoose";

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: String,
    },
    creator: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { versionKey: false }
);

export const ProjectModel = model("Project", ProjectSchema);
