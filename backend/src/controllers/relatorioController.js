const { Leitura, Publicacao } = require("../models");

const SENSORES = [
  { nome: "temperatura", topico: "estufa/temp/ambiente",    qos: 0 },
  { nome: "reservatorio", topico: "estufa/agua/nivel",       qos: 1 },
  { nome: "incendio",     topico: "estufa/alerta/incendio",  qos: 2 },
];

const JUSTIFICATIVAS = {
  0: "QoS 0 (at most once): sem confirmacao, perdas sao esperadas em redes instáveis.",
  1: "QoS 1 (at least once): entrega garantida, possível duplicação em reenvios.",
  2: "QoS 2 (exactly once): handshake de 4 vias garante entrega única sem duplicatas.",
};

async function obterRelatorio(_req, res) {
  try {
    const tabela = await Promise.all(
      SENSORES.map(async ({ nome, topico, qos }) => {
        const enviadas = await Publicacao.count({ where: { sensor: nome } });
        const recebidas = await Leitura.count({ where: { sensor: nome } });
        const duplicadas = await Leitura.count({ where: { sensor: nome, duplicada: true } });
        const perdidas = Math.max(0, enviadas - (recebidas - duplicadas));
        const pct = enviadas > 0
          ? ((recebidas - duplicadas) / enviadas) * 100
          : 0;

        return {
          sensor: nome,
          topico,
          qos,
          enviadas,
          recebidas,
          duplicadas,
          perdidas,
          pct: parseFloat(pct.toFixed(1)),
          justificativa: JUSTIFICATIVAS[qos],
        };
      })
    );

    res.json({ tabela });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { obterRelatorio };