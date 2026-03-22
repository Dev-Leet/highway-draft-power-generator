# 🛣️ Highway Draft Power Generator

> MERN Stack full-stack web application for real-time monitoring of highway wind-draft energy sensors (RP2040 / ESP8266).

---

## 🗂️ Project Structure

```
highway-draft-power-generator/
├── sensor_data.csv                 ← Pre-generated CSV (Sat 21 Mar + Sun 22 Mar 2025)
├── package.json                    ← Root convenience scripts
├── .gitignore
│
├── server/                         ← Node.js + Express + MongoDB backend
│   ├── server.js                   ← Entry point (Express + Socket.io)
│   ├── .env                        ← Environment variables
│   ├── .env.example
│   ├── package.json
│   ├── config/
│   │   └── db.js                   ← Mongoose connection
│   ├── models/
│   │   ├── SensorData.js           ← voltage + timestamp schema
│   │   └── Other.js                ← AdminNote + Feedback schemas
│   ├── middleware/
│   │   └── auth.js                 ← JWT protect middleware
│   ├── routes/
│   │   ├── auth.js                 ← POST /api/auth/login
│   │   ├── data.js                 ← GET/POST /api/data
│   │   └── admin.js                ← Notes + Feedback endpoints
│   └── socket/
│       └── dataStream.js           ← Simulated RP2040/ESP8266 WebSocket stream
│
└── client/                         ← React 18 + Vite + Tailwind CSS frontend
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx                  ← Router: home | admin | user
        ├── index.css
        ├── pages/
        │   ├── HomePage.jsx         ← Login + User access (Fig 13)
        │   ├── AdminPage.jsx        ← Dashboard (Fig 15)
        │   └── UserPage.jsx         ← Feedback form (Fig 14)
        ├── components/
        │   ├── Topbar.jsx
        │   ├── StatCard.jsx
        │   ├── AdminNotes.jsx
        │   └── charts/
        │       └── SensorChart.jsx  ← Custom SVG Spline/Line/Bar chart
        └── services/
            ├── api.js               ← Axios instance with JWT interceptor
            ├── socket.js            ← Socket.io client
            └── csvUtils.js          ← CSV parse / export / report helpers
```

---

## ⚡ Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on port 27017
- **Git Bash** (Windows) or any terminal

---

## 🚀 Setup — Git Bash Commands

### 1. Clone & Initialize

```bash
# Clone the repository
git clone https://github.com/your-username/highway-draft-power-generator.git
cd highway-draft-power-generator

# OR initialize fresh from this folder
git init
git add .
git commit -m "feat: initial MERN project — Highway Draft Power Generator"
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Copy env file (already included, verify values)
cp .env.example .env

# Start development server (with auto-reload)
npm run dev

# OR start production server
npm start
```

> Server runs on: http://localhost:5000

### 3. Frontend Setup (new terminal tab)

```bash
cd client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

> Client runs on: http://localhost:5173

### 4. Import CSV Data into MongoDB

1. Open the browser at http://localhost:5173
2. Login as **admin / 0000**
3. In the Admin Dashboard → **Import Data** → Select `sensor_data.csv`
4. The 288 records (Sat 21 Mar + Sun 22 Mar) will be inserted into MongoDB

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Admin login → returns JWT |
| GET | `/api/data` | ✅ | Fetch sensor records |
| POST | `/api/data/bulk` | ✅ | Bulk insert CSV records |
| GET | `/api/data/stats` | ✅ | Avg / Max / Min / Total Wh |
| GET | `/api/admin/notes` | ✅ | Get admin observations |
| POST | `/api/admin/notes` | ✅ | Add admin observation |
| DELETE | `/api/admin/notes/:id` | ✅ | Delete note |
| POST | `/api/admin/feedback` | ❌ | Submit user feedback |
| GET | `/api/admin/feedback` | ✅ | Get all feedback |

---

## 🌐 WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `sensor_data` | Server → Client | `{ timestamp, voltage_watt, source }` |

The server emits a new simulated reading every **10 seconds**, mimicking the RP2040/ESP8266 hardware stream.

---

## 📊 CSV Format

```
timestamp,voltage_watt
2025-03-21 00:00:00,103.35
2025-03-21 00:10:00,108.72
...
2025-03-22 23:50:00,107.02
```

- **Time range**: Saturday 21 March 2025 → Sunday 22 March 2025
- **Interval**: Every 10 minutes (144 records/day × 2 days = 288 total)
- **Voltage**: Average ~150 W, range ±50 W (traffic-pattern based)

---

## 🔐 Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `0000` |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io (WebSocket) |
| Auth | JWT (jsonwebtoken) |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| HTTP Client | Axios |
| Charts | Custom SVG (Spline / Line / Bar) |
| AI Summary | Anthropic Claude API |
