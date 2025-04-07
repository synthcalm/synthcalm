const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const styleMap = {
  "photo": "photographic",
  "anime": "anime",
  "abstract": "enhance",
  "surrealism": "fantasy-art",
  "post-modern": "enhance",
  "cyberpunk": "cyberpunk",
  "arabic-calligraphy": "line-art",
  "chinese-calligraphy": "line-art",
  "japanese-calligraphy": "line-art",
  "marvel": "comic-book",
  "art-deco": "isometric",
  "impressionist": "analog-film",
  "pop-art": "vibrant",
  "digital-painting": "digital-art",
  "minimalism": "minimalist"
};

app.post('/generate-image', async (req, res) => {
  const { prompt, style } = req.body;
  const apiKey = process.env.STABILITY_API_KEY;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required and cannot be empty.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Stability API key not
