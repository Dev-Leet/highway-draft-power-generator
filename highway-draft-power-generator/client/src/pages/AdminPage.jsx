import { useState, useRef } from "react";
import {
  Activity, Clock, Zap, Download, Upload,
  LogOut, Brain, RefreshCw, BarChart2,
  Table2, MessageSquare, Pause, Play,
} from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import SensorChart from "../components/charts/SensorChart.jsx";
import AdminNotes from "../components/AdminNotes.jsx";
import DataTable from "../components/DataTable.jsx";
import FeedbackViewer from "../components/FeedbackViewer.jsx";
import useDataStream from "../hooks/useDataStream.js";
import { useTheme } from "../context/ThemeContext.jsx";
import api from "../services/api.js";
import { parseCSV, toCSVString, toReportString, downloadFile } from "../services/csvUtils.js";

function fmtTime(d) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

function StatusPill({ status }) {
  const { tokens } = useTheme();
  const map = {
    connected:  { color: tokens.success,  glow: tokens.statusGreenGlow, label: "CONNECTED"  },
    offline:    { color: tokens.danger,   glow: "none",                  label: "OFFLINE"    },
    connecting: { color: tokens.warning,  glow: `0 0 8px ${tokens.warning}60`, label: "CONNECTING" },
    paused:     { color: "#f97316",       glow: "none",                  label: "PAUSED"     },
  };
  const { color, glow, label } = map[status] || map.offline;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, boxShadow: glow, display: "inline-block", transition: "background 0.3s" }} />
      <span style={{ color, fontWeight: 700, fontSize: 15, transition: "color 0.3s" }}>{label}</span>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  const { tokens } = useTheme();
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "9px 18px",
        background: active ? tokens.accentBg : "transparent",
        border: "none",
        borderBottom: `2px solid ${active ? tokens.accent : "transparent"}`,
        color: active ? tokens.accent : tokens.textFaint,
        cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400,
        transition: "all 0.15s",
      }}
    >
      {icon} {label}
    </button>
  );
}

export default function AdminPage({ onLogout }) {
  const { tokens, mode } = useTheme();
  const { status, chartData, rawRecords, lastPacket, stats, pause, resume, refresh } = useDataStream();
  const [tab, setTab] = useState("chart");
  const [chartType, setChartType] = useState("spline");
  const [aiSummary, setAiSummary] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [importStatus, setImportStatus] = useState("");
  const fileRef = useRef();

  const handleAI = async () => {
    setLoadingAI(true); setAiSummary("");
    try {
      const snapshot = rawRecords.slice(-20)
        .map(r => `${new Date(r.timestamp).toISOString()}: ${r.voltage_watt}W`).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Analyze Highway Draft Power Generator sensor data:\n\n${snapshot}\n\nProvide a concise 3-4 sentence technical summary: avg energy output, trends, anomalies, and one actionable insight.` }],
        }),
      });
      const json = await res.json();
      setAiSummary(json.content?.map(c => c.text || "").join("") || "No summary available.");
    } catch { setAiSummary("AI summarization failed. Please try again."); }
    setLoadingAI(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImportStatus("Parsing...");
    try {
      const records = parseCSV(await file.text());
      await api.post("/data/bulk", { records });
      setImportStatus(`✓ Imported ${records.length} records`);
      refresh();
    } catch (err) { setImportStatus(`✗ ${err.message}`); }
    e.target.value = "";
  };

  const energy = lastPacket?.voltage_watt ?? stats.avg ?? 0;

  const s = (style) => style; // passthrough for readability

  return (
    <div style={{
        minHeight: "100vh",
        background: tokens.bg,
        transition: "background 0.35s",
        position: "relative",
        isolation: "isolate",
        }}>
            <div style={{
                position: "fixed",
                inset: 0,
                zIndex: -1,
                backgroundImage: `url('${mode === "light" ? "/bg-hero.png" : "/bg-dark.jpeg"}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: mode === "light" ? 0.5 : 0.5,
                transition: "opacity 0.5s ease, background-image 0.5s ease",
                pointerEvents: "none",
                }} />
      <Topbar rightSlot={
        <button
          onClick={onLogout}
          style={{
            background: tokens.dangerBg, border: `1px solid ${tokens.dangerBorder}`,
            color: tokens.danger, padding: "6px 14px", borderRadius: 7,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13,
            transition: "all 0.2s",
          }}
        >
          <LogOut size={14} /> Logout
        </button>
      } />

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: tokens.text, fontWeight: 800, fontSize: 20, letterSpacing: -0.5, transition: "color 0.35s" }}>
              Project Dashboard
            </h2>
            <p style={{ color: tokens.textGhost, fontSize: 12, transition: "color 0.35s" }}>Administrator Control Panel</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={status === "paused" ? resume : pause}
              style={{
                background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)",
                color: "#f97316", padding: "8px 14px", borderRadius: 8,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13,
              }}
            >
              {status === "paused" ? <><Play size={13} /> Resume</> : <><Pause size={13} /> Pause</>}
            </button>
            <button
              onClick={handleAI} disabled={loadingAI}
              style={{
                background: tokens.accentBg, border: `1px solid ${tokens.accentBorder}`,
                color: tokens.accent, padding: "8px 16px", borderRadius: 8,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              <Brain size={15} /> {loadingAI ? "Analyzing..." : "AI Summarization"}
            </button>
          </div>
        </div>

        {/* AI Banner */}
        {aiSummary && (
          <div style={{
            background: tokens.accentBg, border: `1px solid ${tokens.accentBorder}`,
            borderRadius: 10, padding: "14px 18px", marginBottom: 18,
            color: tokens.textMuted, fontSize: 13, lineHeight: 1.75, transition: "all 0.35s",
          }}>
            <span style={{ color: tokens.accent, fontWeight: 700 }}>AI Analysis: </span>{aiSummary}
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
          {/* Hardware Status */}
          <div className="stat-card" style={{ flex: "1 1 160px" }}>
            <p style={{ color: tokens.textFaint, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Hardware Status
            </p>
            <StatusPill status={status} />
            <p style={{ color: tokens.textGhost, fontSize: 11, marginTop: 5 }}>Target: RP2040 / ESP8266</p>
          </div>

          {/* Last Packet */}
          <div className="stat-card" style={{ flex: "1 1 180px" }}>
            <p style={{ color: tokens.textFaint, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Last Data Packet
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Clock size={15} color={tokens.accent} />
              <span style={{ color: tokens.text, fontWeight: 700, fontSize: 15, transition: "color 0.35s" }}>
                {lastPacket ? fmtTime(lastPacket.timestamp) : "—"}
              </span>
            </div>
            <p style={{ color: tokens.textGhost, fontSize: 11, marginTop: 5 }}>Sync Interval: 10s</p>
          </div>

          {/* Energy */}
          <div className="stat-card" style={{ flex: "1 1 160px" }}>
            <p style={{ color: tokens.textFaint, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Energy Generation
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Zap size={15} color={tokens.warning} />
              <span style={{ color: tokens.text, fontWeight: 700, fontSize: 22, transition: "color 0.35s" }}>
                {energy.toFixed(2)}
              </span>
              <span style={{ color: tokens.textFaint, fontSize: 12 }}>W</span>
            </div>
            <p style={{ color: tokens.textGhost, fontSize: 11, marginTop: 5 }}>Real-time Reading</p>
          </div>

          {/* Avg */}
          <div className="stat-card" style={{ flex: "1 1 140px" }}>
            <p style={{ color: tokens.textFaint, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Session Avg
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Activity size={15} color={tokens.purple} />
              <span style={{ color: tokens.text, fontWeight: 700, fontSize: 22, transition: "color 0.35s" }}>
                {stats.avg?.toFixed(1) ?? "—"}
              </span>
              <span style={{ color: tokens.textFaint, fontSize: 12 }}>W</span>
            </div>
            <p style={{ color: tokens.textGhost, fontSize: 11, marginTop: 5 }}>{stats.count ?? 0} readings</p>
          </div>
        </div>

        {/* Main panel */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div className="glass-card" style={{ flex: "1 1 500px", padding: 0, overflow: "hidden" }}>
            {/* Tab bar */}
            <div style={{
              display: "flex",
              borderBottom: `1px solid ${tokens.tabBarBorder}`,
              background: tokens.tabBarBg,
              transition: "background 0.35s, border-color 0.35s",
            }}>
              <TabBtn active={tab === "chart"}    onClick={() => setTab("chart")}    icon={<BarChart2 size={14} />}    label="Real-time Monitor" />
              <TabBtn active={tab === "table"}    onClick={() => setTab("table")}    icon={<Table2 size={14} />}       label="Data Table" />
              <TabBtn active={tab === "feedback"} onClick={() => setTab("feedback")} icon={<MessageSquare size={14} />} label="Feedback" />
            </div>

            <div style={{ padding: 18 }}>
              {/* CHART TAB */}
              {tab === "chart" && <>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 12, alignItems: "center" }}>
                  {["line", "spline", "bar"].map(t => (
                    <button key={t} className={`chart-toggle-btn${chartType === t ? " active" : ""}`} onClick={() => setChartType(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                  <button
                    onClick={refresh}
                    title="Refresh"
                    style={{
                      background: tokens.panelBg, border: `1px solid ${tokens.borderSubtle}`,
                      borderRadius: 6, padding: "4px 8px", color: tokens.textFaint, cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>

                <SensorChart data={chartData} chartType={chartType} />

                {/* Import / Export */}
                <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                  {/* Import */}
                  <div style={{
                    flex: "1 1 180px", background: tokens.panelBg,
                    border: `1px solid ${tokens.borderSubtle}`, borderRadius: 8, padding: 12,
                    transition: "all 0.35s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <Upload size={13} color={tokens.textMuted} />
                      <span style={{ color: tokens.textMuted, fontSize: 12, fontWeight: 600 }}>Import Data</span>
                    </div>
                    <input type="file" accept=".csv" ref={fileRef} style={{ display: "none" }} onChange={handleImport} />
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{
                        width: "100%", background: tokens.accentBg,
                        border: `1px solid ${tokens.accentBorder}`, borderRadius: 6,
                        padding: "7px 10px", color: tokens.accent, cursor: "pointer", fontSize: 12, fontWeight: 500,
                        transition: "all 0.2s",
                      }}
                    >
                      Select CSV File
                    </button>
                    {importStatus && (
                      <p style={{ color: importStatus.startsWith("✓") ? tokens.success : tokens.danger, fontSize: 11, marginTop: 6, fontWeight: 500 }}>
                        {importStatus}
                      </p>
                    )}
                  </div>

                  {/* Export */}
                  <div style={{
                    flex: "1 1 180px", background: tokens.panelBg,
                    border: `1px solid ${tokens.borderSubtle}`, borderRadius: 8, padding: 12,
                    transition: "all 0.35s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <Download size={13} color={tokens.textMuted} />
                      <span style={{ color: tokens.textMuted, fontSize: 12, fontWeight: 600 }}>Export Data</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => downloadFile(toCSVString(rawRecords), "hdpg_data.csv", "text/csv")}
                        style={{
                          flex: 1, background: tokens.accentBg, border: `1px solid ${tokens.accentBorder}`,
                          borderRadius: 6, padding: "7px 6px", color: tokens.accent,
                          cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                        }}
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => downloadFile(toReportString(rawRecords, stats), "hdpg_report.txt")}
                        style={{
                          flex: 1, background: tokens.successBg, border: `1px solid ${tokens.successBorder}`,
                          borderRadius: 6, padding: "7px 6px", color: tokens.success,
                          cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                        }}
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </>}

              {tab === "table"    && <DataTable records={rawRecords} />}
              {tab === "feedback" && <FeedbackViewer />}
            </div>
          </div>

          {/* Admin Notes */}
          <div style={{ flex: "1 1 260px", minWidth: 240 }}>
            <AdminNotes />
          </div>
        </div>
      </div>
    </div>
  );
}