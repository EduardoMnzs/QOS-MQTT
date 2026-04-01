# Estufa IoT — Monitoramento com MQTT QoS

Projeto acadêmico de Sistemas Embarcados e IoT (Unimar) que demonstra na prática os três níveis de **QoS do protocolo MQTT**, através de uma estufa agrícola simulada.

---

## Visão Geral

Três sensores simulados publicam dados em tópicos MQTT distintos, cada um usando um nível de QoS diferente. Um backend Node.js assina todos os tópicos, persiste as mensagens no banco de dados e expõe uma API REST. O frontend React exibe em tempo real as leituras, publicações e um relatório comparativo de qualidade de entrega.

```
Sensores (npm run sensors)
    │
    ├── temperatura  →  estufa/temp/ambiente     (QoS 0)
    ├── reservatorio →  estufa/agua/nivel        (QoS 1)
    └── incendio     →  estufa/alerta/incendio   (QoS 2)
         │
         ▼
    Mosquitto Broker (Docker :1883)
         │
         ▼
    Backend API (npm start :3000)
    ├── Subscriber MQTT → salva Leituras no PostgreSQL
    ├── GET  /api/relatorio
    ├── GET  /api/leituras
    ├── GET  /api/publicacoes
    └── POST /api/sensores/incendio/disparar
         │
         ▼
    Frontend React (npm run dev :5173)
```

---

## Níveis de QoS Demonstrados

| Sensor | Tópico | QoS | Garantia |
|---|---|---|---|
| Temperatura | `estufa/temp/ambiente` | **0** | At most once — sem confirmação, pode perder mensagens |
| Reservatório | `estufa/agua/nivel` | **1** | At least once — entrega garantida, possível duplicata |
| Incêndio | `estufa/alerta/incendio` | **2** | Exactly once — handshake quádruplo, sem perda nem duplicata |

---

## Tecnologias

**Backend**
- Node.js + Express 4
- Sequelize 6 + PostgreSQL 15
- mqtt.js v5
- Mosquitto 2 (via Docker)

**Frontend**
- React 19 + Vite 6
- lucide-react (ícones)
- CSS puro (sem biblioteca UI)

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Instalação e Execução

### 1. Subir a infraestrutura Docker

```bash
cd backend
docker-compose up -d
```

Isso inicia:
- `estufa-mosquitto` — broker MQTT na porta **1883**
- `estufa-postgres` — banco PostgreSQL na porta **5432**

### 2. Instalar dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Variáveis de ambiente

Crie o arquivo `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=estufa
DB_USER=postgres
DB_PASS=postgres
MQTT_BROKER=mqtt://localhost:1883
PORT=3000
```

### 4. Iniciar o backend (API + subscriber MQTT)

```bash
cd backend
npm start
```

O servidor inicia na porta **3000**, conecta ao banco, sincroniza os modelos e assina todos os tópicos MQTT.

### 5. Iniciar os sensores simulados

Em um **terminal separado**:

```bash
cd backend
npm run sensors
```

Isso inicia os três simuladores:
- **Temperatura**: publica a cada 5 segundos (QoS 0)
- **Reservatório**: publica a cada 30 segundos (QoS 1)
- **Incêndio**: dispara aleatoriamente a cada 1–2 minutos (QoS 2)

### 6. Iniciar o frontend

```bash
cd frontend
npm run dev
```

Acesse **http://localhost:5173**

---

## Estrutura do Projeto

```
desafio-qos/
├── backend/
│   ├── docker-compose.yml        # Mosquitto + PostgreSQL
│   ├── mosquitto/mosquitto.conf  # Configuração do broker
│   ├── package.json
│   └── src/
│       ├── app.js                # Entry point da API
│       ├── config/
│       │   ├── database.js       # Conexão Sequelize
│       │   └── mqtt.js           # URL do broker
│       ├── models/
│       │   ├── Leitura.js        # Mensagens recebidas (subscriber)
│       │   └── Publicacao.js     # Mensagens enviadas (sensores)
│       ├── services/
│       │   └── mqttService.js    # Subscriber + detecção de duplicatas
│       ├── sensors/
│       │   ├── temperatura.js    # Sensor QoS 0
│       │   ├── reservatorio.js   # Sensor QoS 1
│       │   ├── incendio.js       # Sensor QoS 2
│       │   └── index.js          # Entry point dos sensores
│       ├── controllers/
│       │   ├── leituraController.js
│       │   ├── publicacaoController.js
│       │   ├── relatorioController.js
│       │   └── sensorController.js
│       └── routes/
│           ├── leituras.js
│           ├── publicacoes.js
│           ├── relatorio.js
│           └── sensores.js
└── frontend/
    ├── index.html
    ├── vite.config.js            # Proxy /api → localhost:3000
    └── src/
        ├── App.jsx               # Navegação por abas
        ├── api/index.js          # Funções fetch para a API
        └── components/
            ├── Relatorio.jsx     # Relatório QoS com progresso
            ├── Leituras.jsx      # Feed de mensagens recebidas
            ├── Publicacoes.jsx   # Feed de mensagens enviadas
            └── Sensores.jsx      # Cards + botão de alerta manual
```

---

## API Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/relatorio` | Relatório com enviadas, recebidas, duplicatas e perdidas por sensor |
| `GET` | `/api/leituras` | Lista de mensagens recebidas (`?sensor=&limit=&offset=`) |
| `GET` | `/api/publicacoes` | Lista de mensagens publicadas pelos sensores |
| `POST` | `/api/sensores/incendio/disparar` | Dispara um alerta de incêndio via QoS 2 manualmente |

---

## Relatório de Qualidade

O endpoint `/api/relatorio` calcula para cada sensor:

```
perdidas = max(0, enviadas − (recebidas − duplicatas))
pct_entrega = (recebidas − duplicatas) / enviadas × 100
```

- **QoS 0** tende a ter perdas em redes simuladas
- **QoS 1** pode apresentar duplicatas nos reenvios
- **QoS 2** deve manter `perdidas = 0` e `duplicatas = 0`
