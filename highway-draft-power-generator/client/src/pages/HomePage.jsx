import { useState } from "react";
import { Lock, User, Activity, ChevronRight } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import api from "../services/api.js";

export default function HomePage({ onAdminLogin, onEnterUser }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!password) { setError("Password required"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      onAdminLogin(data.token);
    } catch {
      setError("Invalid credentials. Try admin / 0000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060b16" }}>
      <Topbar />

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "64px 24px 48px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Activity size={40} color="#06b6d4" />
        </div>
        <h1
          style={{
            fontSize: "clamp(28px,5vw,48px)",
            fontWeight: 700,
            color: "#06b6d4",
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          Highway Draft Power Generator
        </h1>
        <p style={{ color: "#64748b", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
          Real-time data visualization and monitoring system.
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          gap: 24,
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 24px 80px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Admin Card */}
        <div className="glass-card" style={{ flex: "1 1 320px", padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Lock size={20} color="#06b6d4" />
            <h2 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 17 }}>Admin Access</h2>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>
              Username
            </label>
            <input
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </div>

        {/* User Card */}
        <div className="glass-card" style={{ flex: "1 1 280px", padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <User size={20} color="#22c55e" />
            <h2 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 17 }}>User Access</h2>
          </div>
          <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
            Users can provide feedback to the development team.
            No authentication required.
          </p>
          <button className="btn-green" onClick={onEnterUser}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Enter as User <ChevronRight size={16} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
