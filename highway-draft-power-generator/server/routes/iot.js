const express = require("express");
const router = express.Router();
const Data = require("../models/SensorData"); // your schema

module.exports = (io) => {

  router.post("/sensor", async (req, res) => {
    try {
      const { voltage_watt } = req.body;

      if (!voltage_watt) {
        return res.status(400).json({ error: "Missing data" });
      }

      const newData = await Data.create({
        voltage_watt,
      });

      // 🔥 Emit real-time data to frontend
      io.emit("new-data", newData);

      res.json({ success: true });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  return router;
};