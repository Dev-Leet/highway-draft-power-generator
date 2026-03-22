import { useState, useEffect } from "react";
import { MessageSquare, User, Phone, Trash2, RefreshCw } from "lucide-react";
import api from "../services/api.js";

export default function FeedbackViewer() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/feedback");
      setFeedback(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={16} color="#06b6d4" />
          <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>
            User Feedback
          </span>
          <span
            style={{
              background: "rgba(6,182,212,0.15)",
              color: "#06b6d4",
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {feedback.length}
          </span>
        </div>
        <button
          onClick={load}
          style={{
            background: "none",
            border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: 7,
            padding: "6px 10px",
            color: "#475569",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
          }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: "#334155", textAlign: "center", padding: 40, fontSize: 13 }}>
          Loading feedback...
        </p>
      ) : feedback.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 60,
            color: "#1e293b",
            border: "1px dashed rgba(6,182,212,0.1)",
            borderRadius: 10,
          }}
        >
          <MessageSquare size={32} color="#1e293b" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14 }}>No feedback submitted yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {feedback.map((fb, i) => (
            <div
              key={fb._id || i}
              className="glass-card"
              style={{ padding: 18 }}
            >
              {/* Top row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <User size={13} color="#06b6d4" />
                    <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>
                      {fb.fullName}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Phone size={11} color="#475569" />
                    <span style={{ color: "#475569", fontSize: 12 }}>{fb.contact}</span>
                  </div>
                </div>
                <span style={{ color: "#334155", fontSize: 11 }}>
                  {new Date(fb.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Message */}
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(6,182,212,0.08)",
                  borderRadius: 7,
                  padding: "10px 14px",
                }}
              >
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {fb.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
