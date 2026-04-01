const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Leitura = sequelize.define("Leitura", {
  sensor:    { type: DataTypes.STRING,  allowNull: false },
  topico:    { type: DataTypes.STRING,  allowNull: false },
  payload:   { type: DataTypes.TEXT,    allowNull: false },
  qos:       { type: DataTypes.INTEGER, allowNull: false },
  duplicada: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: "leituras" });

module.exports = Leitura;