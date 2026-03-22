const express = require("express");
const router = express.Router();
const { AdminNote, Feedback } = require("../models/Other");
const protect = require("../middleware/auth");

// --- Admin Notes ---
router.get("/notes", protect, async (req, res) => {
  try {
    const notes = await AdminNote.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/notes", protect, async (req, res) => {
  try {
    const note = await AdminNote.create({ observation: req.body.observation });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/notes/:id", protect, async (req, res) => {
  try {
    await AdminNote.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- User Feedback ---
router.post("/feedback", async (req, res) => {
  try {
    const fb = await Feedback.create(req.body);
    res.status(201).json(fb);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/feedback", protect, async (req, res) => {
  try {
    const all = await Feedback.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
