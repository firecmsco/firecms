import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

/**
 * Attempts to locate a file by trying multiple possible extensions.
 * @param {string} basePath - The base directory path.
 * @param {string} relativePathBase - The relative path without extension.
 * @returns {string} - The resolved file path with extension.
 * @throws Will throw an error if no matching file is found.
 */
function findFileWithExtension(basePath, relativePathBase) {
    const possibleExtensions = [".tsx", ".jsx", ".js", ".ts", ".mdx", ".md", ".txt", ""];

    for (const extension of possibleExtensions) {
        const fullPath = path.join(basePath, relativePathBase + extension);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            return fullPath;
        }
    }
    throw new Error(`File not found for base: ${relativePathBase}`);
}

/**
 * Processes the MDX file by resolving CodeBlock components, removing import statements,
 * and additionally stripping out CodeSample blocks (and their imports) from the output.
 * @param {string} mdxFilePath - The file path to the MDX file.
 * @returns {string} - The transformed MDX content.
 */
async function resolveCodeBlocks(mdxFilePath) {
    const mdxContent = fs.readFileSync(mdxFilePath, "utf-8");
    const mdxBasePath = path.dirname(mdxFilePath);

    // Parse frontmatter
    const parsed = matter(mdxContent);
    const frontmatter = parsed.data;
    const content = parsed.content;

    // Regex to match ALL import statements – this already removes the CodeSample (and all other) import commands.
    const importPattern = /^import\s+[\s\S]+?\s+from\s+['"](.*?)['"];?$/gm;

    // Regex to locate CodeBlock instances with language "tsx"
    const codeBlockPattern = /<CodeBlock\s+language=["']tsx["']\s*>\s*\{([a-zA-Z0-9_]+)\}\s*<\/CodeBlock>/g;

    // Object to map imported variables to their file contents (for raw-loader imports)
    const importContents = {};

    // Process import statements that use raw-loader
    let importMatch;
    while ((importMatch = importPattern.exec(content)) !== null) {
        const importStatement = importMatch[0];
        const importPath = importMatch[1];
        const isRawLoader = importPath.startsWith("!!raw-loader!");

        if (isRawLoader) {
            // Remove the raw-loader portion to get the relative file path
            const relativeFilePathBase = importPath.replace(/^!!raw-loader!/, "");

            try {
                const resolvedPath = findFileWithExtension(mdxBasePath, relativeFilePathBase);
                const fileContent = fs.readFileSync(resolvedPath, "utf-8");

                // Extract the variable name from the import statement
                const varNameMatch = importStatement.match(/import\s+([a-zA-Z0-9_]+)\s+from/);
                if (varNameMatch && varNameMatch[1]) {
                    const varName = varNameMatch[1];
                    importContents[varName] = fileContent;
                } else {
                    console.warn(`Could not extract variable name from import: "${importStatement}"`);
                }
            } catch (error) {
                console.error(`Error processing import "${importStatement}":`, error.message);
            }
        }
    }

    // Remove all import statements from the content. This will clear out CodeSample imports as well.
    const contentWithoutImports = content.replace(importPattern, "");

    // Replace <CodeBlock> components with fenced code blocks using the raw-loader content.
    const resolvedContent = contentWithoutImports.replace(codeBlockPattern, (match, varName) => {
        if (importContents[varName]) {
            // Escape backticks in the code to prevent breaking the fenced code block
            const escapedCode = importContents[varName].replace(/```/g, "\\`\\`\\`");
            return `\`\`\`tsx\n${escapedCode}\n\`\`\``;
        } else {
            console.warn(`No content found for variable "${varName}". Leaving <CodeBlock> as is.`);
            return match; // Retain original <CodeBlock> if content is missing
        }
    });

    // --- New code to remove CodeSample blocks ---
    // This regex matches any <CodeSample ...> ... </CodeSample> including possible attributes and newline characters.
    const codeSamplePattern = /<CodeSample\b[^>]*>[\s\S]*?<\/CodeSample>/g;
    const contentWithoutCodeSamples = resolvedContent.replace(codeSamplePattern, "");

    // Remove multiple new lines for cleaner output
    const finalResolvedContent = contentWithoutCodeSamples.replace(/\n{3,}/g, "\n\n");
    return finalResolvedContent;
}

/**
 * Extracts all document IDs from the docsSidebar in sidebar.js in order.
 * @param {string} sidebarFilePath - The path to the sidebar.js file.
 * @returns {Promise<string[]>} - An array of document IDs in the order they appear in the sidebar.
 */
async function extractSidebarIds(sidebarFilePath) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const absolutePath = path.resolve(__dirname, sidebarFilePath);

    const sidebarModule = await import(absolutePath);
    const sidebar = sidebarModule.docsSidebar || sidebarModule.default.docsSidebar;
    const ids = [];

    function traverse(items) {
        for (const item of items) {
            if (typeof item === "string") {
                ids.push(item);
            } else if (typeof item === "object") {
                if (item.type === "doc" && item.id) {
                    ids.push(item.id);
                }
                if (item.items && Array.isArray(item.items)) {
                    traverse(item.items);
                }
            }
        }
    }

    traverse(sidebar);
    return ids;
}

/**
 * Recursively processes directories to build a map of id to file path and title.
 * @param {string} directoryPath - The directory to process.
 * @param {Object} idMap - The map to populate with id to file path and title.
 */
async function buildIdMap(directoryPath, idMap) {
    try {
        const entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                await buildIdMap(fullPath, idMap);
            } else {
                const ext = path.extname(entry.name).toLowerCase();
                if ((ext === ".mdx" || ext === ".md") && entry.name !== "CHANGELOG.md") {
                    const mdxContent = fs.readFileSync(fullPath, "utf-8");
                    const parsed = matter(mdxContent);
                    const frontmatter = parsed.data;
                    if (frontmatter && frontmatter.id) {
                        const resolved = directoryPath + "/" + frontmatter.id;
                        // string after docs/
                        const resolvedPath = resolved.split("docs/")[1].replace(/\.mdx?$/, "");
                        idMap[resolvedPath] = {
                            path: fullPath,
                            title: frontmatter.title || frontmatter.id
                        };
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${directoryPath}:`, error.message);
    }
}

// Entry point of the script
(async () => {
    const rootDirectory = "./docs";       // Root directory to start processing
    const sidebarFilePath = "../sidebars.js"; // Path to sidebar.js
    const outputFilePath = "./static/llms.txt";    // Single output file

    try {
        // Extract sidebar IDs
        const sidebarIds = await extractSidebarIds(sidebarFilePath);

        // Build a map of id to file path and title
        const idMap = {};
        await buildIdMap(rootDirectory, idMap);

        // Clear the output file if it already exists
        if (fs.existsSync(outputFilePath)) {
            fs.unlinkSync(outputFilePath);
        }

        let result = "";
        // Iterate over sidebar IDs and append content in order
        for (const id of sidebarIds) {
            const entry = idMap[id];
            if (entry) {
                const {
                    path: mdxFilePath,
                    title
                } = entry;
                console.log(`Processing file: ${mdxFilePath}`);
                try {
                    const resolvedMdx = await resolveCodeBlocks(mdxFilePath);
                    // Prepend the title in H1 format
                    const contentToAppend = `# ${title}\n${resolvedMdx}\n`;
                    // Append the resolved content to the output file
                    result += contentToAppend;

                    console.log(`Appended resolved MDX content from ${mdxFilePath} to ${outputFilePath}`);
                } catch (error) {
                    console.error(`Error resolving MDX code blocks in ${mdxFilePath}:`, error.message);
                }
            } else {
                console.warn(`No file found for document ID "${id}"`);
            }
        }

        result = result.replaceAll("# ", "## "); // Convert H1 to H2 and so on
        result = intro + result; // Add the intro to the beginning
        result = result.replaceAll("](./", "](https://firecms.co/docs/"); // Replace relative links with absolute links
        result = result.replaceAll("](../", "](https://firecms.co/docs/"); // Replace relative links with absolute links

        await fs.promises.appendFile(outputFilePath, result, "utf-8");

        console.log("All MDX files have been processed and appended to llms.txt successfully.");
    } catch (error) {
        console.error("An unexpected error occurred during processing:", error.message);
    }
})();

const intro = `# FireCMS Documentation

> This is the documentation for FireCMS, a headless CMS for Firebase/MongoDB. It is a powerful tool to manage your data,
> with a focus on developer experience and extensibility.
> Easy to get started, easy to customize and easy to extend.FireCMS is great both for existing projects, since it will 
> adapt to any database structure you have, as well as for new ones.

`;
