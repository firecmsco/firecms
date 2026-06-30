import { Client, GatewayIntentBits, Message, ChannelType, Partials } from "discord.js";
import { GoogleGenAI, Content } from "@google/genai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const ALLOWED_CHANNELS = process.env.ALLOWED_CHANNELS ? process.env.ALLOWED_CHANNELS.split(",") : [];

let discordTokenValid = true;
if (!DISCORD_TOKEN || DISCORD_TOKEN.startsWith("placeholder")) {
    console.warn("WARNING: DISCORD_TOKEN environment variable is not defined or is a placeholder. Discord bot will not start.");
    discordTokenValid = false;
}

let geminiApiKeyValid = true;
if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith("placeholder")) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not defined or is a placeholder. Gemini integration will not work.");
    geminiApiKeyValid = false;
}

// Setup directories and load FireCMS documentation
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback search paths for llms.txt (monorepo structure or Docker runner path)
const possibleDocPaths = [
    path.resolve(__dirname, "../../website-astro/public/llms.txt"),
    path.resolve(__dirname, "../website-astro/public/llms.txt"),
    path.resolve(__dirname, "./llms.txt")
];

let firecmsDocs = "";
for (const docPath of possibleDocPaths) {
    if (fs.existsSync(docPath)) {
        try {
            firecmsDocs = fs.readFileSync(docPath, "utf-8");
            console.log(`Successfully loaded FireCMS documentation from: ${docPath} (${Math.round(firecmsDocs.length / 1024)} KB)`);
            break;
        } catch (err) {
            console.error(`Failed to read documentation at ${docPath}:`, err);
        }
    }
}

if (!firecmsDocs) {
    console.warn("WARNING: FireCMS documentation file (llms.txt) not found in expected locations. The bot will rely on Gemini's base knowledge.");
}

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// System instruction context for the AI model
const systemInstruction = `You are a helpful, professional, and friendly AI Discord bot named "FireCMS Helper", powered by Gemini 3.5 Flash.
Your primary role is to answer questions about FireCMS and Firebase.

${firecmsDocs ? `Here is the official documentation for FireCMS to help you answer questions accurately:\n\n=== FIRECMS DOCS START ===\n${firecmsDocs}\n=== FIRECMS DOCS END ===\n\n` : ""}
GUIDELINES:
1. Always strive to provide accurate, up-to-date information regarding FireCMS and Firebase.
2. Use markdown formatting (bolding, lists, and code blocks) to make your answers easy to read.
3. If a question is outside the scope of FireCMS and Firebase, politely decline to answer, stating that you are specialized in FireCMS and Firebase.
4. Keep your answers concise, as Discord messages have length limits.
5. If the documentation does not contain enough information to answer, state that you're unsure or that it might be a custom use case, and suggest looking at the GitHub repository or asking a maintainer.
6. When writing code snippets, specify the language (e.g. typescript, tsx, javascript, json).
7. Do not hallucinate URLs; only reference URLs found in the documentation or official FireCMS/Firebase links.

MODES OF OPERATION:
- You will receive messages prefixed with either [Direct Mode - Always respond] or [Eavesdropping Mode - Answer only if this is a clear question about FireCMS or Firebase, otherwise respond with IGNORE].
- In [Direct Mode], you must always generate a helpful reply to the user.
- In [Eavesdropping Mode], you must evaluate if the user is asking a clear technical question or seeking help/information regarding FireCMS or Firebase.
  - You MUST only respond if the message is a clear question asking for help, posing a query, or asking how to do something (e.g. "how do I configure X?", "why does Y fail?", "does FireCMS support Z?").
  - If the user's message is an explanation, a statement, an answer to someone else, a code snippet, a configuration example, a bug report without a question, or a general comment (even if it contains technical keywords about FireCMS or Firebase), you MUST reply with the exact single word "IGNORE" (and nothing else).
  - If the message is casual conversation, greetings, off-topic, or anything that is not a direct question asking for help with FireCMS or Firebase, you MUST reply with "IGNORE".
  - Do not provide any explanation when ignoring, just output the exact string "IGNORE".
`;

// Initialize Discord Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message
    ]
});

client.once("ready", () => {
    console.log(`Logged in to Discord as ${client.user?.tag}!`);
});

// Helper to chunk long messages
function splitResponse(text: string, maxLength: number = 1950): string[] {
    if (text.length <= maxLength) return [text];
    const chunks: string[] = [];
    let currentChunk = "";
    
    // Split by lines to avoid breaking code blocks or words awkwardly
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeBlockLang = "";

    for (const line of lines) {
        // Track code block state to properly close/reopen them across chunk boundaries
        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            if (inCodeBlock) {
                codeBlockLang = line.trim().substring(3);
            }
        }

        // If line is too long on its own, force-split it (rare)
        if (line.length > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = "";
            }
            let tempLine = line;
            while (tempLine.length > maxLength) {
                chunks.push(tempLine.substring(0, maxLength));
                tempLine = tempLine.substring(maxLength);
            }
            currentChunk = tempLine;
            continue;
        }

        if (currentChunk.length + line.length + 1 > maxLength) {
            // If we are inside a code block, close it for this chunk
            if (inCodeBlock) {
                currentChunk += "\n```";
            }
            chunks.push(currentChunk.trim());
            
            // Reopen code block for the next chunk
            if (inCodeBlock) {
                currentChunk = "```" + codeBlockLang + "\n" + line;
            } else {
                currentChunk = line;
            }
        } else {
            currentChunk += (currentChunk ? "\n" : "") + line;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

client.on("messageCreate", async (message: Message) => {
    console.log(`DEBUG: Received message event: from=${message.author.tag}, bot=${message.author.bot}, content="${message.content}", isMentioned=${message.mentions.has(client.user!.id)}`);
    // Ignore messages from bots
    if (message.author.bot) return;

    const isDM = message.channel.type === ChannelType.DM;
    const isMentioned = message.mentions.has(client.user!.id);
    const isInAllowedChannel = ALLOWED_CHANNELS.length === 0 || ALLOWED_CHANNELS.includes(message.channel.id);

    // Criteria to respond:
    // 1. DMs (always respond)
    // 2. Mentioned in any channel (if channel restrictions are not configured or it's allowed)
    // 3. Replied to a bot message
    let isReplyToBot = false;
    if (message.reference) {
        try {
            const repliedMsg = await message.channel.messages.fetch(message.reference.messageId!);
            if (repliedMsg.author.id === client.user!.id) {
                isReplyToBot = true;
            }
        } catch (err) {
            // Ignore fetch errors
        }
    }

    const isGeneralChannel = "name" in message.channel && typeof message.channel.name === "string" && message.channel.name.toLowerCase() === "general";
    const shouldRespond = isDM || (isInAllowedChannel && (isMentioned || isReplyToBot || isGeneralChannel));

    if (!shouldRespond) return;

    const isEavesdropping = isGeneralChannel && !isMentioned && !isReplyToBot;

    try {
        const cleanedCurrentContent = message.content.replace(new RegExp(`<@!?${client.user!.id}>`, "g"), "").trim();
        if (!cleanedCurrentContent) return;

        console.log(`Processing message from ${message.author.tag} in ${isDM ? "DM" : "guild channel"} (eavesdropping=${isEavesdropping})`);

        // Build contents for Gemini API
        const contents: Content[] = [];

        if (isEavesdropping) {
            // In eavesdropping mode, only process the single current message without history to avoid confusion
            contents.push({
                role: "user",
                parts: [{ text: `[Eavesdropping Mode - Answer only if this is a clear question about FireCMS or Firebase, otherwise respond with IGNORE]: ${cleanedCurrentContent}` }]
            });
        } else {
            // Show typing indicator
            if ("sendTyping" in message.channel && typeof message.channel.sendTyping === "function") {
                await message.channel.sendTyping();
            }

            // Fetch recent messages for conversation history
            const recentMessages = await message.channel.messages.fetch({ limit: 12 });
            
            // Sort chronologically (fetch returns newest first)
            const sortedMessages = Array.from(recentMessages.values()).reverse();

            for (const msg of sortedMessages) {
                // Skip system messages or other bots
                if (msg.author.bot && msg.author.id !== client.user!.id) continue;
                
                const role = msg.author.id === client.user!.id ? "model" : "user";
                
                // Clean the message content of mentions
                let text = msg.content;
                // Remove the bot's mention tag (e.g. <@1234567890> or <@!1234567890>)
                text = text.replace(new RegExp(`<@!?${client.user!.id}>`, "g"), "").trim();

                if (!text && role === "user") continue; // skip empty messages

                contents.push({
                    role,
                    parts: [{ text }]
                });
            }

            // Ensure the last message in contents is indeed the user's current message
            // in case history fetching missed it or ordered differently
            const lastContent = contents[contents.length - 1];
            if (!lastContent || lastContent.role !== "user" || !lastContent.parts || !lastContent.parts[0] || lastContent.parts[0].text !== cleanedCurrentContent) {
                contents.push({
                    role: "user",
                    parts: [{ text: `[Direct Mode - Always respond]: ${cleanedCurrentContent}` }]
                });
            } else {
                lastContent.parts[0].text = `[Direct Mode - Always respond]: ${lastContent.parts[0].text}`;
            }
        }

        // Call Gemini API
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2, // low temp for accurate docs references
            }
        });

        const replyText = response.text || "Sorry, I couldn't generate a response.";
        
        // If in eavesdropping mode and the response is IGNORE, do nothing
        if (isEavesdropping && replyText.trim().replace(/[.\s]/g, "").toUpperCase() === "IGNORE") {
            console.log(`Eavesdropping: Ignored message from ${message.author.tag} ("${cleanedCurrentContent}")`);
            return;
        }

        // If in eavesdropping mode and we decided to answer, trigger typing indicator briefly to show activity
        if (isEavesdropping && "sendTyping" in message.channel && typeof message.channel.sendTyping === "function") {
            await message.channel.sendTyping();
        }

        const replyChunks = splitResponse(replyText);

        // Send the reply chunks
        for (const chunk of replyChunks) {
            if (isDM) {
                await message.channel.send(chunk);
            } else {
                await message.reply(chunk);
            }
        }

    } catch (error) {
        console.error("Error generating answer or replying:", error);
        try {
            await message.reply("An error occurred while trying to process your request. Please try again later.");
        } catch (replyErr) {
            console.error("Failed to send error reply:", replyErr);
        }
    }
});

if (discordTokenValid && geminiApiKeyValid) {
    client.login(DISCORD_TOKEN).catch(err => {
        console.error("Failed to login to Discord bot client:", err);
    });
} else {
    console.log("Health check HTTP server is active. Configure DISCORD_TOKEN and GEMINI_API_KEY to activate the Discord bot functionality.");
}

// Start a dummy HTTP server to satisfy Cloud Run's port listening requirement
import * as http from "http";
const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
});
server.listen(PORT, () => {
    console.log(`Health check server listening on port ${PORT}`);
});

