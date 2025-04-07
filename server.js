const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const styleMap = {
  "photo": "enhance",
  "anime": "anime",
  "abstract": "enhance",
  "surrealism": "enhance",
  "post-modern": "enhance",
  "cyberpunk": "cinematic",
  "arabic-calligraphy": "enhance",
  "chinese-calligraphy": "enhance",
  "japanese-calligraphy": "enhance",
  "marvel": "comic-book",
  "art-deco": "digital-art",
  "impressionist": "enhance",
  "pop-art": "digital-art",
  "digital-painting": "digital-art",
  "minimalism": "enhance"
};

app.post('/generate-image', async (req, res) => {
  const { prompt, style } = req.body;
  const apiKey = process.env.STABILITY_API_KEY;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required and cannot be empty.' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Stability API key not configured.' });
  }

  const stylePreset = styleMap[style] || 'enhance';

  console.log(`🧠 Sending to Stability: "${prompt}" with style "${stylePreset}"`);

  const requestBody = {
    prompt,
    style_preset: stylePreset,
    output_format: "png"
  };

  try {
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    res.json({ image: `data:image/png;base64,${base64Image}` });

    console.log('✅ Image generated successfully');
  } catch (error) {
    const err = error.response?.data || error.message;
    console.error('❌ Image generation error:', err);
    res.status(400).json({ error: `Image generation failed: ${err}` });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
