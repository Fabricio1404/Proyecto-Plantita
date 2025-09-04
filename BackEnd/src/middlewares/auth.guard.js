import { verifyToken } from "../utils/jwt.js";

export function authGuard(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Token requerido" });

    const payload = verifyToken(token); // { uid, role, iat, exp }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}
