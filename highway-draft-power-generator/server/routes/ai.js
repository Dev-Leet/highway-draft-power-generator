const express = require("express");
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

router.post("/summary", async (req, res) => {
  try {
    const { records } = req.body;

    const snapshot = records
      .slice(-20)
      .map(r => `${new Date(r.timestamp).toISOString()}: ${r.voltage_watt}W`)
      .join("\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "user", content: `Analyze this data:\n${snapshot}` }
        ]
      })
    });

    const data = await response.json();

    res.json({
      summary: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;