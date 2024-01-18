---
slug: openai_code_migration
title: Automated code migrations with OpenAI's GPT-4
image: /img/avatars/francesco_avatar.jpg
author_url: https://www.linkedin.com/in/fgatti675
author_image_url: https://avatars.githubusercontent.com/u/5120271?v=4
---

In the day-to-day world of development, activities such as refactoring and migrating code consume a significant amount
of time. Tasks such as restructuring code packages, renaming variables, altering function signatures, among others, are
often tedious and fraught with errors. These operations can be effectively automated with the assistance of artificial
intelligence. This article explains how to use OpenAI's GPT-4 to automatically refactor and migrate code.

At FireCMS, a prime motivation for adopting this approach is the migration of code from the JavaScript CSS library
`emotion` to the CSS framework `tailwindcss`. This article specifically covers how to automatically convert code from
`emotion` to `tailwindcss`, but the approach can be generalized to automate migration among any pair of libraries.

> `emotion` allows components to be styled using JavaScript and `tailwindcss` offers the use of CSS classes to style
> components. While `emotion` carries a runtime footprint, `tailwindcss` works on a build-time footprint. Consequently,
> switching from `emotion` to `tailwindcss` can substantially improve the performance of an application.

This article demonstrates the creation of a basic Node.js script to automate the above-mentioned process, thereby
extending the approach to handle any code migration scenario.

Note that you can apply the same approach to any other **code migration**.

## Identifying the Problem

- Emotion defines styles utilizing the `sx` prop, as shown in the code snippet below, which presents a button with a red
  background:

```tsx
import {Button} from "@mui/material";

const MyButton = () => {
    return <Button sx={{backgroundColor: "red"}}>Click me</Button>
}
```

- Contrarily, tailwindcss uses CSS classes to define styles, as shown in the following code snippet, which defines a
  similarly-styled button:

```tsx
import {Button} from "@mui/material";

const MyButton = () => {
    return <Button className="bg-red-500">Click me</Button>
}
```

The goal is to construct a script capable of automating the conversion of code from `emotion` to `tailwindcss` style
definitions.

## Automating Code Migration through AI

The Node.js script illustrated here traverses the source code's folder structure and replaces `emotion` styles with 
`tailwindcss` styles. This process involves identifying JSX ot TSX elements containing the `sx` prop and replacing them with
their corresponding `className` prop.

### Traversing the Code

Here's a simple function that recursively traverses the source code's folder structure, returning all file paths and
their contents:

```typescript
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
```

### Detecting Emotion Styles

To identify `sx` props within the file content, we use a regular expression as shown:

```typescript
const sxRegexp = /(sx=\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\})/g;
```

This regular expression matches the `sx` prop as well as its value and can identify the styles defined in `sx` as shown
in the earlier sections.

### Replacing Emotion Styles with Tailwindcss Styles

Now, let's employ a function to replace the `sx` prop with the `className` prop. GPT-4 from OpenAI will be utilised to
generate the `className` prop value in response to the following prompt:

```
You are a tool which only purpose is converting sx props from the emotion library to tailwind classes.
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
since your output will be injected into a tsx file.
```

We are instructing GPT-4 to generate the `className` prop value. We are also instructing GPT-4 to return exclusively
results in the form of `className="..."` or `style={{...}}` since our output will be injected into a tsx file.

Any other output from GPT-4 would result in invalid code.

We will use the OpenAI library to make the corresponding call:

```typescript
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

export const openai = new OpenAIApi(new Configuration({
    apiKey: "YOUR_API_KEY"
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
```

## Full script

Finally, having all the snippets together enables us to write the full script. Replace `FOLDER` with the path of the
source code you want to migrate, and remember to add your OpenAI API key.

You can run this script with `ts-node script.js`. If you prefer a dry-run mode, just set `dryRun` to `true`.

The complete script is attached below:

```typescript
import path from "path";
import * as fs from "fs/promises";

import { Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

const FOLDER = "../src";

export const openai = new OpenAIApi(new Configuration({
    apiKey: "YOUR_API_KEY"
}));

const dryRun = false;
const sxRegexp = /(sx=\{(?:[^{}]|\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})*\})/g;

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

let count = 0;

getRecursiveFileReads(FOLDER,
    async (filePath, content,) => {
        if (content.includes("sx={")) {
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
            console.log("Processed files", count);
        }
    });


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

const systemInstructions = `You are a tool which only purpose is converting sx props from the emotion library to tailwind classes.
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

```

## Conclusion

This process has been successfully applied to the FireCMS codebase, resulting in a significant reduction in the runtime
footprint of the application. It has helped us intensively in a very tedious task. Of course some manual work is still
required, but a good part of the work is done.

Of course, you can think of ways of improving this script. For example, you could tell OpenAI your `tailwind.config.js`
content, so it can generate the classes based on your configuration.

I hope you enjoyed this article and that it will help you in your next code migration!


