import * as fs from "fs";
import { generateDocsFor } from "./generator";
import { OnFileParsed, parseChatGPTOutput } from "./parser";

export async function generateDocsForFile(filePath: string) {
    // read file in filePath
    const src = fs.readFileSync(filePath, "utf-8");
    const fileWithoutExtension = filePath.split("/").pop()?.split(".")[0];
    if (!fileWithoutExtension) {
        console.error("Error extracting file name");
        return;
    }
    const slug = camelToSlug(fileWithoutExtension);
    console.log("fileWithoutExtension", fileWithoutExtension);
    console.log("Slug", slug);

    console.log("Generating docs for", filePath);
    const output = await generateDocsFor(src, slug);
    if (!output) {
        console.error("Error generating docs");
        return;
    }
    console.log(output);
    // Define your callback function that processes each extracted filename and content.
    const processFile: OnFileParsed = (filename, content) => {
        console.log(`Processing ${filename}`);
        const extension = filename.split(".").pop();
        if (extension === "mdx") {
            console.log("Saving mdx content to", `./docs/components/${filename}`);
            fs.writeFileSync(`./docs/components/${filename}`, content);
        } else if (extension === "tsx") {
            console.log("Saving tsx content to", `./samples/components/${slug}/${filename}`);
            try {
                fs.mkdirSync(`./samples/components/${slug}`);
            } catch (e) {
            }
            fs.writeFileSync(`./samples/components/${slug}/${filename}`, content);
        }
    };

// Invoke the parser with the output and your processing callback.
    parseChatGPTOutput(output, processFile);
}

function camelToSlug(input: string): string {
    // Step 1 & 2: Replace uppercase letters with underscore and lowercase version
    const slug = input.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    // Step 3: Remove leading underscore if exists
    return slug.charAt(0) === "_" ? slug.slice(1) : slug;
}

generateDocsForFile("../packages/ui/src/components/TextField.tsx")
