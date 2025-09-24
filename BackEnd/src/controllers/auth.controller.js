import { UserModel } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helpers.js";
import { generateToken } from "../helpers/jwt.helpers.js";

/* ============================
   POST /api/register
   - Valida campos requeridos
   - Normaliza email/username
   - Verifica duplicados
   - Hashea contraseña y crea user
   - Devuelve 201 con user y token
   ============================ */
export const register = async (req, res) => {
  try {
    let { username, email, password, profile } = req.body;

    // Validación mínima (tu schema pide profile.first_name / profile.last_name)
    if (
      !username ||
      !email ||
      !password ||
      !profile?.first_name ||
      !profile?.last_name
    ) {
      return res.status(400).json({ msg: "Faltan campos obligatorios" });
    }

    // Normalizaciones
    username = String(username).trim();
    email = String(email).trim().toLowerCase();

    // Unicidad
    const [existingUser, existingEmail] = await Promise.all([
      UserModel.findOne({ username }),
      UserModel.findOne({ email }),
    ]);
    if (existingUser) {
      return res.status(400).json({ msg: "Nombre de usuario ya registrado" });
    }
    if (existingEmail) {
      return res.status(400).json({ msg: "Email ya registrado" });
    }

    // Hash + create
    const hashedPassword = await hashPassword(password);
    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      profile: {
        first_name: profile.first_name,
        last_name: profile.last_name,
      },
    });

    // Token (útil si tu front lo guarda)
    const token = generateToken({ id: user.id, username: user.username });

    return res.status(201).json({
      ok: true,
      msg: "Usuario registrado existosamente",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    console.error("register error:", error);
    return res.status(500).json({ msg: "Error interno del servidor" }); // (antes tenías 'smg')
  }
};

/* ============================
   POST /api/login
   - Acepta username O email
   - Usa AWAIT en comparePassword (bug crítico)
   - Devuelve 200 con user y token y setea cookie httpOnly
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

    // Si en tu schema 'password' tuviera select:false, usar: .select("+password")
    const user = await UserModel.findOne(query);
    if (!user) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    // ⚠️ IMPORTANTE: AWAIT (si no, siempre “pasa”)
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1h
    });

    return res.status(200).json({
      ok: true,
      msg: "Login Exitoso",
      token,
      user: {
        id: user.id,
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
