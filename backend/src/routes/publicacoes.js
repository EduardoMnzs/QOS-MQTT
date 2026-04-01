const { Router } = require("express");
const { listar, listarPorSensor } = require("../controllers/publicacaoController");

const router = Router();
router.get("/", listar);
router.get("/:sensor", listarPorSensor);

module.exports = router;