import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.resolve(__dirname, "../../CHANGELOG.md");
const destFile = path.resolve(__dirname, "../src/content/docs/docs/CHANGELOG.md");

const frontmatter = `---
slug: docs/changelog
title: Changelog
---
`;

try {
    // Check if source file exists
    if (!fs.existsSync(sourceFile)) {
        console.error(`Source file not found: ${sourceFile}`);
        process.exit(1);
    }

    // Read the source file
    const content = fs.readFileSync(sourceFile, "utf-8");

    // Add frontmatter to the content
    const contentWithFrontmatter = frontmatter + content;

    // Write to destination
    fs.writeFileSync(destFile, contentWithFrontmatter, "utf-8");

    console.log(`✓ Successfully copied CHANGELOG.md to docs with frontmatter`);
} catch (error) {
    console.error(`Error copying CHANGELOG.md:`, error.message);
    process.exit(1);
}

