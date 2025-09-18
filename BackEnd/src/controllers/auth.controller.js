import { UserModel } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../helpers/bcrypt.helpers.js";
import { generateToken } from "../helpers/jwt.helpers.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    const hashedPassword = await hashPassword(password);

    const existingUser = await UserModel.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ msg: "Nombre de usuario ya registrado" });
    }
    const existingEmail = await UserModel.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({ msg: "Email ya registrado" });
    }

    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      profile,
    });
    return res.status(201).json({ msg: "Usuario registrado existosamente" });
  } catch (error) {
    return res.status(500).json({ smg: "Error interno del servidor" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username: username });
    if (!user) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }
    const validPassword = comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }
    const token = generateToken({
      id: user.id,
      username: user.username,
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });

    return res.status(200).json({ msg: "Login Exitoso" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Error interno del Servidor" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ ok: true, msg: "Logout exitoso" });
};
