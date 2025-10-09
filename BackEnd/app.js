import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

/* ===================== CORS ===================== */
const ALLOWED_ORIGINS = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // Postman / curl
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Habilitar CORS para todas las rutas
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
/* ================================================= */

app.use(express.json());

// Middleware de logs
app.use((req, _res, next) => {
  if (req.method !== "GET") {
    console.log(`[${req.method}] ${req.originalUrl} BODY:`, JSON.stringify(req.body));
  } else {
    console.log(`[${req.method}] ${req.originalUrl}`);
  }
  next();
});

/* Rutas */
app.use("/api", userRoute);
app.use("/api", projectRoute);
app.use("/api", listRoute);
app.use("/api", plantRoute);
app.use("/api", insectRoute);
app.use("/api", authRoute);

/* Arranque */
app.listen(PORT, async () => {
  await mongo_DB();
  console.log(`Servidor funcionando en localhost:${PORT}`);
});
