const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Publicacao = sequelize.define("Publicacao", {
  sensor:  { type: DataTypes.STRING,  allowNull: false },
  topico:  { type: DataTypes.STRING,  allowNull: false },
  payload: { type: DataTypes.TEXT,    allowNull: false },
  qos:     { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "publicacoes" });

module.exports = Publicacao;