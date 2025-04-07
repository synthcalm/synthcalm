const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/generate-image', async (req, res) => {
    try {
        if (!req.body.prompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }

        const prompt = req.body.prompt;
        const apiKey = process.env.STABILITY_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Stability API key not configured.' });
        }

        const requestBody = {
            text_prompts: [
                {
                    text: prompt,
                    weight: 1,
                },
            ],
            cfg_scale: 7,
            clip_guidance_preset: 'FAST_BLUE',
            height: 1024, // Use allowed dimensions
            width: 1024,  // Use allowed dimensions
            samples: 1,
            steps: 30,
        };

        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
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
