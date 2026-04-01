const { Router } = require("express");
const { disparar } = require("../controllers/sensorController");

const router = Router();
router.post("/incendio/disparar", disparar);

module.exports = router;