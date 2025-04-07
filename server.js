const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/generate-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.body.prompt) {
      return res.status(400).json({ error: 'Image and prompt are required.' });
    }

    const imageBuffer = req.file.buffer;
    const prompt = req.body.prompt;
    const apiKey = process.env.STABILITY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Stability API key not configured.' });
    }

    const formData = new FormData();
    formData.append('init_image', new Blob([imageBuffer]));
    formData.append('image_generation_usecase', 'IMAGE_EDITING');
    formData.append('text_prompts[0][text]', prompt);
    formData.append('text_prompts[0][weight]', '1');
    formData.append('cfg_scale', '7');
    formData.append('clip_guidance_preset', 'FAST_BLUE');
    formData.append('height', '512');
    formData.append('width', '512');
    formData.append('samples', '1');
    formData.append('steps', '30');

    const response = await axios.post(
      'https://api.stability.ai/v1/image/generation/stable-diffusion-xl-1024-v1-0/image-to-image',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: apiKey,
        },
        responseType: 'arraybuffer',
      }
    );

    const image = Buffer.from(response.data, 'binary').toString('base64');
    res.json({ image: `data:image/png;base64,${image}` });

  } catch (error) {
    console.error('Error generating image:', error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        return res.status(error.response.status).json({ error: `Image generation failed: ${error.response.data.error || error.response.statusText}` });
      } else if (error.request) {
        return res.status(500).json({ error: 'No response received from the image generation service.' });
      } else {
        return res.status(500).json({ error: `Error setting up the request: ${error.message}` });
      }
    } else {
      return res.status(500).json({ error: 'An unexpected error occurred during image generation.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
