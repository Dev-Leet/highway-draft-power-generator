const mongoose = require("mongoose");

const SensorDataSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    voltage_watt: { type: Number, required: true },
    source: { type: String, enum: ["stream", "csv_upload"], default: "stream" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SensorData", SensorDataSchema);
