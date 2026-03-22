import { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

const PAGE_SIZE = 15;

function badge(v) {
  if (v >= 180) return { color: "#4ade80", label: "High" };
  if (v >= 130) return { color: "#06b6d4", label: "Normal" };
  if (v >= 110) return { color: "#facc15", label: "Low" };
  return { color: "#f87171", label: "Critical" };
}

export default function DataTable({ records = [] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return records
      .filter((r) =>
        !q ||
        new Date(r.timestamp).toLocaleString().toLowerCase().includes(q) ||
        String(r.voltage_watt).includes(q)
      )
      .sort((a, b) => {
        const diff = new Date(a.timestamp) - new Date(b.timestamp);
        return sortDir === "asc" ? diff : -diff;
      });
  }, [records, query, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeP = Math.min(page, totalPages);
  const slice = filtered.slice((safeP - 1) * PAGE_SIZE, safeP * PAGE_SIZE);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <Search
            size={13}
            color="#475569"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            className="input-field"
            style={{ paddingLeft: 30, fontSize: 13 }}
            placeholder="Search timestamp or voltage..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          style={{
            background: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: 7,
            padding: "8px 14px",
            color: "#06b6d4",
            cursor: "pointer",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {sortDir === "desc" ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
          {sortDir === "desc" ? "Newest first" : "Oldest first"}
        </button>
        <span style={{ color: "#334155", fontSize: 12 }}>
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(6,182,212,0.15)",
                color: "#475569",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "8px 10px", fontWeight: 500 }}>#</th>
              <th style={{ padding: "8px 10px", fontWeight: 500 }}>Timestamp</th>
              <th style={{ padding: "8px 10px", fontWeight: 500 }}>Voltage (W)</th>
              <th style={{ padding: "8px 10px", fontWeight: 500 }}>Status</th>
              <th style={{ padding: "8px 10px", fontWeight: 500 }}>Source</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: 30, color: "#334155" }}>
                  No records found
                </td>
              </tr>
            ) : (
              slice.map((r, i) => {
                const b = badge(r.voltage_watt);
                return (
                  <tr
                    key={r._id || i}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                    }}
                  >
                    <td style={{ padding: "7px 10px", color: "#334155" }}>
                      {(safeP - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td style={{ padding: "7px 10px", color: "#94a3b8", fontFamily: "monospace" }}>
                      {new Date(r.timestamp).toLocaleString("en-US", {
                        month: "short", day: "2-digit",
                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td style={{ padding: "7px 10px", color: "#e2e8f0", fontWeight: 600 }}>
                      {r.voltage_watt.toFixed(2)}
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      <span
                        style={{
                          background: `${b.color}20`,
                          color: b.color,
                          border: `1px solid ${b.color}40`,
                          borderRadius: 5,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        {b.label}
                      </span>
                    </td>
                    <td style={{ padding: "7px 10px", color: "#475569", fontSize: 11 }}>
                      {r.source === "csv_upload" ? "CSV" : "Stream"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safeP === 1}
            style={{
              background: "none",
              border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: 6,
              padding: "5px 10px",
              color: safeP === 1 ? "#1e293b" : "#06b6d4",
              cursor: safeP === 1 ? "default" : "pointer",
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ color: "#475569", fontSize: 13 }}>
            Page {safeP} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeP === totalPages}
            style={{
              background: "none",
              border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: 6,
              padding: "5px 10px",
              color: safeP === totalPages ? "#1e293b" : "#06b6d4",
              cursor: safeP === totalPages ? "default" : "pointer",
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
