/**
 * useDataStream — DataStreamService Hook
 *
 * Architecture doc: "We use a DataStreamService hook to mimic real-time
 * WebSocket packets from RP2040/ESP8266 hardware."
 *
 * This hook:
 *  - Connects to the Socket.io server
 *  - Manages connection status
 *  - Maintains a rolling window of data points
 *  - Provides pause / resume controls
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { connectSocket, disconnectSocket } from "../services/socket.js";
import api from "../services/api.js";

const MAX_POINTS = 60; // rolling window size

function fmtLabel(ts) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function useDataStream() {
  const [status, setStatus] = useState("connecting"); // connecting | connected | offline | paused
  const [chartData, setChartData] = useState([]);     // [{ v, label }]
  const [rawRecords, setRawRecords] = useState([]);   // full record objects
  const [lastPacket, setLastPacket] = useState(null);
  const [stats, setStats] = useState({});
  const paused = useRef(false);

  // ── Load historical data from REST ──────────────────────────────────────
  const loadHistory = useCallback(async () => {
    try {
      const [{ data: records }, { data: st }] = await Promise.all([
        api.get("/data?limit=60"),
        api.get("/data/stats"),
      ]);
      setRawRecords(records);
      setChartData(
        records.map((r) => ({ v: r.voltage_watt, label: fmtLabel(r.timestamp) }))
      );
      setStats(st);
      if (records.length) setLastPacket(records[records.length - 1]);
    } catch {
      // silently ignore — WebSocket will fill data
    }
  }, []);

  // ── WebSocket stream ─────────────────────────────────────────────────────
  useEffect(() => {
    loadHistory();
    const socket = connectSocket();

    socket.on("connect", () => setStatus("connected"));
    socket.on("disconnect", () => setStatus("offline"));
    socket.on("connect_error", () => setStatus("offline"));

    socket.on("sensor_data", (packet) => {
      if (paused.current) return;

      setLastPacket(packet);

      const point = { v: packet.voltage_watt, label: fmtLabel(packet.timestamp) };

      setChartData((prev) => [...prev, point].slice(-MAX_POINTS));
      setRawRecords((prev) => [...prev, packet].slice(-MAX_POINTS));

      setStats((s) => {
        const count = (s.count || 0) + 1;
        const avg = s.avg
          ? parseFloat(((s.avg * (count - 1) + packet.voltage_watt) / count).toFixed(2))
          : packet.voltage_watt;
        const max = Math.max(s.max ?? 0, packet.voltage_watt);
        const min = Math.min(s.min ?? Infinity, packet.voltage_watt);
        return { ...s, avg, max, min, count, latest: packet };
      });
    });

    return () => {
      socket.off("sensor_data");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      disconnectSocket();
    };
  }, [loadHistory]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    paused.current = true;
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    paused.current = false;
    setStatus("connected");
  }, []);

  const refresh = useCallback(() => {
    setChartData([]);
    setRawRecords([]);
    loadHistory();
  }, [loadHistory]);

  return { status, chartData, rawRecords, lastPacket, stats, pause, resume, refresh };
}
