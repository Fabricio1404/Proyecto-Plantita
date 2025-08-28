import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
  }
);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a MySQL OK");
  } catch (err) {
    console.error("❌ Error al conectar a MySQL:", err.message);
    process.exit(1);
  }
}
