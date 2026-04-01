import { useState, useEffect } from "react";
import { Thermometer, Droplets, Flame, SendHorizontal } from "lucide-react";
import { getPublicacoes } from "../api";

const ICONS = {
  temperatura:  { Icon: Thermometer, color: "#fb923c" },
  reservatorio: { Icon: Droplets,    color: "#38bdf8" },
  incendio:     { Icon: Flame,       color: "#f87171" },
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

export default function Publicacoes() {
  const [rows, setRows]   = useState([]);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const data = await getPublicacoes({ limit: 50 });
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
        <h2 className="page-title" style={{ margin: 0 }}>Publicacoes Enviadas</h2>
        <span className="badge badge-pub">{rows.length} registros</span>
      </div>

      <div className="feed">
        {rows.length === 0 && <p className="loading">Aguardando publicacoes dos sensores...</p>}
        {rows.map((r) => {
          const meta = ICONS[r.sensor] || { Icon: SendHorizontal, color: "var(--muted)" };
          return (
            <div key={r.id} className="feed-row feed-row-pub">
              <span className="feed-sensor">
                <meta.Icon size={14} color={meta.color} />
                {r.sensor}
              </span>
              <span className="feed-val mono">{parseVal(r.payload)}</span>
              <span className="feed-topic mono">{r.topico}</span>
              <span className={`badge badge-qos-${r.qos}`}>QoS {r.qos}</span>
              <span className="badge badge-pub"><SendHorizontal size={10} /> pub</span>
              <span className="feed-time">{fmt(r.createdAt)}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}