import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { signToken } from "../utils/jwt.js";

const PWD_MIN = parseInt(process.env.PASSWORD_MIN_LEN || "8", 10);
const PWD_MAX = parseInt(process.env.PASSWORD_MAX_LEN || "64", 10);

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validación adicional por si el middleware no corrió
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Campos requeridos: name, email, password" });
    }
    if (password.length < PWD_MIN || password.length > PWD_MAX) {
      return res.status(400).json({ message: `La contraseña debe tener entre ${PWD_MIN} y ${PWD_MAX} caracteres` });
    }

    const exists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(409).json({ message: "El email ya está registrado" });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: "student", // siempre student al registrarse
      teacher_request_status: "none"
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teacher_request_status: user.teacher_request_status
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = signToken({ uid: user.id, role: user.role });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, teacher_request_status: user.teacher_request_status }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}

export async function me(_req, res) {
  // req.user viene del authGuard (payload JWT)
  return res.json({ user: res.req.user });
}
