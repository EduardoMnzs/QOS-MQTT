import { useState } from "react";
import { Thermometer, Droplets, Flame, Zap } from "lucide-react";
import { dispararIncendio } from "../api";

const SENSORES = [
  {
    nome: "temperatura",
    Icon: Thermometer,
    color: "#fb923c",
    bg: "#2d1f0d",
    topico: "estufa/temp/ambiente",
    intervalo: "5 segundos",
    qos: 0,
    criticidade: "Baixa",
    nota: "QoS 0 — sem confirmacao. Dados meteorologicos tolerantes a perda ocasional.",
  },
  {
    nome: "reservatorio",
    Icon: Droplets,
    color: "#38bdf8",
    bg: "#0d1f2d",
    topico: "estufa/agua/nivel",
    intervalo: "30 segundos",
    qos: 1,
    criticidade: "Media",
    nota: "QoS 1 — entrega garantida, possivel duplicata. Nivel de agua requer confiabilidade.",
  },
  {
    nome: "incendio",
    Icon: Flame,
    color: "#f87171",
    bg: "#2d1010",
    topico: "estufa/alerta/incendio",
    intervalo: "Evento",
    qos: 2,
    criticidade: "Alta",
    nota: "QoS 2 — exatamente uma vez. Alertas criticos nunca podem ser duplicados ou perdidos.",
  },
];

const QOS_INFO = [
  { qos: 0, titulo: "At most once",   desc: "Mensagem enviada uma vez sem confirmacao. Pode ser perdida se o broker ou receptor estiver indisponivel." },
  { qos: 1, titulo: "At least once",  desc: "Entrega garantida com confirmacao. Pode gerar duplicatas se o ACK for perdido e a mensagem for reenviada." },
  { qos: 2, titulo: "Exactly once",   desc: "Handshake de 4 etapas garante que a mensagem chegue exatamente uma vez. Mais confiavel, maior latencia." },
];

export default function Sensores() {
  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleDisparar() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await dispararIncendio();
      setStatus({ ok: true, msg: res.mensagem });
    } catch (e) {
      setStatus({ ok: false, msg: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="page-title">Sensores</h2>

      <div className="sensor-grid">
        {SENSORES.map(({ nome, Icon, color, bg, topico, intervalo, qos, criticidade, nota }) => (
          <div key={nome} className="sensor-card">
            <div className="sensor-card-header">
              <div className="sensor-icon" style={{ background: bg }}>
                <Icon size={18} color={color} />
              </div>
              <h3>{nome}</h3>
            </div>
            <div className="sensor-rows">
              <div className="sensor-row"><span className="sk">Topico</span><span className="sv mono" style={{ fontSize:"0.75rem" }}>{topico}</span></div>
              <div className="sensor-row"><span className="sk">Intervalo</span><span className="sv">{intervalo}</span></div>
              <div className="sensor-row"><span className="sk">QoS</span><span className={`badge badge-qos-${qos}`}>QoS {qos}</span></div>
              <div className="sensor-row"><span className="sk">Criticidade</span><span className="sv">{criticidade}</span></div>
            </div>
            <p className="sensor-nota">{nota}</p>
          </div>
        ))}
      </div>

      <div className="fire-section">
        <h3>Teste Manual — Alerta de Incendio</h3>
        <p>Dispara um alerta via QoS 2 diretamente pela API (sem aguardar simulacao automatica).</p>
        <button className="btn-fire" onClick={handleDisparar} disabled={loading}>
          <Zap size={15} /> {loading ? "Disparando..." : "Disparar Alerta (QoS 2)"}
        </button>
        {status && (
          <div className={status.ok ? "alert-ok" : "alert-warn"}>{status.msg}</div>
        )}
      </div>

      <div className="qos-section">
        <h3>Niveis de QoS — MQTT</h3>
        <div className="qos-cards">
          {QOS_INFO.map(({ qos, titulo, desc }) => (
            <div key={qos} className="qos-card">
              <span className={`badge badge-qos-${qos}`}>QoS {qos}</span>
              <div>
                <strong>{titulo}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}