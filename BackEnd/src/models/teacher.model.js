import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const TeacherModel = sequelize.define("Teacher", {
  name: {
    type: DataTypes.STRING(100),
    unique: false,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.CHAR(),
    unique: false,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING(40),
    unique: false,
    allowNull: false,
  },
});
