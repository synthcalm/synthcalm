const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const axios = require("axios");
const FormData = require("form-data");

dotenv.config();

const app = express(); // ✅ Must be declared before use
const port = process.env.PORT || 10000;

// 🌐 Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// 🔧 JSON body parser
app.use(bodyParser.json());

// 🔐 GET AssemblyAI token
app.get("/assemblyai-token", async (req, res) => {
  const API_KEY = process.env.ASSEMBLYAI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "AssemblyAI API key missing" });

  try {
    const tokenRes = await axios.post(
      "https://api.assemblyai.com/v2/realtime/token",
      { expires_in: 3600 },
      { headers: { authorization: API_KEY } }
    );
    res.json({ token: tokenRes.data.token });
  } catch (err) {
    console.error("❌ AssemblyAI token error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get AssemblyAI token" });
  }
});

// 🔐 GET Deepgram token
app.get("/deepgram-token", async (req, res) => {
  const API_KEY = process.env.DEEPGRAM_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "Deepgram API key missing" });

  try {
    const response = await axios.post(
      "https://api.deepgram.com/v1/listen/token",
      {},
      { headers: { Authorization: `Token ${API_KEY}` } }
    );
    res.json({ token: response.data.token });
  } catch (err) {
    console.error("❌ Deepgram token error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get Deepgram token" });
  }
});

// 🎨 POST generate image
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  const API_KEY = process.env.STABILITY_API_KEY;

  if (!API_KEY) return res.status(500).json({ error: "Stability API key missing" });
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  console.log(`🔁 Image generation request: "${prompt}"`);

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("model", "stable-diffusion-xl-1024-v1-0");
    formData.append("output_format", "png");
    formData.append("width", 1080);
    formData.append("height", 1080);

    const imageRes = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json"
        }
      }
    );

    if (imageRes.data && imageRes.data.image) {
      console.log("✅ Image generated successfully");
      res.json({ image: imageRes.data.image });
    } else {
      console.warn("⚠️ No image returned from Stability AI");
      res.status(500).json({ error: "No image returned from Stability API" });
    }
  } catch (err) {
    console.error("❌ Image generation failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Image generation failed", details: err.response?.data || err.message });
  }
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
