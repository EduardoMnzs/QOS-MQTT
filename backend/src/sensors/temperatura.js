require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mqtt = require("mqtt");
const { BROKER_URL } = require("../config/mqtt");
const { Publicacao } = require("../models");

const TOPICO = "estufa/temp/ambiente";
const QOS = 0;
const INTERVALO_MS = 5000;

function gerarTemperatura() {
  return (18 + Math.random() * 22).toFixed(1);
}

function iniciarSensorTemperatura() {
  const client = mqtt.connect(BROKER_URL, {
    clientId: "sensor-temperatura",
    clean: true,
  });

  let iniciado = false;

  client.on("connect", () => {
    console.log("[TEMP] Sensor de Temperatura conectado (QoS 0)");
    if (iniciado) return;
    iniciado = true;

    setInterval(async () => {
      if (!client.connected) return;
      const payload = JSON.stringify({
        sensor: "temperatura",
        valor: parseFloat(gerarTemperatura()),
        unidade: "C",
        timestamp: new Date().toISOString(),
      });

      client.publish(TOPICO, payload, { qos: QOS }, async (err) => {
        if (err) return console.error("[TEMP] Erro ao publicar:", err.message);
        console.log(`[TEMP] Publicado (QoS 0): ${payload.substring(0, 60)}`);
        try {
          await Publicacao.create({ sensor: "temperatura", topico: TOPICO, payload, qos: QOS });
        } catch (e) { console.error("[TEMP] Erro BD:", e.message); }
      });
    }, INTERVALO_MS);
  });

  client.on("reconnect", () => console.log("[TEMP] Reconectando..."));
  client.on("offline",   () => console.warn("[TEMP] Sensor offline."));
  client.on("error",     (err) => console.error("[TEMP] Erro MQTT:", err.message));
  return client;
}

module.exports = { iniciarSensorTemperatura };