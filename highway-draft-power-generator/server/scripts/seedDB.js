/**
 * seedDB.js — Seed MongoDB with sensor_data.csv
 *
 * Usage (from /server):
 *   node scripts/seedDB.js
 *   node scripts/seedDB.js --clear    (wipe collection first)
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const SensorData = require("../models/SensorData");

const CSV_PATH = path.join(__dirname, "../../sensor_data.csv");
const CLEAR = process.argv.includes("--clear");

function parseCSV(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  const header = lines[0].split(",").map((h) => h.trim());
  const tsIdx = header.findIndex((h) => h.toLowerCase().includes("time"));
  const vIdx = header.findIndex((h) => h.toLowerCase().includes("volt"));

  if (tsIdx === -1 || vIdx === -1) {
    throw new Error("CSV must have 'timestamp' and 'voltage_watt' columns");
  }

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    return {
      timestamp: new Date(cols[tsIdx].trim()),
      voltage_watt: parseFloat(cols[vIdx].trim()),
      source: "csv_upload",
    };
  }).filter((r) => r.timestamp instanceof Date && !isNaN(r.timestamp) && !isNaN(r.voltage_watt));
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected:", mongoose.connection.host);

    if (CLEAR) {
      await SensorData.deleteMany({});
      console.log("🗑️  Collection cleared");
    }

    if (!fs.existsSync(CSV_PATH)) {
      console.error("❌ CSV not found at:", CSV_PATH);
      process.exit(1);
    }

    const text = fs.readFileSync(CSV_PATH, "utf-8");
    const records = parseCSV(text);
    console.log(`📄 Parsed ${records.length} records from CSV`);

    const result = await SensorData.insertMany(records, { ordered: false });
    console.log(`✅ Inserted ${result.length} records into MongoDB`);

    // Summary
    const agg = await SensorData.aggregate([
      {
        $group: {
          _id: null,
          avg: { $avg: "$voltage_watt" },
          max: { $max: "$voltage_watt" },
          min: { $min: "$voltage_watt" },
        },
      },
    ]);
    if (agg[0]) {
      console.log(`📊 Avg: ${agg[0].avg.toFixed(2)}W | Max: ${agg[0].max.toFixed(2)}W | Min: ${agg[0].min.toFixed(2)}W`);
    }
  } catch (err) {
    if (err.code === 11000) {
      console.warn("⚠️  Some duplicate records skipped (already seeded)");
    } else {
      console.error("❌ Seed error:", err.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();
