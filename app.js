import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




app.get("/salud", (_req, res) => res.json({ ok: true, message: "API viva (formato clase)" }));

app.listen(PORT, () => console.log(`🚀 Server en http://localhost:${PORT}`));
