// Parse CSV text → array of { timestamp, voltage_watt }
export function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const tsIdx = header.findIndex((h) => h.toLowerCase().includes("time"));
  const vIdx = header.findIndex((h) => h.toLowerCase().includes("volt"));
  if (tsIdx === -1 || vIdx === -1) throw new Error("CSV must have timestamp and voltage_watt columns");

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    return {
      timestamp: cols[tsIdx]?.trim(),
      voltage_watt: parseFloat(cols[vIdx]?.trim()),
    };
  }).filter((r) => r.timestamp && !isNaN(r.voltage_watt));
}

// Convert records array → CSV string
export function toCSVString(records) {
  const header = "timestamp,voltage_watt";
  const rows = records.map((r) => `${new Date(r.timestamp).toISOString()},${r.voltage_watt}`);
  return [header, ...rows].join("\n");
}

// Convert records → plain text report
export function toReportString(records, stats) {
  const lines = [
    "Highway Draft Power Generator — Data Report",
    `Generated: ${new Date().toLocaleString()}`,
    `Total Records: ${records.length}`,
    `Average Voltage: ${stats.avg?.toFixed(2) ?? "—"} W`,
    `Max Voltage:     ${stats.max?.toFixed(2) ?? "—"} W`,
    `Min Voltage:     ${stats.min?.toFixed(2) ?? "—"} W`,
    `Total Energy:    ${stats.total_wh?.toFixed(2) ?? "—"} Wh`,
    "",
    "--- Data Points ---",
    ...records.map(
      (r) => `${new Date(r.timestamp).toISOString()}  |  ${r.voltage_watt} W`
    ),
  ];
  return lines.join("\n");
}

// Download helper
export function downloadFile(content, filename, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
