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
    return res.status(500).json({ error: 'Stability API key not configured.' });
  }

  const stylePreset = styleMap[style] || 'enhance';

  console.log(`🧠 Sending prompt to Stability: "${prompt}" with style: "${stylePreset}"`);

  try {
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1.0
          }
        ],
        height: 1024,
        width: 1024,
        cfg_scale: 7,
        steps: 50,
        style_preset: stylePreset
      },
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
    const errMsg = error?.response?.data?.message || error.message || 'Unknown error';
    console.error('❌ Stability API error:', errMsg);

    res.status(error?.response?.status || 500).json({
      error: `Image generation failed: ${errMsg}`
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
