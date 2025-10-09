// Firma directa del JWT con { uid } para que coincida con el middleware
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helpers.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function signToken(uid, extra = {}) {
  return jwt.sign({ uid, ...extra }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

/* ============================
   POST /api/register
   ============================ */
export const register = async (req, res) => {
  try {
    let { username, email, password, profile } = req.body;
    if (!username || !email || !password || !profile?.first_name || !profile?.last_name) {
      return res.status(400).json({ msg: "Faltan campos obligatorios" });
    }
    username = String(username).trim();
    email = String(email).trim().toLowerCase();

    const [existingUser, existingEmail] = await Promise.all([
      UserModel.findOne({ username }),
      UserModel.findOne({ email }),
    ]);
    if (existingUser) return res.status(400).json({ msg: "Nombre de usuario ya registrado" });
    if (existingEmail) return res.status(400).json({ msg: "Email ya registrado" });

    const hashedPassword = await hashPassword(password);
    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      profile: { first_name: profile.first_name, last_name: profile.last_name },
    });

    const token = signToken(user._id.toString(), { username: user.username });

    return res.status(201).json({
      ok: true,
      msg: "Usuario registrado existosamente",
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

/* ============================
   POST /api/login
   ============================ */
export const login = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!password || (!username && !email)) {
      return res.status(400).json({ msg: "Faltan credenciales" });
    }
    const query = email
      ? { email: String(email).trim().toLowerCase() }
      : { username: String(username).trim() };

    const user = await UserModel.findOne(query);
    if (!user) return res.status(401).json({ msg: "Credenciales inválidas" });

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) return res.status(401).json({ msg: "Credenciales inválidas" });

    const token = signToken(user._id.toString(), { username: user.username });

    // (opcional) cookie httpOnly
    res.cookie("token", token, { httpOnly: true, maxAge: 1000 * 60 * 60 });

    return res.status(200).json({
      ok: true,
      msg: "Login Exitoso",
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.log("login error:", error);
    return res.status(500).json({ msg: "Error interno del Servidor" });
  }
};

export const logout = async (_req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ ok: true, msg: "Logout exitoso" });
};
