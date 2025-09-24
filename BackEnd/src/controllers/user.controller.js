import { UserModel } from "../models/user.model.js";
import { ProjectModel } from "../models/project.model.js";

// crear
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      profile,
      /*  first_name,
      last_name,
      recovery_email, */
    } = req.body;

    // ACLARACIÓN DEL PROFE, uso profile únicamente, porque con las validaciones no debería llegar nada a este punto si es nulo o algo similar.

    /* Esto es para los casos de documentos embebidos,
    para cuando el usuario mande el documento completo o
    solo una parte, No es necesario en este caso
    porque profile siempre se va a mandar casi completo
    pero lo dejo para futuras refernecias
    const profileData = profile || {
      first_name,
      last_name,
      recovery_email,
    }; */
    const newUser = await UserModel.create({
      username,
      email,
      password,
      /* profile: profileData, */
      profile,
    });
    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// buscar todos
export const findAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().populate("lists", "projects");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// buscar por id
export const findUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).populate("lists", "projects");
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// actualizar
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      password,
      profile,
      /* first_name,
      last_name,
      recovery_email, */
    } = req.body;

    /*  Lo mismo acá
    const profileData = profile || {
      first_name,
      last_name,
      recovery_email,
    }; */
    const user = await UserModel.findByIdAndUpdate(
      id,
      { username, email, password, profile /* profile: profileData */ },
      { new: true }
    );
    return res.status(200).json({ msg: "Actualización exitosa" });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// eliminar
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findByIdAndUpdate(id, { deleted: true });
    await ProjectModel.findByIdAndDelete(user.projects);
    return res.status(200).json({ msg: "Eliminación exitosa" });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

/* Otra forma de hacer lo del return es res.status(200).json({ok: true, msg: "etc", data: "la constante"}) */
