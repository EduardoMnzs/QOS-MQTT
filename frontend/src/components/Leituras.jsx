import { useState, useEffect } from "react";
import { Thermometer, Droplets, Flame, CheckCircle2, Copy } from "lucide-react";
import { getLeituras } from "../api";

const ICONS = {
  temperatura:  { Icon: Thermometer, color: "var(--muted)" },
  reservatorio: { Icon: Droplets,    color: "var(--muted)" },
  incendio:     { Icon: Flame,       color: "var(--red)" },
};

function fmt(ts) {
  return new Date(ts).toLocaleTimeString("pt-BR");
}

function parseVal(payload) {
  try {
    const obj = JSON.parse(payload);
    if (obj.alerta !== undefined) return `ALERTA: ${obj.alerta}`;
    if (obj.valor !== undefined)  return `${obj.valor} ${obj.unidade || ""}`.trim();
  } catch {}
  return payload;
}

export default function Leituras() {
  const [rows, setRows]   = useState([]);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const data = await getLeituras({ limit: 50 });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  if (error) return <p className="error-msg">Erro: {error}</p>;

  return (
    <>
      <div className="feed-header">
        <h2 className="page-title" style={{ margin: 0 }}>Leituras Recebidas</h2>
        <span className="badge badge-ok">{rows.length} registros</span>
      </div>

      <div className="feed">
        {rows.length === 0 && <p className="loading">Aguardando mensagens MQTT...</p>}
        {rows.map((r) => {
          const meta = ICONS[r.sensor] || { Icon: Thermometer, color: "var(--muted)" };
          return (
            <div key={r.id} className={`feed-row${r.duplicada ? " feed-row-dup" : ""}`}>
              <span className="feed-sensor">
                <meta.Icon size={14} color={meta.color} />
                {r.sensor}
              </span>
              <span className="feed-val mono">{parseVal(r.payload)}</span>
              <span className="feed-topic mono">{r.topico}</span>
              <span className={`badge badge-qos-${r.qos}`}>QoS {r.qos}</span>
              {r.duplicada
                ? <span className="badge badge-dup"><Copy size={10} /> dup</span>
                : <span className="badge badge-ok"><CheckCircle2 size={10} /> ok</span>}
              <span className="feed-time">{fmt(r.createdAt)}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}