const express = require("express");
const router = express.Router();
const SensorData = require("../models/SensorData");
const protect = require("../middleware/auth");

// GET /api/data?limit=50&from=&to=
router.get("/", protect, async (req, res) => {
  try {
    const { limit = 150, from, to } = req.query;
    const filter = {};
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }
    const data = await SensorData.find(filter)
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    res.json(data.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/data/bulk  — CSV import (array of { timestamp, voltage_watt })
router.post("/bulk", protect, async (req, res) => {
  try {
    const records = req.body.records.map((r) => ({
      timestamp: new Date(r.timestamp),
      voltage_watt: Number(r.voltage_watt),
      source: "csv_upload",
    }));
    await SensorData.insertMany(records, { ordered: false });
    res.json({ inserted: records.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/data/stats — summary stats
router.get("/stats", protect, async (req, res) => {
  try {
    const result = await SensorData.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: "$voltage_watt" },
          max: { $max: "$voltage_watt" },
          min: { $min: "$voltage_watt" },
          total_wh: { $sum: { $multiply: ["$voltage_watt", 1 / 6] } }, // every 10-min interval
          count: { $sum: 1 },
        },
      },
    ]);
    const latest = await SensorData.findOne().sort({ timestamp: -1 });
    res.json({ ...(result[0] || {}), latest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
