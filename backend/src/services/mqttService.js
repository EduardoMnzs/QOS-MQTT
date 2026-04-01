require("dotenv").config();
const mqtt = require("mqtt");
const { BROKER_URL } = require("../config/mqtt");
const { Leitura } = require("../models");

const TOPICOS = {
  "estufa/temp/ambiente":   { sensor: "temperatura",  qos: 0 },
  "estufa/agua/nivel":      { sensor: "reservatorio", qos: 1 },
  "estufa/alerta/incendio": { sensor: "incendio",     qos: 2 },
};

const cacheRecentes = {};
const JANELA_DUPLICATA_MS = 5 * 60 * 1000;

function verificarDuplicata(topico, payload) {
  const agora = Date.now();
  if (!cacheRecentes[topico]) cacheRecentes[topico] = [];

  // Remove entradas antigas
  cacheRecentes[topico] = cacheRecentes[topico].filter(e => agora - e.ts < JANELA_DUPLICATA_MS);

  const duplicada = cacheRecentes[topico].some(e => e.payload === payload);
  cacheRecentes[topico].push({ payload, ts: agora });
  return duplicada;
}

function iniciarSubscriber() {
  const client = mqtt.connect(BROKER_URL, {
    clientId: "estufa-backend-sub",
    clean: false,
  });

  client.on("connect", () => {
    console.log("[MQTT] Subscriber conectado ao broker:", BROKER_URL);
    Object.entries(TOPICOS).forEach(([topico, { qos }]) => {
      client.subscribe(topico, { qos }, (err) => {
        if (!err) console.log(`[MQTT] Inscrito em "${topico}" (QoS ${qos})`);
      });
    });
  });

  client.on("message", async (topico, msgBuffer, packet) => {
    const meta = TOPICOS[topico];
    if (!meta) return;

    const payload = msgBuffer.toString();
    const duplicada = verificarDuplicata(topico, payload);

    if (duplicada) {
      console.warn(`[MQTT] DUPLICADA detectada em ${topico}`);
    } else {
      console.log(`[MQTT] Recebida em ${topico} (QoS ${meta.qos}):`, payload.substring(0, 80));
    }

    try {
      await Leitura.create({ sensor: meta.sensor, topico, payload, qos: meta.qos, duplicada });
    } catch (err) {
      console.error("[MQTT] Erro ao salvar leitura:", err.message);
    }
  });

  client.on("error", (err) => console.error("[MQTT] Erro:", err.message));
  client.on("offline", () => console.warn("[MQTT] Subscriber offline."));

  return client;
}

module.exports = { iniciarSubscriber };