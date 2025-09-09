import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./src/config/database.js";
import userRoutes from "./src/routes/user.routes.js";
import studentRoutes from "./src/routes/student.route.js";
import teacherRoutes from "./src/routes/teacher.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares base
app.use(express.json());
app.use(cors());

/* const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public"))); */

// Ruta de salud (prueba rápida)
app.get("/salud", (_req, res) => {
  res.json({ ok: true, message: "API viva (formato clase)" });
});

app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server en http://localhost:${PORT}`);
  });
})();
