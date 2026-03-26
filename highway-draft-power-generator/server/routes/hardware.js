const express             = require("express");
const router              = express.Router();
const SensorData          = require("../models/SensorData");
const validateHardwareKey = require("../middleware/hardwareAuth");

// In-memory rate limiter: min 5s between packets per device_id
const deviceLastSeen = new Map();
const RATE_LIMIT_MS  = 5000;

router.post("/ingest", validateHardwareKey, async (req, res) => {
  const { device_id, voltage_watt, uptime_ms } = req.body;

  if (!device_id || voltage_watt === undefined) {
    return res.status(400).json({ message: "Missing required fields: device_id, voltage_watt" });
  }

  const volt = parseFloat(voltage_watt);
  if (isNaN(volt) || volt < 0 || volt > 500) {
    return res.status(422).json({ message: "voltage_watt must be a number between 0 and 500" });
  }

  const now = Date.now();
  if (now - (deviceLastSeen.get(device_id) ?? 0) < RATE_LIMIT_MS) {
    return res.status(429).json({ message: "Rate limit: minimum 5s between requests" });
  }
  deviceLastSeen.set(device_id, now);

  try {
    const record = await SensorData.create({
      timestamp:    new Date(),
      voltage_watt: volt,
      source:       "stream",
      device_id,
    });

    req.app.get("io").emit("sensor_data", {
      timestamp:    record.timestamp,
      voltage_watt: record.voltage_watt,
      source:       "stream",
      device_id:    record.device_id,
    });

    res.status(201).json({ received: true, id: record._id });
  } catch (err) {
    console.error("[HW Ingest]", err.message);
    res.status(500).json({ message: "Persistence failed" });
  }
});

module.exports = router;