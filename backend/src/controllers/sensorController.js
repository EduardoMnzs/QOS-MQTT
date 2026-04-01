const { dispararAlerta } = require("../sensors/incendio");

async function disparar(_req, res) {
  try {
    const sucesso = await dispararAlerta("MANUAL_API");
    if (sucesso) {
      res.json({ mensagem: "Alerta de incendio disparado com sucesso (QoS 2)." });
    } else {
      res.status(503).json({
        erro: "Nao foi possivel disparar o alerta. Verifique conexao MQTT ou aguarde cooldown.",
      });
    }
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { disparar };