import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false,
      validate: { notEmpty: true, len: [2, 80] },
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    // Rol actual del usuario (hoy: todos se registran como 'student')
    role: {
      type: DataTypes.ENUM("student", "teacher", "admin"),
      allowNull: false,
      defaultValue: "student",
    },

    // Preparado para solicitud de rol profesor (futuro)
    teacher_request_status: {
      type: DataTypes.ENUM("none", "pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "none",
    },
    teacher_request_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    teacher_proof_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    teacher_institution: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    teacher_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    teacher_reviewed_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      // más adelante podés relacionarlo con User(id) 
    },
    teacher_review_note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["email"] },
    ],
  }
);
