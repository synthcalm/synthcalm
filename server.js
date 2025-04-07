const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Style descriptions mapped to readable phrases
const styleMap = {
    "photo": "in a hyper-realistic photo style",
    "anime": "in Japanese anime style",
    "abstract": "in abstract artistic form",
    "surrealism": "in surrealism style",
    "post-modern": "in post-modern artistic style",
    "cyberpunk": "in cyberpunk art style",
    "arabic-calligraphy": "in Arabic calligraphy style",
    "chinese-calligraphy": "in Chinese calligraphy brush style",
    "japanese-calligraphy": "in Japanese ink calligraphy",
    "marvel": "in Marvel comic book style",
    "art-deco": "in an Art Deco illustration style",
    "impressionist": "in impressionist painting style",
    "pop-art": "in Pop Art style",
    "digital-painting": "as a digital painting",
    "minimalism": "in minimalist style"
};

// Image generation endpoint
app.post('/generate-image', async (req, res) => {
    const { prompt, style } = req.body;
    const apiKey = process.env.STABILITY_API_KEY;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt is required and cannot be empty.' });
    }

    // Validate API key
    if (!apiKey) {
        return res.status(500).json({ error: 'Server error: Stability API key not configured.' });
    }

    // Prepare full prompt with selected style
    const styleText = styleMap[style] || '';
    const fullPrompt = `${prompt} ${styleText}`.trim();

    console.log(`🧠 Sending prompt to Stability: "${fullPrompt}"`);

    // Prepare Stability API request
    const requestBody = {
        text_prompts: [{ text: fullPrompt, weight: 1 }],
        cfg_scale: 7,
        clip_guidance_preset: 'FAST_BLUE',
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30
    };

    try {
        const response = await axios.post(
            'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`
                },
                responseType: 'arraybuffer'
            }
        );

        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        res.json({ image: `data:image/png;base64,${base64Image}` });

        console.log('✅ Image successfully generated.');
    } catch (error) {
        console.error('❌ Stability API error:', error?.response?.data || error.message);

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const message = error.response.data?.message || error.response.data?.error || 'Bad Request';
                return res.status(error.response.status).json({ error: `Image generation failed: ${message}` });
            } else if (error.request) {
                return res.status(502).json({ error: 'No response from image service. Try again later.' });
            } else {
                return res.status(500).json({ error: `Request error: ${error.message}` });
            }
        }

        res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
});
