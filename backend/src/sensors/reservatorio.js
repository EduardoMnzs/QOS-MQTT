require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mqtt = require("mqtt");
const { BROKER_URL } = require("../config/mqtt");
const { Publicacao } = require("../models");

const TOPICO = "estufa/agua/nivel";
const QOS = 1;
const INTERVALO_MS = 30000;

function iniciarSensorReservatorio() {
  const client = mqtt.connect(BROKER_URL, {
    clientId: "sensor-reservatorio",
    clean: false,
  });

  let iniciado = false;

  client.on("connect", () => {
    console.log("[AGUA] Sensor de Reservatorio conectado (QoS 1)");
    if (iniciado) return;
    iniciado = true;

    setInterval(async () => {
      if (!client.connected) return;
      const nivel = Math.round(10 + Math.random() * 90);
      const payload = JSON.stringify({
        sensor: "reservatorio",
        valor: nivel,
        unidade: "%",
        timestamp: new Date().toISOString(),
      });

      client.publish(TOPICO, payload, { qos: QOS }, async (err) => {
        if (err) return console.error("[AGUA] Erro ao publicar:", err.message);
        console.log(`[AGUA] Publicado (QoS 1): nivel=${nivel}%`);
        try {
          await Publicacao.create({ sensor: "reservatorio", topico: TOPICO, payload, qos: QOS });
        } catch (e) { console.error("[AGUA] Erro BD:", e.message); }
      });
    }, INTERVALO_MS);
  });

  client.on("reconnect", () => console.log("[AGUA] Reconectando... (QoS 1: broker reenviara mensagens pendentes)"));
  client.on("offline",   () => console.warn("[AGUA] Sensor offline."));
  client.on("error",     (err) => console.error("[AGUA] Erro MQTT:", err.message));
  return client;
}

module.exports = { iniciarSensorReservatorio };