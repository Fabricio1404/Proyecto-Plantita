import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mongo_DB } from "./src/config/database.js";

import userRoute from "./src/routes/user.route.js";
import projectRoute from "./src/routes/project.route.js";
import listRoute from "./src/routes/list.route.js";
import plantRoute from "./src/routes/plant.route.js";
import insectRoute from "./src/routes/insect.route.js";
import authRoute from "./src/routes/auth.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

const ALLOWED = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (ALLOWED.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

// Montaje de rutas
app.use("/api", userRoute);
app.use("/api", projectRoute);
app.use("/api", listRoute);
app.use("/api", plantRoute);
app.use("/api", insectRoute);
app.use("/api", authRoute);

app.listen(PORT, async () => {
  await mongo_DB();
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
