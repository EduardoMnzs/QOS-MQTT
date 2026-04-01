require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mqtt = require("mqtt");
const { BROKER_URL } = require("../config/mqtt");
const { Publicacao } = require("../models");

const TOPICO = "estufa/alerta/incendio";
const QOS = 2;
const COOLDOWN_MS = 10000;

let clientIncendio = null;
let ultimoAlerta = 0;

async function dispararAlerta(origem = "SENSOR") {
  const agora = Date.now();
  if (agora - ultimoAlerta < COOLDOWN_MS) {
    console.log("[FOGO] Cooldown ativo, aguarde.");
    return false;
  }
  if (!clientIncendio || !clientIncendio.connected) {
    console.error("[FOGO] Cliente MQTT nao conectado.");
    return false;
  }

  ultimoAlerta = agora;
  const payload = JSON.stringify({
    sensor: "incendio",
    alerta: true,
    origem,
    timestamp: new Date().toISOString(),
  });

  return new Promise((resolve) => {
    clientIncendio.publish(TOPICO, payload, { qos: QOS }, async (err) => {
      if (err) {
        console.error("[FOGO] Erro ao publicar:", err.message);
        return resolve(false);
      }
      console.log(`[FOGO] ALERTA DISPARADO (QoS 2) - origem: ${origem}`);
      try {
        await Publicacao.create({ sensor: "incendio", topico: TOPICO, payload, qos: QOS });
      } catch (e) { console.error("[FOGO] Erro BD:", e.message); }
      resolve(true);
    });
  });
}

function iniciarSimulacaoAleatoria() {
  const min = 60000;
  const max = 120000;
  const intervalo = Math.round(min + Math.random() * (max - min));
  setTimeout(async () => {
    await dispararAlerta("SIMULADO");
    iniciarSimulacaoAleatoria();
  }, intervalo);
}

function iniciarSensorIncendio(clientId = "sensor-incendio") {
  const isSimulador = clientId === "sensor-incendio";

  clientIncendio = mqtt.connect(BROKER_URL, {
    clientId,
    clean: false,
  });

  clientIncendio.on("connect", () => {
    console.log(`[FOGO] Sensor de Incendio conectado (QoS 2) — clientId: ${clientId}`);
    if (isSimulador) {
      iniciarSimulacaoAleatoria();
    }
  });

  clientIncendio.on("error", (err) => console.error("[FOGO] Erro MQTT:", err.message));
  return clientIncendio;
}

module.exports = { iniciarSensorIncendio, dispararAlerta };