require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { sequelize } = require("../models");
const { iniciarSensorTemperatura } = require("./temperatura");
const { iniciarSensorReservatorio } = require("./reservatorio");
const { iniciarSensorIncendio } = require("./incendio");

async function iniciar() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("[SENSORS] Banco de dados conectado.");

    iniciarSensorTemperatura();
    iniciarSensorReservatorio();
    iniciarSensorIncendio();

    console.log("[SENSORS] Todos os sensores iniciados.");
  } catch (err) {
    console.error("[SENSORS] Erro ao iniciar:", err);
    process.exit(1);
  }
}

iniciar();