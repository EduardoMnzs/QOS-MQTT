import { useState } from "react";
import { BarChart3, ArrowDownToLine, SendHorizontal, Cpu, Sprout } from "lucide-react";
import "./App.css";
import Relatorio from "./components/Relatorio";
import Leituras from "./components/Leituras";
import Publicacoes from "./components/Publicacoes";
import Sensores from "./components/Sensores";

const TABS = [
  { id: "relatorio",   label: "Relatorio QoS",  Icon: BarChart3 },
  { id: "leituras",    label: "Leituras",        Icon: ArrowDownToLine },
  { id: "publicacoes", label: "Publicacoes",     Icon: SendHorizontal },
  { id: "sensores",    label: "Sensores",        Icon: Cpu },
];

const PAGES = { relatorio: Relatorio, leituras: Leituras, publicacoes: Publicacoes, sensores: Sensores };

export default function App() {
  const [active, setActive] = useState("relatorio");
  const Page = PAGES[active];

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <Sprout size={20} /> Estufa IoT
        </div>
        <nav className="tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`tab-btn${active === id ? " active" : ""}`}
              onClick={() => setActive(id)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="page">
        <Page />
      </main>
    </div>
  );
}