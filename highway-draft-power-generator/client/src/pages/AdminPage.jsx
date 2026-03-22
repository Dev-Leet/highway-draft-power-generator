import { useState, useRef } from "react";
import {
  Activity, Clock, Zap, Download, Upload,
  LogOut, Brain, RefreshCw, BarChart2,
  Table, MessageSquare, Pause, Play,
} from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import SensorChart from "../components/charts/SensorChart.jsx";
import AdminNotes from "../components/AdminNotes.jsx";
import DataTable from "../components/DataTable.jsx";
import FeedbackViewer from "../components/FeedbackViewer.jsx";
import useDataStream from "../hooks/useDataStream.js";
import api from "../services/api.js";
import { parseCSV, toCSVString, toReportString, downloadFile } from "../services/csvUtils.js";

function fmtTime(d) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function StatusPill({ status }) {
  const map = {
    connected:  { color: "#22c55e", glow: "0 0 8px #22c55e",    label: "CONNECTED"  },
    offline:    { color: "#ef4444", glow: "none",                label: "OFFLINE"    },
    connecting: { color: "#facc15", glow: "0 0 8px #facc1580",   label: "CONNECTING" },
    paused:     { color: "#f97316", glow: "none",                label: "PAUSED"     },
  };
  const { color, glow, label } = map[status] || map.offline;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width:9, height:9, borderRadius:"50%", background:color, boxShadow:glow, display:"inline-block" }} />
      <span style={{ color, fontWeight:700, fontSize:15 }}>{label}</span>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:7,
      padding:"9px 18px",
      background: active ? "rgba(6,182,212,0.12)" : "transparent",
      border:"none",
      borderBottom: active ? "2px solid #06b6d4" : "2px solid transparent",
      color: active ? "#06b6d4" : "#475569",
      cursor:"pointer", fontSize:13, fontWeight: active ? 600 : 400,
      transition:"all 0.15s",
    }}>{icon} {label}</button>
  );
}

export default function AdminPage({ onLogout }) {
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
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:`You are analyzing sensor data from a Highway Draft Power Generator system.\nLatest voltage readings (Watts):\n\n${snapshot}\n\nProvide a concise 3-4 sentence technical summary: average energy output, trends (peak/dip times), anomalies, and one actionable insight. Be direct and professional.` }]
        }),
      });
      const json = await res.json();
      setAiSummary(json.content?.map(c => c.text||"").join("") || "No summary available.");
    } catch { setAiSummary("AI summarization failed. Please try again."); }
    setLoadingAI(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImportStatus("Parsing...");
    const text = await file.text();
    try {
      const records = parseCSV(text);
      await api.post("/data/bulk", { records });
      setImportStatus(`✓ Imported ${records.length} records`);
      refresh();
    } catch(err) { setImportStatus(`✗ ${err.message}`); }
    e.target.value = "";
  };

  const energy = lastPacket?.voltage_watt ?? stats.avg ?? 0;

  return (
    <div style={{ minHeight:"100vh", background:"#060b16" }}>
      <Topbar rightSlot={
        <button onClick={onLogout} style={{ background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.3)", color:"#ef4444", padding:"6px 14px", borderRadius:7, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13 }}>
          <LogOut size={14}/> Logout
        </button>
      }/>

      <div style={{ maxWidth:1120, margin:"0 auto", padding:"20px 16px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:12 }}>
          <div>
            <h2 style={{ color:"#e2e8f0", fontWeight:700, fontSize:20 }}>Project Dashboard</h2>
            <p style={{ color:"#475569", fontSize:12 }}>Administrator Control Panel</p>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button onClick={status==="paused"?resume:pause} style={{ background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.3)", color:"#f97316", padding:"8px 14px", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:13 }}>
              {status==="paused" ? <><Play size={13}/> Resume</> : <><Pause size={13}/> Pause</>}
            </button>
            <button onClick={handleAI} disabled={loadingAI} style={{ background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.3)", color:"#06b6d4", padding:"8px 16px", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", gap:7, fontSize:13, fontWeight:500 }}>
              <Brain size={15}/> {loadingAI?"Analyzing...":"AI Summarization"}
            </button>
          </div>
        </div>

        {aiSummary && (
          <div style={{ background:"rgba(6,182,212,0.06)", border:"1px solid rgba(6,182,212,0.2)", borderRadius:10, padding:"14px 18px", marginBottom:18, color:"#94a3b8", fontSize:13, lineHeight:1.75 }}>
            <span style={{ color:"#06b6d4", fontWeight:600 }}>AI Analysis: </span>{aiSummary}
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display:"flex", gap:14, marginBottom:18, flexWrap:"wrap" }}>
          <div className="stat-card" style={{ flex:"1 1 160px" }}>
            <p style={{ color:"#475569", fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Hardware Status</p>
            <StatusPill status={status}/>
            <p style={{ color:"#334155", fontSize:11, marginTop:5 }}>Target: RP2040 / ESP8266</p>
          </div>
          <div className="stat-card" style={{ flex:"1 1 180px" }}>
            <p style={{ color:"#475569", fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Last Data Packet</p>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Clock size={15} color="#06b6d4"/>
              <span style={{ color:"#e2e8f0", fontWeight:700, fontSize:15 }}>{lastPacket ? fmtTime(lastPacket.timestamp) : "—"}</span>
            </div>
            <p style={{ color:"#334155", fontSize:11, marginTop:5 }}>Sync Interval: 10s</p>
          </div>
          <div className="stat-card" style={{ flex:"1 1 160px" }}>
            <p style={{ color:"#475569", fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Energy Generation</p>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Zap size={15} color="#facc15"/>
              <span style={{ color:"#e2e8f0", fontWeight:700, fontSize:22 }}>{energy.toFixed(2)}</span>
              <span style={{ color:"#475569", fontSize:12 }}>W</span>
            </div>
            <p style={{ color:"#334155", fontSize:11, marginTop:5 }}>Real-time Reading</p>
          </div>
          <div className="stat-card" style={{ flex:"1 1 140px" }}>
            <p style={{ color:"#475569", fontSize:11, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Session Avg</p>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <Activity size={15} color="#a78bfa"/>
              <span style={{ color:"#e2e8f0", fontWeight:700, fontSize:22 }}>{stats.avg?.toFixed(1)??"—"}</span>
              <span style={{ color:"#475569", fontSize:12 }}>W</span>
            </div>
            <p style={{ color:"#334155", fontSize:11, marginTop:5 }}>{stats.count??0} readings</p>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
          {/* Tabbed panel */}
          <div className="glass-card" style={{ flex:"1 1 500px", padding:0, overflow:"hidden" }}>
            <div style={{ display:"flex", borderBottom:"1px solid rgba(6,182,212,0.1)", background:"rgba(0,0,0,0.2)" }}>
              <TabBtn active={tab==="chart"}    onClick={()=>setTab("chart")}    icon={<BarChart2 size={14}/>}    label="Real-time Monitor"/>
              <TabBtn active={tab==="table"}    onClick={()=>setTab("table")}    icon={<Table size={14}/>}        label="Data Table"/>
              <TabBtn active={tab==="feedback"} onClick={()=>setTab("feedback")} icon={<MessageSquare size={14}/>} label="Feedback"/>
            </div>

            <div style={{ padding:18 }}>
              {/* CHART TAB */}
              {tab==="chart" && <>
                <div style={{ display:"flex", justifyContent:"flex-end", gap:6, marginBottom:12 }}>
                  {["line","spline","bar"].map(t=>(
                    <button key={t} className={`chart-toggle-btn${chartType===t?" active":""}`} onClick={()=>setChartType(t)}>
                      {t.charAt(0).toUpperCase()+t.slice(1)}
                    </button>
                  ))}
                  <button onClick={refresh} style={{ background:"none", border:"1px solid rgba(6,182,212,0.2)", borderRadius:6, padding:"4px 8px", color:"#475569", cursor:"pointer" }} title="Refresh">
                    <RefreshCw size={13}/>
                  </button>
                </div>

                <SensorChart data={chartData} chartType={chartType}/>

                <div style={{ display:"flex", gap:12, marginTop:18, flexWrap:"wrap" }}>
                  <div style={{ flex:"1 1 180px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(6,182,212,0.1)", borderRadius:8, padding:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                      <Upload size={13} color="#94a3b8"/>
                      <span style={{ color:"#94a3b8", fontSize:12, fontWeight:500 }}>Import Data</span>
                    </div>
                    <input type="file" accept=".csv" ref={fileRef} style={{ display:"none" }} onChange={handleImport}/>
                    <button onClick={()=>fileRef.current?.click()} style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(6,182,212,0.2)", borderRadius:6, padding:"7px 10px", color:"#94a3b8", cursor:"pointer", fontSize:12 }}>
                      Select CSV File
                    </button>
                    {importStatus && <p style={{ color:importStatus.startsWith("✓")?"#4ade80":"#f87171", fontSize:11, marginTop:6 }}>{importStatus}</p>}
                  </div>
                  <div style={{ flex:"1 1 180px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(6,182,212,0.1)", borderRadius:8, padding:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                      <Download size={13} color="#94a3b8"/>
                      <span style={{ color:"#94a3b8", fontSize:12, fontWeight:500 }}>Export Data</span>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>downloadFile(toCSVString(rawRecords),"hdpg_data.csv","text/csv")} style={{ flex:1, background:"rgba(6,182,212,0.12)", border:"1px solid rgba(6,182,212,0.3)", borderRadius:6, padding:"7px 6px", color:"#06b6d4", cursor:"pointer", fontSize:12, fontWeight:500 }}>CSV</button>
                      <button onClick={()=>downloadFile(toReportString(rawRecords,stats),"hdpg_report.txt")} style={{ flex:1, background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:6, padding:"7px 6px", color:"#22c55e", cursor:"pointer", fontSize:12, fontWeight:500 }}>Report</button>
                    </div>
                  </div>
                </div>
              </>}

              {/* TABLE TAB */}
              {tab==="table" && <DataTable records={rawRecords}/>}

              {/* FEEDBACK TAB */}
              {tab==="feedback" && <FeedbackViewer/>}
            </div>
          </div>

          {/* Admin Notes */}
          <div style={{ flex:"1 1 260px", minWidth:240 }}>
            <AdminNotes/>
          </div>
        </div>
      </div>
    </div>
  );
}
