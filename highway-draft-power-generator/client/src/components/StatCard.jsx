export default function StatCard({ icon, label, value, sub, accent = "#06b6d4" }) {
  return (
    <div className="stat-card" style={{ minWidth: 140, flex: "1 1 140px" }}>
      <p style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: accent }}>{icon}</span>
        <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 22 }}>{value}</span>
        {sub && <span style={{ color: "#475569", fontSize: 12 }}>{sub}</span>}
      </div>
    </div>
  );
}
