import express from "express";
import dotenv from "dotenv";
import { mongo_DB } from "./src/config/database.js";
import userRoute from "./src/routes/user.route.js";
import projectRoute from "./src/routes/project.route.js";
import listRoute from "./src/routes/list.route.js";
import plantRoute from "./src/routes/plant.route.js";
import insectRoute from "./src/routes/insect.route.js";
import authRoute from "./src/routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", userRoute);
app.use("/api", projectRoute);
app.use("/api", listRoute);
app.use("/api", plantRoute);
app.use("/api", insectRoute);
app.use("/api", authRoute);

app.listen(PORT, async () => {
  await mongo_DB(), console.log(`Servidor funcionando en localhost: ${PORT}`);
  console.log("LO VIEJO VA ACÁ ↑↑↑↑↑");
  console.log("---------------------------------------");
  console.log("LO NUEVO VA ACÁ ↓↓↓↓↓");
});
