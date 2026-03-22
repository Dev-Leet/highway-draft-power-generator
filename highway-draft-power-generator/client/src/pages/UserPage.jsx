import { useState } from "react";
import { ArrowLeft, FileText, Send } from "lucide-react";
import Topbar from "../components/Topbar.jsx";
import api from "../services/api.js";

export default function UserPage({ onBack }) {
  const [form, setForm] = useState({ fullName: "", contact: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | done | error

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.fullName || !form.contact || !form.message) {
      setStatus("error");
      return;
    }
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
    <div style={{ minHeight: "100vh", background: "#060b16" }}>
      <Topbar />
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="glass-card" style={{ padding: 32 }}>
          {/* About section */}
          <h2 style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>
            About The Project
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            This system captures energy generation data in real-time, processes it, and displays it via dynamic spline
            and line charts.
          </p>

          {/* Feedback Form */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <FileText size={18} color="#06b6d4" />
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 16 }}>Feedback Form</h3>
          </div>

          <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>
                Full Name
              </label>
              <input
                className="input-field"
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="Your name"
              />
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>
                Contact (Email / Phone)
              </label>
              <input
                className="input-field"
                value={form.contact}
                onChange={set("contact")}
                placeholder="you@email.com"
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 6 }}>
              Feedback / Issues
            </label>
            <textarea
              className="input-field"
              rows={5}
              value={form.message}
              onChange={set("message")}
              placeholder="Describe your feedback or issue..."
              style={{ resize: "vertical" }}
            />
          </div>

          {status === "done" && (
            <p style={{ color: "#4ade80", fontSize: 13, marginBottom: 12 }}>
              ✓ Feedback submitted successfully. Thank you!
            </p>
          )}
          {status === "error" && (
            <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>
              Please fill in all fields and try again.
            </p>
          )}

          <button
            className="btn-green"
            onClick={handleSubmit}
            disabled={status === "sending"}
          >
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
