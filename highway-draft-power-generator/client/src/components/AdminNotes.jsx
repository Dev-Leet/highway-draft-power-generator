import { useState, useEffect } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import api from "../services/api.js";

export default function AdminNotes() {
  const [notes, setNotes] = useState([]);
  const [obs, setObs] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/notes");
      setNotes(data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const addNote = async () => {
    if (!obs.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post("/admin/notes", { observation: obs.trim() });
      setNotes((n) => [data, ...n]);
      setObs("");
    } catch {}
    setSaving(false);
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/admin/notes/${id}`);
      setNotes((n) => n.filter((x) => x._id !== id));
    } catch {}
  };

  return (
    <div className="glass-card" style={{ padding: 20, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <FileText size={16} color="#06b6d4" />
        <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Admin Notes</span>
      </div>

      {/* Notes list */}
      <div
        style={{
          minHeight: 100,
          maxHeight: 180,
          overflowY: "auto",
          marginBottom: 14,
        }}
      >
        {notes.length === 0 ? (
          <p style={{ color: "#334155", fontSize: 13, textAlign: "center", marginTop: 30 }}>
            No observations recorded.
          </p>
        ) : (
          notes.map((n) => (
            <div
              key={n._id}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(6,182,212,0.1)",
                borderRadius: 7,
                padding: "8px 10px",
                marginBottom: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <div>
                <p style={{ color: "#cbd5e1", fontSize: 13 }}>{n.observation}</p>
                <p style={{ color: "#334155", fontSize: 11, marginTop: 3 }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => deleteNote(n._id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", paddingTop: 2 }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add note */}
      <textarea
        className="input-field"
        rows={3}
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        placeholder="Enter observation..."
        style={{ resize: "none", marginBottom: 10 }}
      />
      <button
        className="btn-primary"
        onClick={addNote}
        disabled={saving}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
      >
        <Plus size={15} /> Add Note
      </button>
    </div>
  );
}
