const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

// 🌐 Enable CORS for the frontend origin
app.use(cors({
  origin: 'https://synthcalm.github.io', // Allow only your frontend domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// 🔧 JSON body parser
app.use(bodyParser.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Handle preflight requests explicitly
app.options('/generate', cors());

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
