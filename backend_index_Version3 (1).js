require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
const IMAGEN_URL = "https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generate";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// === Google Drive OAuth Setup ===
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

// List image files from Google Drive
app.get('/api/drive/images', async (req, res) => {
  try {
    const filesRes = await drive.files.list({
      q: "mimeType contains 'image/' and trashed = false",
      fields: "files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink)",
      pageSize: 20
    });
    res.json(filesRes.data.files);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// === Gemini Functions ===
async function geminiPrompt(prompt) {
  const res = await axios.post(
    `${GEMINI_URL}?key=${GOOGLE_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );
  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "(No result)";
}

async function geminiGenerateImage(prompt) {
  const res = await axios.post(
    `${IMAGEN_URL}?key=${GOOGLE_API_KEY}`,
    { prompt }
  );
  const img = res.data.images?.[0];
  if (!img) return null;
  return img.url || (img.base64Data ? `data:image/png;base64,${img.base64Data}` : null);
}

// === AI Endpoints as before ===
app.post('/api/moderation/check', async (req, res) => {
  const { imageUrl } = req.body;
  if (imageUrl && imageUrl.toLowerCase().includes('nsfw')) {
    return res.json({ approved: false, reason: 'NSFW detected' });
  }
  // You can expand: use Gemini for moderation if desired
  res.json({ approved: true });
});

app.post('/api/social/generate', async (req, res) => {
  const { imageDesc, platform } = req.body;
  try {
    const prompt = `Write a catchy ${platform} post for this image: ${imageDesc}`;
    const result = await geminiPrompt(prompt);
    res.json({ post: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/teaser/generate', async (req, res) => {
  const { imageDesc } = req.body;
  try {
    const prompt = `Write a short, intriguing teaser (max 30 words) for this image: ${imageDesc}`;
    const result = await geminiPrompt(prompt);
    res.json({ teaser: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/chat/send', async (req, res) => {
  const { message } = req.body;
  try {
    const prompt = `You are a helpful assistant. ${message}`;
    const result = await geminiPrompt(prompt);
    res.json({ reply: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/image/generate', async (req, res) => {
  const { prompt } = req.body;
  try {
    const image = await geminiGenerateImage(prompt);
    if (image) {
      res.json({ image });
    } else {
      res.status(500).json({ error: "No image generated" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/subscription/subscribe', async (req, res) => {
  const { email } = req.body;
  res.json({ success: true, message: `Subscribed ${email}` });
});

app.get('/', (_, res) => res.send('AI Social Gemini Backend with Google Drive!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port", PORT));