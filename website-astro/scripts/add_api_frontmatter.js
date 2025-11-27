import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiDocsDir = path.resolve(__dirname, "../src/content/docs/docs/api");

/**
 * Recursively process all markdown files in a directory
 */
function processDirectory(dir, basePath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath, relativePath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
            processMarkdownFile(fullPath, relativePath);
        }
    }
}

/**
 * Add frontmatter to a markdown file if it doesn't already have it
 */
function processMarkdownFile(filePath, relativePath) {
    let content = fs.readFileSync(filePath, "utf-8");

    // Check if file already has frontmatter
    const hasFrontmatter = content.startsWith("---");

    if (!hasFrontmatter) {
        // Generate slug and title from file path
        const slug = generateSlug(relativePath);
        const title = generateTitle(relativePath);

        // Create frontmatter
        const frontmatter = `---
slug: "${slug}"
title: "${title}"
---

`;

        // Add frontmatter to content
        content = frontmatter + content;
    }

    // Remove .md extensions from all markdown links
    // Match patterns like [text](path.md) or [text](../path.md) or [text](./path.md)
    content = content.replace(/(\[.*?\]\((?:\.\.\/)*(?:\.\/)*[^)]+)\.md(\))/g, '$1$2');

    // Fix GitHub links to remove commit hashes and line numbers
    // Pattern: https://github.com/FireCMSco/firecms/blob/{commit-hash}/packages/... -> https://github.com/firecmsco/firecms/blob/main/packages/...
    content = content.replace(/https:\/\/github\.com\/FireCMSco\/firecms\/blob\/[a-f0-9]+\//gi, 'https://github.com/firecmsco/firecms/blob/main/');

    // Remove line numbers from GitHub links (e.g., #L42 or :42)
    content = content.replace(/(https:\/\/github\.com\/[^)]+\.ts)(#L\d+|:\d+)/g, '$1');

    const updatedContent = content;

    // Write file with updated content
    fs.writeFileSync(filePath, updatedContent, "utf-8");

    if (!hasFrontmatter) {
        console.log(`✓ Added frontmatter and fixed links in ${relativePath}`);
    } else {
        console.log(`✓ Fixed links in ${relativePath}`);
    }
}

/**
 * Generate slug from file path
 */
function generateSlug(relativePath) {
    // Remove .md extension and convert to slug format
    let slug = relativePath.replace(/\.md$/, "");
    // Replace backslashes with forward slashes (Windows compatibility)
    slug = slug.replace(/\\/g, "/");
    // Add docs/api prefix
    return `docs/api/${slug}`;
}

/**
 * Generate title from file path
 */
function generateTitle(relativePath) {
    // Get filename without extension
    const filename = path.basename(relativePath, ".md");

    // Special case for README
    if (filename === "README") {
        return "@firecms/core API";
    }

    // Return the filename as title
    return filename;
}

console.log("🔧 Adding frontmatter to API documentation files...");

try {
    if (!fs.existsSync(apiDocsDir)) {
        console.error(`✗ API docs directory not found: ${apiDocsDir}`);
        process.exit(1);
    }

    processDirectory(apiDocsDir);
    console.log("✓ Successfully added frontmatter to all API documentation files!");
} catch (error) {
    console.error("✗ Error adding frontmatter:", error.message);
    process.exit(1);
}

