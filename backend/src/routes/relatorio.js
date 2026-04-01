const { Router } = require("express");
const { obterRelatorio } = require("../controllers/relatorioController");

const router = Router();
router.get("/", obterRelatorio);

module.exports = router;