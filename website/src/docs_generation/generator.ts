import OpenAI from "openai";
import * as fs from "fs";

export async function generateDocsFor(src: string, slug: string) {

    console.log("Generating docs")
    // read system_instructions.txt
    const systemInstructions = fs.readFileSync("./src/docs_generation/system_instructions.txt", "utf-8");

    const model = "gpt-4o";
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const stream = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: systemInstructions
            },
            {
                role: "user",
                content: `The component slug is: ${slug}\nAnd the source code is:\n\`\`\`\n${src}\`\`\``
            }
        ],
        temperature: 1,
        top_p: 1,
        n: 1,
        max_tokens: 4000,
        stream: true
    });

    let fullOutput = "";
    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
            process.stdout.write(delta);
            fullOutput += delta;
        }
    }
    console.log("");

    try {
        return fullOutput;
    } catch (e) {
        console.error("Error parsing OpenAI response", fullOutput);
        return null;
    }

}

