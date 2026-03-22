import { useState, useEffect } from "react";
import { Activity } from "lucide-react";

export default function Topbar({ rightSlot }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });

  return (
    <header
      style={{
        background: "rgba(6,11,22,0.95)",
        borderBottom: "1px solid rgba(6,182,212,0.18)",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Activity size={20} color="#06b6d4" />
        <span style={{ color: "#06b6d4", fontWeight: 600, fontSize: 15 }}>
          Highway Draft Power Generator
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ color: "#64748b", fontSize: 13 }}>
          {dateStr} &nbsp;
          <span style={{ color: "#94a3b8", fontWeight: 600 }}>{timeStr}</span>
        </span>
        {rightSlot}
      </div>
    </header>
  );
}
