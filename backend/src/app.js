require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const { iniciarSubscriber } = require("./services/mqttService");
const { iniciarSensorIncendio } = require("./sensors/incendio");
const leituraRoutes = require("./routes/leituras");
const publicacaoRoutes = require("./routes/publicacoes");
const relatorioRoutes = require("./routes/relatorio");
const sensorRoutes = require("./routes/sensores");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/leituras", leituraRoutes);
app.use("/api/publicacoes", publicacaoRoutes);
app.use("/api/relatorio", relatorioRoutes);
app.use("/api/sensores", sensorRoutes);

app.get("/", (_req, res) => {
  res.json({
    projeto: "Monitoramento de Estufa Agricola",
    versao: "1.0.0",
    endpoints: [
      "GET /api/leituras",
      "GET /api/publicacoes",
      "GET /api/relatorio",
      "POST /api/sensores/incendio/disparar",
    ],
  });
});

async function iniciar() {
  try {
    await sequelize.authenticate();
    console.log("[APP] Banco de dados conectado.");
    await sequelize.sync({ alter: true });
    console.log("[APP] Modelos sincronizados.");

    iniciarSubscriber();
    iniciarSensorIncendio("sensor-incendio-api");

    app.listen(PORT, () => {
      console.log(`[APP] API rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[APP] Erro ao iniciar:", err);
    process.exit(1);
  }
}

iniciar();