import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// IMPORTANT: Set GEMINI_API_KEY environment variable before running
// e.g. export GEMINI_API_KEY="your-api-key"
const ai = new GoogleGenAI({});

const TOPICS = [
    { title: "FireCMS vs Contentful", slug: "firecms-vs-contentful", type: "comparison", domain: "contentful.com", description: "An honest comparison of FireCMS and Contentful for developers." },
    { title: "FireCMS vs Strapi", slug: "firecms-vs-strapi", type: "comparison", domain: "strapi.io", description: "Evaluating FireCMS and Strapi for headless backend capabilities." },
    { title: "FireCMS vs Supabase", slug: "firecms-vs-supabase", type: "comparison", domain: "supabase.com", description: "When to use FireCMS vs Supabase for your next project." },
    { title: "FireCMS vs Firebase Console", slug: "firecms-vs-firebase-console", type: "comparison", domain: "firebase.google.com", description: "Why you might outgrow the default Firebase Console and switch to FireCMS." },
    { title: "FireCMS vs Retool", slug: "firecms-vs-retool", type: "comparison", domain: "retool.com", description: "Building internal tools: Retool vs FireCMS for Firebase users." }
];

const LOCAL_LOGOS: Record<string, string> = {
    "contentful.com": "contentful-light.svg",
    "firebase.google.com": "google-firebase-icon.svg",
    "retool.com": "Retool_Logo_0.svg",
    "strapi.io": "strapi-full-logo-light.svg",
    "supabase.com": "supabase-icon-5uqgeeqeknngv9las8zeef.webp",
};

const FIRECMS_CONTEXT = `
FireCMS is a headless CMS and admin panel built for Firebase and Firestore. It's built with React.
Key Features:
1. Seamless integration with Firebase Auth, Firestore, and Cloud Storage.
2. Extremely easy to set up for existing Firebase projects without migrating data.
3. Automatically generates forms based on schema definitions.
4. Highly customizable using custom React components, views, and fields.
5. Built-in features: complex data relations, referenced collections, embedded arrays, real-time sync, powerful role-based access control.
6. Open source and self-hostable, but also offers a fully managed platform.
`;

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'comparisons');
const IMAGE_DIR = path.join(process.cwd(), 'public', 'img', 'comparisons');

async function generateCoverImage(topic: any) {
    if (!fs.existsSync(IMAGE_DIR)) {
        fs.mkdirSync(IMAGE_DIR, { recursive: true });
    }
    
    const firecmsPath = path.join(process.cwd(), 'public', 'img', 'firecms_logo.svg');
    const firecmsResized = await sharp(firecmsPath)
        .resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();

    let compResized;
    try {
        const localFile = LOCAL_LOGOS[topic.domain];
        if (localFile) {
            const localPath = path.join(process.cwd(), 'public', 'img', 'competitors', localFile);
            compResized = await sharp(localPath)
                .resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .toBuffer();
        } else {
            const url = `https://www.google.com/s2/favicons?domain=${topic.domain}&sz=256`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Logo not found");
            const compBuffer = Buffer.from(await res.arrayBuffer());
            compResized = await sharp(compBuffer)
                .resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .toBuffer();
        }
    } catch (e) {
        console.warn(`Could not fetch logo for ${topic.domain}, generating fallback text instead.`);
        // Fallback transparent buffer with some text
        const fallbackSvg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
            <text x="150" y="150" font-family="system-ui, sans-serif" font-size="40" fill="#ff5a5f" text-anchor="middle">${topic.domain}</text>
        </svg>`;
        compResized = await sharp(Buffer.from(fallbackSvg)).toBuffer();
    }

    const isVs = topic.title.includes(' vs ');
    const textSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <text x="100" y="100" font-family="system-ui, sans-serif" font-size="60" font-weight="900" fill="#a1a1aa" text-anchor="middle" dominant-baseline="central" opacity="0.6">${isVs ? 'VS' : '+'}</text>
    </svg>`;
    const textResized = await sharp(Buffer.from(textSvg)).toBuffer();

    const imgFilePath = path.join(IMAGE_DIR, `${topic.slug}.png`);
    
    await sharp({
        create: { width: 1200, height: 630, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
    })
    .composite([
        { input: firecmsResized, left: 200, top: 195 },
        { input: textResized, left: 500, top: 215 },
        { input: compResized, left: 760, top: 195 }
    ])
    .png()
    .toFile(imgFilePath);
        
    return `/img/comparisons/${topic.slug}.png`;
}

async function generatePage(topic: any) {
    const filePath = path.join(CONTENT_DIR, `${topic.slug}.mdx`);
    
    // Create the image every time
    const imageUrl = await generateCoverImage(topic);

    if (!process.env.FORCE_REGENERATE && fs.existsSync(filePath)) {
        console.log(`Skipping LLM generation for ${topic.title}, already exists. Image updated.`);
        // Note: we should update the image url in the frontmatter of existing files
        let existingContent = fs.readFileSync(filePath, 'utf8');
        // Handle images with Quotes or without Quotes
        existingContent = existingContent.replace(/image: .*/, `image: "${imageUrl}"`);
        // Fix invalid pubDate string to ISO date
        existingContent = existingContent.replace(/pubDate: new Date\(\)/, `pubDate: ${new Date().toISOString().substring(0,10)}`);
        fs.writeFileSync(filePath, existingContent);
        return;
    }

    console.log(`Generating content for: ${topic.title}...`);

    const prompt = `
You are an expert technical writer, Senior Developer Advocate, and master marketer for FireCMS. 
Write a highly engaging, SEO-optimized, technical markdown article about: "${topic.title}".

Context about FireCMS:
${FIRECMS_CONTEXT}

The article must be well-structured with:
1. A catchy introduction geared towards modern developers.
2. For comparisons: Write a highly persuasive comparison that ultimately positions FireCMS as the superior choice for modern React/Firebase setups. Spin any perceived 'limitations' as intentional architectural strengths.
3. MAKE IT HIGHLY VISUAL AND READABLE: DO NOT write massive walls of text. You MUST break up the content aggressively using rich Markdown features:
   - Use Markdown Feature Comparison Tables to visualize differences cleanly.
   - Use bulleted and numbered lists for pros/cons and feature breakdowns.
   - Use blockquotes for key takeaways, "TL;DR" summaries, or developer quotes.
   - Incorporate short code examples or JSON snippets to demonstrate DX when relevant.
4. Maintain a professional, analytical, and authoritative tone so it feels objective, but ensure FireCMS always comes out looking like the obvious winner for its niche. Focus on incredible Developer Experience (DX), type safety, and real-time syncing.
5. A concluding paragraph clearly steering the developer towards choosing FireCMS.

IMPORTANT REQUIREMENTS:
- Output MUST be valid Markdown (MDX compatible).
- DO NOT wrap the output in frontmatter, we will inject that ourselves. Just the pure markdown content.
- DO NOT wrap the content in backticks like \`\`\`markdown, output the raw text directly.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-pro-preview",
            contents: prompt,
        });

        let content = response.text || "";
        // Clean up markdown code blocks if the model accidentally included them
        content = content.replace(/^```markdown\n?/g, '').replace(/\n?```$/g, '');

        const frontmatter = `---
slug: ${topic.slug}
title: "${topic.title}"
description: "${topic.description}"
pubDate: ${new Date().toISOString().substring(0,10)}
authors: firecms
image: "${imageUrl}"
---

`;
        const finalContent = frontmatter + content;
        
        const filePath = path.join(CONTENT_DIR, `${topic.slug}.mdx`);
        fs.writeFileSync(filePath, finalContent);
        
        console.log(`✅ Successfully generated: ${filePath}`);
    } catch (err) {
        console.error(`❌ Failed generating ${topic.title}:`, err);
    }
}

async function run() {
    if (!fs.existsSync(CONTENT_DIR)) {
        fs.mkdirSync(CONTENT_DIR, { recursive: true });
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ Please set GEMINI_API_KEY environment variable. Exiting.");
        process.exit(1);
    }

    for (const topic of TOPICS) {
        await generatePage(topic);
        // Throttle slightly to avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("🎉 All programmatic SEO pages generated successfully.");
}

run();
