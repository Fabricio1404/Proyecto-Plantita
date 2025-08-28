import dotenv from "dotenv";
dotenv.config();
import { sequelize } from "../src/config/database.js";
import "../src/models/user.model.js";

try {
  await sequelize.sync({ alter: true });
  console.log("✅ Tablas sincronizadas");
  process.exit(0);
} catch (err) {
  console.error("❌ Error al sincronizar:", err);
  process.exit(1);
}
