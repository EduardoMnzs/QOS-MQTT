import { useState, useEffect } from "react";
import { Thermometer, Droplets, Flame, Signal } from "lucide-react";
import { getRelatorio } from "../api";

function getSensorMeta(nome) {
  if (nome.includes("temp"))   return { Icon: Thermometer, color: "#fb923c", bg: "#2d1f0d" };
  if (nome.includes("reserv") || nome.includes("agua")) return { Icon: Droplets, color: "#38bdf8", bg: "#0d1f2d" };
  if (nome.includes("incend") || nome.includes("fogo")) return { Icon: Flame,       color: "#f87171", bg: "#2d1010" };
  return { Icon: Signal, color: "#a78bfa", bg: "#1d1536" };
}

function QosBadge({ qos }) {
  return <span className={`badge badge-qos-${qos}`}>QoS {qos}</span>;
}

export default function Relatorio() {
  const [data, setData]     = useState(null);
  const [error, setError]   = useState(null);

  async function load() {
    try {
      const json = await getRelatorio();
      setData(json);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  if (error) return <p className="error-msg">Erro: {error}</p>;
  if (!data)  return <p className="loading">Carregando relatorio...</p>;

  const tabela = data.tabela || [];

  const totPub = tabela.reduce((a, r) => a + r.enviadas, 0);
  const totLei = tabela.reduce((a, r) => a + r.recebidas, 0);
  const totDup = tabela.reduce((a, r) => a + r.duplicadas, 0);
  const totPer = tabela.reduce((a, r) => a + r.perdidas, 0);

  return (
    <>
      <h2 className="page-title">Relatorio de Qualidade QoS</h2>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Publicadas</div>
          <div className="value" style={{ color: "var(--accent)" }}>{totPub}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Recebidas</div>
          <div className="value" style={{ color: "var(--green)" }}>{totLei}</div>
        </div>
        <div className="stat-card">
          <div className="label">Duplicatas</div>
          <div className="value" style={{ color: "var(--yellow)" }}>{totDup}</div>
        </div>
        <div className="stat-card">
          <div className="label">Perdidas</div>
          <div className="value" style={{ color: "var(--red)" }}>{totPer}</div>
        </div>
      </div>

      <div className="report-grid">
        {tabela.map((r) => {
          const { Icon, color, bg } = getSensorMeta(r.sensor);
          const w = Math.min(100, r.pct);
          const fillColor = r.pct >= 90 ? "var(--green)" : r.pct >= 70 ? "var(--yellow)" : "var(--red)";
          return (
            <div key={r.sensor} className="report-card">
              <div className="report-card-header">
                <div className="sensor-icon" style={{ background: bg }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <h3>{r.sensor}</h3>
                  <QosBadge qos={r.qos} />
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${w}%`, background: fillColor }} />
              </div>
              <div className="stats-row">
                <div className="mini-stat"><div className="v" style={{ color:"var(--accent)" }}>{r.enviadas}</div><div className="l">Enviadas</div></div>
                <div className="mini-stat"><div className="v" style={{ color:"var(--green)" }}>{r.recebidas}</div><div className="l">Recebidas</div></div>
                <div className="mini-stat"><div className="v" style={{ color:"var(--yellow)" }}>{r.duplicadas}</div><div className="l">Duplicatas</div></div>
                <div className="mini-stat"><div className="v" style={{ color:"var(--red)" }}>{r.perdidas}</div><div className="l">Perdidas</div></div>
              </div>
              <p className="justificativa">{r.justificativa}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}