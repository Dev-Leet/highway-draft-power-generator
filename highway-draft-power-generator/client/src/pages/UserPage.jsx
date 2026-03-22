import { useState } from "react";
import { ArrowLeft, FileText, Send } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import api from "../services/api.js";

export default function UserPage({ onBack }) {
  const { tokens, mode } = useTheme();
  const [form, setForm] = useState({ fullName: "", contact: "", message: "" });
  const [status, setStatus] = useState("idle");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.fullName || !form.contact || !form.message) { setStatus("error"); return; }
    setStatus("sending");
    try {
      await api.post("/admin/feedback", form);
      setStatus("done");
      setForm({ fullName: "", contact: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

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
      <Topbar />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px" }}>
        <button
          onClick={onBack}
          style={{
            background: "none", border: "none",
            color: tokens.textMuted, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            marginBottom: 24, fontSize: 14, fontWeight: 500,
            transition: "color 0.2s",
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="glass-card" style={{ padding: 32 }}>
          <h2 style={{ color: tokens.text, fontWeight: 700, fontSize: 20, marginBottom: 12, transition: "color 0.35s" }}>
            About The Project
          </h2>
          <p style={{ color: tokens.textFaint, fontSize: 14, lineHeight: 1.75, marginBottom: 28, transition: "color 0.35s" }}>
            This system captures energy generation data in real-time and displays it.

          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: tokens.accentBg, border: `1px solid ${tokens.accentBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText size={15} color={tokens.accent} />
            </div>
            <h3 style={{ color: tokens.text, fontWeight: 600, fontSize: 16, transition: "color 0.35s" }}>
              Feedback Form
            </h3>
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ color: tokens.textMuted, fontSize: 13, display: "block", marginBottom: 6, fontWeight: 500 }}>
                Full Name
              </label>
              <input className="input-field" value={form.fullName} onChange={set("fullName")} placeholder="Your name" />
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ color: tokens.textMuted, fontSize: 13, display: "block", marginBottom: 6, fontWeight: 500 }}>
                Contact (Email / Phone)
              </label>
              <input className="input-field" value={form.contact} onChange={set("contact")} placeholder="you@email.com" />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: tokens.textMuted, fontSize: 13, display: "block", marginBottom: 6, fontWeight: 500 }}>
              Feedback / Issues / Hardware Faults
            </label>
            <textarea
              className="input-field" rows={5} value={form.message}
              onChange={set("message")} placeholder="Describe your feedback or issue or any hardware faults found..."
              style={{ resize: "vertical" }}
            />
          </div>

          {status === "done" && (
            <p style={{ color: tokens.success, fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
              ✓ Feedback submitted successfully. Thank you!
            </p>
          )}
          {status === "error" && (
            <p style={{ color: tokens.danger, fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
              Please fill in all fields and try again.
            </p>
          )}

          <button className="btn-green" onClick={handleSubmit} disabled={status === "sending"}>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Send size={15} />
              {status === "sending" ? "Submitting..." : "Submit Feedback"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}