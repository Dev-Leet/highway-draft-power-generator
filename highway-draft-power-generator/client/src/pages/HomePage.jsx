import { useState } from "react";
import { Lock, User, Activity, ChevronRight } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import api from "../services/api.js";

export default function HomePage({ onAdminLogin, onEnterUser }) {
  const { tokens, mode } = useTheme();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLight = mode === "light";
  const heroBg = isLight ? "/bg-hero.png" : "/bg-dark.jpeg";

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
    <div style={{ minHeight: "100vh", background: tokens.bg, display: "flex", flexDirection: "column", transition: "background 0.35s" }}>
      <Topbar />

      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 53px)" }}>

        {/* ── LEFT PANEL ─────────────────────────────────────────── */}
        <div style={{
          width: "clamp(340px, 45%, 520px)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 40px 48px 48px",
          background: isLight ? "rgba(248,250,252,0.97)" : "rgba(6,11,22,0.98)",
          borderRight: `1px solid ${tokens.border}`,
          zIndex: 1,
        }}>
          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: tokens.accentBg,
              border: `1px solid ${tokens.accentBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Activity size={20} color={tokens.accent} />
            </div>
            <div>
              <p style={{ color: tokens.accent, fontWeight: 800, fontSize: 14, letterSpacing: -0.2 }}>HDPG</p>
              <p style={{ color: tokens.textGhost, fontSize: 11 }}>Monitoring System</p>
            </div>
          </div>

          <h1 style={{
            fontSize: "clamp(20px, 2.4vw, 28px)",
            fontWeight: 800,
            color: tokens.text,
            letterSpacing: -0.7,
            lineHeight: 1.2,
            marginBottom: 8,
            transition: "color 0.35s",
          }}>
            Highway Draft<br />Power Generator
          </h1>
          <p style={{
            color: tokens.textFaint,
            fontSize: 13,
            lineHeight: 1.65,
            marginBottom: 36,
            maxWidth: 320,
            transition: "color 0.35s",
          }}>
            Real-time energy visualization &amp; monitoring.
          </p>

          {/* ── Admin Card ─────────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: "24px 24px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: tokens.accentBg, border: `1px solid ${tokens.accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Lock size={15} color={tokens.accent} />
              </div>
              <h2 style={{ color: tokens.text, fontWeight: 700, fontSize: 15, transition: "color 0.35s" }}>Admin Access</h2>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ color: tokens.textMuted, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 500 }}>Username</label>
              <input
                className="input-field"
                style={{ fontSize: 13, padding: "9px 13px" }}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ color: tokens.textMuted, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 500 }}>Password</label>
              <input
                className="input-field"
                style={{ fontSize: 13, padding: "9px 13px" }}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && <p style={{ color: tokens.danger, fontSize: 12, marginBottom: 12, fontWeight: 500 }}>{error}</p>}

            <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ fontSize: 13, padding: "10px 16px" }}>
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </div>

          {/* ── User Card ──────────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: tokens.successBg, border: `1px solid ${tokens.successBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User size={15} color={tokens.success} />
              </div>
              <h2 style={{ color: tokens.text, fontWeight: 700, fontSize: 15, transition: "color 0.35s" }}>User Access</h2>
            </div>
            <p style={{ color: tokens.textFaint, fontSize: 12, lineHeight: 1.6, marginBottom: 14, transition: "color 0.35s" }}>
              Provide feedback to the development team. No authentication required.
            </p>
            <button className="btn-green" onClick={onEnterUser} style={{ fontSize: 13, padding: "9px 16px" }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                Enter as User <ChevronRight size={15} />
              </span>
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 400 }}>
          <img
            key={heroBg}
            src={heroBg}
            alt="Highway Draft Power Generator"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
              transition: "opacity 0.6s ease",
            }}
          />

          {/* Left-edge blend into panel */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: isLight
              ? "linear-gradient(to right, rgba(248,250,252,0.22) 0%, transparent 28%)"
              : "linear-gradient(to right, rgba(6,11,22,0.6) 0%, transparent 32%)",
            transition: "background 0.5s ease",
            pointerEvents: "none",
          }} />

          {/* Caption badge */}
          <div style={{
            position: "absolute",
            bottom: 24,
            right: 28,
            background: isLight ? "rgba(255,255,255,0.82)" : "rgba(6,11,22,0.72)",
            backdropFilter: "blur(14px)",
            border: `1px solid ${tokens.border}`,
            borderRadius: 10,
            padding: "10px 16px",
            transition: "all 0.35s",
          }}>
            <p style={{ color: tokens.text, fontSize: 12, fontWeight: 700, letterSpacing: -0.2 }}>
              Wind &amp; Solar Integration
            </p>
            <p style={{ color: tokens.textFaint, fontSize: 11, marginTop: 2 }}>
              Real-time Monitoring
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}