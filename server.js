const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/generate-image', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        const apiKey = process.env.STABILITY_API_KEY;

        if (!prompt || prompt.trim() === '') {
            console.error('Error: Prompt is empty or missing.');
            return res.status(400).json({ error: 'Prompt is required and cannot be empty.' });
        }

        if (!apiKey) {
            console.error('Error: Stability API key not configured.');
            return res.status(500).json({ error: 'Stability API key not configured. Please set the STABILITY_API_KEY environment variable.' });
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
            height: 1024,
            width: 1024,
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

        console.log('Image generated successfully for prompt:', prompt); // Log success

    } catch (error) {
        console.error('Error generating image:', error);

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const errorMessage = error.response.data.error || error.response.statusText;
                console.error('Stability API error:', errorMessage);
                return res.status(error.response.status).json({ error: `Image generation failed: ${errorMessage}` });
            } else if (error.request) {
                console.error('Stability API request failed (no response).');
                return res.status(500).json({ error: 'No response received from the image generation service. Please try again later.' });
            } else {
                console.error('Error setting up the request to Stability API:', error.message);
                return res.status(500).json({ error: `Error setting up the request: ${error.message}` });
            }
        } else {
            console.error('Unexpected error during image generation:', error.message || error);
            return res.status(500).json({ error: 'An unexpected error occurred during image generation. Please try again later.' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
