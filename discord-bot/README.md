# FireCMS & Firebase Discord Bot

A long-running Discord bot written in TypeScript that answers FireCMS and Firebase related questions using the `gemini-3.5-flash` model and the official FireCMS documentation.

---

## Features

- **Knowledge-Backed Answers**: Dynamically loads `llms.txt` (the complete FireCMS docs) into the model's system context for 100% accurate, hallucination-free answers.
- **Thread & Reply Support**: Follows conversation context within DMs, threads, and message replies.
- **Auto-Chunking**: Automatically splits answers exceeding Discord's 2000-character limit without breaking code blocks or words.
- **Typing Indicator**: Shows when the bot is processing/generating an answer.

---

## 1. Setup Discord Bot Application

To run the bot, you need to register an application on the Discord Developer Portal:

1. Visit the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and give it a name (e.g., `FireCMS Helper`).
3. Navigate to the **Bot** tab on the left sidebar:
   - Click **Add Bot**.
   - Under **Privileged Gateway Intents**, enable:
     - **Guild Members Intent** (Optional, but recommended)
     - **Presence Intent** (Optional)
     - **Message Content Intent** (⚠️ **Required** to read incoming user messages)
   - Click **Reset Token** and copy the bot token. Keep this safe (this is your `DISCORD_TOKEN`).
4. Navigate to the **OAuth2** tab on the left sidebar, then click **URL Generator**:
   - Under **Scopes**, select `bot`.
   - Under **Bot Permissions**, select:
     - `Read Messages/View Channels`
     - `Send Messages`
     - `Send Messages in Threads`
     - `Read Message History`
     - `Add Reactions`
   - Copy the generated URL and open it in your browser to invite the bot to your Discord server.

---

## 2. Environment Configuration

Create a `.env` file in the `discord-bot/` directory with the following variables:

```env
# Your Discord bot token (from the developer portal)
DISCORD_TOKEN=your_discord_token_here

# Your Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# The Gemini model to use (defaults to gemini-3.5-flash if not specified)
GEMINI_MODEL=gemini-3.5-flash

# Optional: Comma-separated list of channel IDs where the bot is allowed to reply.
# If omitted or empty, the bot responds in all channels it can access.
ALLOWED_CHANNELS=
```

---

## 3. Local Development

From the root of the monorepo:

### Install dependencies
```bash
yarn install
```

### Run the bot in development mode (auto-reload)
```bash
yarn discord-bot:dev
```

### Build & Run the production version
```bash
# Build the package
yarn build

# Start the bot
yarn discord-bot
```

---

## 4. Deploying to Google Cloud Run (GCP)

Since this bot maintains a persistent WebSocket connection to Discord, it needs to run continuously. We can achieve this on Cloud Run by configuring a **minimum instance count of 1**.

### Step 4.1: Build and Push Docker Image

Set your GCP project ID and build the Docker container using Google Cloud Build:

```bash
# Set your GCP project ID
export PROJECT_ID="your-gcp-project-id"

# Submit build to Google Cloud Build (run from the monorepo root)
gcloud builds submit --tag gcr.io/$PROJECT_ID/firecms-discord-bot:latest .
```

### Step 4.2: Deploy to Cloud Run

Deploy the image to Cloud Run as a service. We must set:
- `--no-cpu-throttling` (ensures background tasks like websocket heartbeats run normally)
- `--min-instances 1` (keeps the container alive so it doesn't disconnect from Discord)
- Secret or Env vars for `DISCORD_TOKEN` and `GEMINI_API_KEY`.

```bash
gcloud run deploy firecms-discord-bot \
  --image gcr.io/$PROJECT_ID/firecms-discord-bot:latest \
  --platform managed \
  --region europe-west3 \
  --min-instances 1 \
  --no-cpu-throttling \
  --set-env-vars="GEMINI_MODEL=gemini-3.5-flash" \
  --set-secrets="DISCORD_TOKEN=DISCORD_TOKEN:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --no-allow-unauthenticated
```

*(Note: If you prefer simple env variables instead of GCP Secret Manager secrets, you can replace `--set-secrets` with `--set-env-vars="DISCORD_TOKEN=...,GEMINI_API_KEY=..."`)*
