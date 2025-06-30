# AI Social Gemini Backend (Google Drive)

- Uses Google Gemini for all AI tasks (text, chat, content, image generation)
- Integrates with your Google Drive to fetch your images
- Free to use with your Google AI Studio API key

## Usage

1. Set up your `.env` file:

   ```
   GOOGLE_API_KEY=your-google-api-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=your-oauth-redirect-uri
   GOOGLE_REFRESH_TOKEN=your-refresh-token
   ```

   > To get a refresh token, follow a Google OAuth2 flow and consent for Drive access.

2. Install dependencies:

   ```
   npm install
   ```

3. Start the server:

   ```
   npm start
   ```

- Endpoints:
  - `/api/drive/images` — List your Google Drive images
  - `/api/moderation/check` — NSFW keyword filter
  - `/api/social/generate` — Social post generation
  - `/api/teaser/generate` — Teaser/snippet generation
  - `/api/chat/send` — AI chat
  - `/api/image/generate` — Image generation (Gemini/Imagen)
  - `/api/subscription/subscribe` — Mock subscription

---