import path from "path";
import * as fs from "fs/promises";
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

const getRecursiveFileReads = async (dir: string, onFileRead: (filePath: string, content: string) => void) => {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            getRecursiveFileReads(filePath, onFileRead);
            continue;
        }
        const content = await fs.readFile(filePath, { encoding: "utf8" });
        onFileRead(filePath, content);
    }
}

const sxRegexp = /(sx=\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\})/g;

let dryRun = false;
let count = 0;
getRecursiveFileReads("../collection_editor/src",
    async (filePath, content,) => {

        console.log(filePath);
        if (content.includes("sx={")) {
            console.log(filePath);
            // console.log(content);

            let newContent = content;
            let match;
            while ((match = sxRegexp.exec(content)) !== null) {
                const sxData = match[1];
                console.log(sxData);
                if (!dryRun) {
                    const replacement = await getOpenAiReplacement(sxData);
                    if (replacement) {
                        console.log(replacement);
                        newContent = newContent.replace(sxData, replacement);
                    }
                }
            }
            fs.writeFile(filePath, newContent);
            count++;
            console.log("count", count);
        }
    });

export const openai = new OpenAIApi(new Configuration({
    apiKey: "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"
}));

async function getOpenAiReplacement(input: string) {
    const completionParams: CreateChatCompletionRequest = {
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: systemInstructions
            },
            {
                role: "user",
                content: input
            }
        ],
        temperature: 0.7,
        top_p: 1,
    };

    const completion = await openai.createChatCompletion(completionParams);
    return completion.data.choices[0].message?.content;
}

const systemInstructions = `You are a tool which only purpose is converting sx props from the mui library to tailwind classes.
If there is no obvious translation, use classes and styles. E.g:

sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100vh',
    backgroundColor: 'red',
  }}

converts to:

className="flex items-center justify-center w-full h-screen bg-red-500"

Return exclusively results in the form of 'className="..."' or 'style={{...}}'
since your output will be injected into a tsx file.`

// getOpenAiReplacement(`sx={{
//             display: "flex",
//             gap: "2px",
//             flexDirection: "column",
//         }}
// `);
