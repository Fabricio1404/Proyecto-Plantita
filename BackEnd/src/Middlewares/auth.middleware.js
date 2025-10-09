import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export const requireAuth = async (req, res, next) => {
  try {
    // Acepta Authorization, cookie o x-access-token
    const hdr = req.headers.authorization || "";
    const tokenHdr = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
    const tokenCookie = req.cookies?.token || null;
    const tokenX = req.header("x-access-token") || null;

    const token = tokenHdr || tokenCookie || tokenX;
    if (!token) return res.status(401).json({ ok: false, msg: "Token requerido" });

    const payload = jwt.verify(token, JWT_SECRET); // { uid, username, iat, exp }
    if (!payload?.uid) {
      console.warn("[AUTH] payload sin uid:", payload);
      return res.status(401).json({ ok: false, msg: "Token inválido" });
    }

    const user = await UserModel.findById(payload.uid).select("-password");
    if (!user) return res.status(401).json({ ok: false, msg: "Usuario no existe" });

    req.user = { id: user._id.toString(), role: user.role, username: user.username, email: user.email };
    next();
  } catch (err) {
    console.error("[AUTH] verify error:", err?.message || err);
    return res.status(401).json({ ok: false, msg: "Token inválido" });
  }
};
