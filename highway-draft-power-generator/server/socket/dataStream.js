// Simulates RP2040/ESP8266 hardware sending real-time packets via WebSocket
const SensorData = require("../models/SensorData");

let intervalId = null;

function generateVoltage() {
  const hour = new Date().getHours();
  const timeFrac = hour + new Date().getMinutes() / 60;

  let base;
  if (timeFrac < 5) base = 105;
  else if (timeFrac < 9) base = 150 + 50 * Math.sin(((timeFrac - 5) * Math.PI) / 4);
  else if (timeFrac < 16) base = 145;
  else if (timeFrac < 20) base = 155 + 45 * Math.sin(((timeFrac - 16) * Math.PI) / 4);
  else base = 120;

  const noise = (Math.random() - 0.5) * 30;
  return parseFloat(Math.max(100, Math.min(200, base + noise)).toFixed(2));
}

function startStream(io) {
  // Emit a new sensor packet every 10 seconds (demo cadence)
  intervalId = setInterval(async () => {
    const packet = {
      timestamp: new Date(),
      voltage_watt: generateVoltage(),
      source: "stream",
    };

    // Persist to MongoDB
    try {
      await SensorData.create(packet);
    } catch (_) {}

    // Broadcast to all connected admin clients
    io.emit("sensor_data", packet);
  }, 10000);

  console.log("DataStreamService: WebSocket stream started");
}

function stopStream() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = { startStream, stopStream };
