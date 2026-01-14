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
 * Resolves a file path that's used in imports or references.
 * @param {string} basePath - The base directory path.
 * @param {string} relativePath - The relative path from the base.
 * @returns {string} - The resolved file path.
 */
function resolveFilePath(basePath, relativePath) {
    // Handle paths that start with / (absolute from project root)
    if (relativePath.startsWith("/")) {
        return findFileWithExtension(path.resolve("."), relativePath.slice(1));
    }
    // Handle relative paths
    return findFileWithExtension(basePath, relativePath);
}

/**
 * Processes the MDX file by resolving Code and CodeSampleWithSource components,
 * removing import statements, and stripping out interactive samples from the output.
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

    // Regex to match ALL import statements
    const importPattern = /^import\s+[\s\S]+?\s+from\s+['"](.*?)['"];?$/gm;

    // Object to map imported variables to their file contents
    const importContents = {};

    // Process import statements that use ?raw suffix (Vite's raw import)
    let importMatch;
    while ((importMatch = importPattern.exec(content)) !== null) {
        const importStatement = importMatch[0];
        const importPath = importMatch[1];
        const isRawImport = importPath.endsWith("?raw");

        if (isRawImport) {
            // Remove the ?raw suffix to get the relative file path
            const relativeFilePathBase = importPath.replace(/\?raw$/, "");

            try {
                const resolvedPath = resolveFilePath(mdxBasePath, relativeFilePathBase);
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

    // Remove all import statements from the content
    let contentWithoutImports = content.replace(importPattern, "");

    // Replace <Code code={variableName} lang="..." /> with fenced code blocks
    const codeComponentPattern = /<Code\s+code=\{([a-zA-Z0-9_]+)\}(?:\s+lang=["']([^"']+)["'])?\s*\/>/g;
    contentWithoutImports = contentWithoutImports.replace(codeComponentPattern, (match, varName, lang = "tsx") => {
        if (importContents[varName]) {
            // Escape backticks in the code to prevent breaking the fenced code block
            const escapedCode = importContents[varName].replace(/```/g, "\\`\\`\\`");
            return `\`\`\`${lang}\n${escapedCode}\n\`\`\``;
        } else {
            console.warn(`No content found for variable "${varName}". Leaving <Code> as is.`);
            return match;
        }
    });

    // Handle <CodeSampleWithSource path="..." /> by reading the source file directly
    const codeSamplePattern = /<CodeSampleWithSource\s+path=["']([^"']+)["'](?:\s+lang=["']([^"']+)["'])?\s*\/>/g;
    contentWithoutImports = contentWithoutImports.replace(codeSamplePattern, (match, componentPath, lang = "tsx") => {
        try {
            // CodeSampleWithSource uses paths like "/src/content/docs/samples/..."
            const resolvedPath = resolveFilePath(mdxBasePath, componentPath);
            const fileContent = fs.readFileSync(resolvedPath, "utf-8");
            const escapedCode = fileContent.replace(/```/g, "\\`\\`\\`");
            return `\`\`\`${lang}\n${escapedCode}\n\`\`\``;
        } catch (error) {
            console.error(`Error processing CodeSampleWithSource with path "${componentPath}":`, error.message);
            return match;
        }
    });

    // Remove multiple new lines for cleaner output
    const finalResolvedContent = contentWithoutImports.replace(/\n{3,}/g, "\n\n");
    return finalResolvedContent;
}

/**
 * Extracts all document slugs from the sidebar in astro.config.mjs in order.
 * @param {string} configFilePath - The path to the astro.config.mjs file.
 * @returns {Promise<string[]>} - An array of document slugs in the order they appear in the sidebar.
 */
async function extractSidebarIds(configFilePath) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const absolutePath = path.resolve(__dirname, configFilePath);

    // Read the config file as text instead of importing it
    const configContent = fs.readFileSync(absolutePath, 'utf-8');

    // Extract the sidebar array from the config content
    // Find the sidebar configuration using regex
    const sidebarMatch = configContent.match(/sidebar:\s*\[([\s\S]*?)\],?\s*components:/);

    if (!sidebarMatch) {
        throw new Error("Could not find sidebar configuration in astro.config.mjs");
    }

    const sidebarContent = sidebarMatch[1];
    const slugs = [];

    // Extract all slug values using regex
    const slugPattern = /slug:\s*["']([^"']+)["']/g;
    let match;
    while ((match = slugPattern.exec(sidebarContent)) !== null) {
        slugs.push(match[1]);
    }

    return slugs;
}

/**
 * Recursively processes directories to build a map of slug to file path and title.
 * @param {string} directoryPath - The directory to process.
 * @param {Object} slugMap - The map to populate with slug to file path and title.
 */
async function buildSlugMap(directoryPath, slugMap) {
    try {
        const entries = await fs.promises.readdir(directoryPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                await buildSlugMap(fullPath, slugMap);
            } else {
                const ext = path.extname(entry.name).toLowerCase();
                if (ext === ".mdx" || ext === ".md") {
                    const mdxContent = fs.readFileSync(fullPath, "utf-8");
                    const parsed = matter(mdxContent);
                    const frontmatter = parsed.data;
                    if (frontmatter && frontmatter.slug) {
                        slugMap[frontmatter.slug] = {
                            path: fullPath,
                            title: frontmatter.title || frontmatter.slug
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
    const rootDirectory = "./src/content/docs/docs";       // Root directory to start processing
    const configFilePath = "../astro.config.mjs"; // Path to astro.config.mjs
    const outputFilePath = "./public/llms.txt";    // Single output file

    try {
        // Extract sidebar slugs from astro config
        const sidebarSlugs = await extractSidebarIds(configFilePath);
        console.log(`Found ${sidebarSlugs.length} pages in sidebar`);

        // Build a map of slug to file path and title
        const slugMap = {};
        await buildSlugMap(rootDirectory, slugMap);
        console.log(`Processing ${Object.keys(slugMap).length} documentation files...`);

        // Clear the output file if it already exists
        if (fs.existsSync(outputFilePath)) {
            fs.unlinkSync(outputFilePath);
        }

        let result = "";
        let processedCount = 0;
        // Iterate over sidebar slugs and append content in order
        for (const slug of sidebarSlugs) {
            const entry = slugMap[slug];
            if (entry) {
                const {
                    path: mdxFilePath,
                    title
                } = entry;
                try {
                    const resolvedMdx = await resolveCodeBlocks(mdxFilePath);
                    // Prepend the title in H1 format
                    const contentToAppend = `# ${title}\n${resolvedMdx}\n`;
                    // Append the resolved content to the output file
                    result += contentToAppend;
                    processedCount++;
                } catch (error) {
                    console.error(`Error resolving MDX code blocks in ${mdxFilePath}:`, error.message);
                }
            } else {
                console.warn(`No file found for document slug "${slug}"`);
            }
        }

        result = result.replaceAll("# ", "## "); // Convert H1 to H2 and so on
        result = intro + result; // Add the intro to the beginning
        result = result.replaceAll("](./", "](https://firecms.co/docs/"); // Replace relative links with absolute links
        result = result.replaceAll("](../", "](https://firecms.co/docs/"); // Replace relative links with absolute links

        await fs.promises.appendFile(outputFilePath, result, "utf-8");

        console.log(`✓ Successfully generated ${outputFilePath} with ${processedCount} pages`);
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
