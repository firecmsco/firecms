import path from "path";
import * as fs from "fs/promises";
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";
import util from "util";

const getRecursiveFileReads = async (dir: string, onFileRead: (filePath: string, content: string) => void) => {
    // @ts-ignore
    const files = await fs.readdir(dir);
    // @ts-ignore
    files.forEach(async (file: string) => {
        const filePath = path.join(dir, file);
        // @ts-ignore
        const stat = await fs.stat(filePath);
        // @ts-ignore
        if (stat.isDirectory()) {
            getRecursiveFileReads(filePath, onFileRead);
            return;
        }
        // @ts-ignore
        const content = await fs.readFile(filePath, { encoding: "utf8" });
        // @ts-ignore
        onFileRead(filePath, content);
    });
}

const sxRegexp = /(sx=\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\})/g;

let dryRun = false;
let count = 0;
getRecursiveFileReads("../lib",
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
    backgroundColor: 'tomato',
  }}

converts to:

className="flex items-center justify-center w-full h-screen bg-tomato"`;

// getOpenAiReplacement(`sx={{
//             display: "flex",
//             gap: "2px",
//             flexDirection: "column",
//         }}
// `);
