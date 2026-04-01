const { Leitura } = require("../models");
const { Op } = require("sequelize");

async function listar(req, res) {
  try {
    const { sensor, limit = 50, offset = 0 } = req.query;
    const where = sensor ? { sensor } : {};
    const rows = await Leitura.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function listarPorSensor(req, res) {
  try {
    const { sensor } = req.params;
    const { limit = 20 } = req.query;
    const rows = await Leitura.findAll({
      where: { sensor },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { listar, listarPorSensor };