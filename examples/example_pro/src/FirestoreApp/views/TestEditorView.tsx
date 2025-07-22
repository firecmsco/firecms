import { Container } from "@firecms/ui";
import { FireCMSEditor, type JSONContent } from "@firecms/editor";
import { useEffect, useState } from "react";
import { CircularProgressCenter, useAuthController, useStorageSource } from "@firecms/core";
import { useEditorAIController } from "@firecms/data_enhancement";

export function TestEditorView() {

    const [initialContent, setInitialContent] = useState<string | JSONContent | null>(null);

    const storageSource = useStorageSource();
    const authController = useAuthController();

    useEffect(() => {
        const content = window.localStorage.getItem("editor-content");
        if (content) {
            // const parse = JSON.parse(content);
            setInitialContent(content);
        } else {
            setInitialContent(defaultEditorContent);
        }
    }, []);

    const editorAIController = useEditorAIController({ getAuthToken: authController.getAuthToken });

    return (
        <Container className={"md:p-8 bg-white dark:bg-surface-950 md:my-4"}>
            {!initialContent && <CircularProgressCenter/>}
            {initialContent && <FireCMSEditor
                content={initialContent}
                // onJsonContentChange={(content) => {
                // }}
                // onHtmlContentChange={(content) => {
                //     console.log(content);
                // }}
                // onJsonContentChange={(content) => {
                //     console.log("json content")
                //     console.log(content);
                //     // console.log(JSON.stringify(content));
                //     // window.localStorage.setItem("editor-content", JSON.stringify(content));
                // }}
                onMarkdownContentChange={(content) => {
                    // console.log("markdown content")
                    // console.log(content);
                    window.localStorage.setItem("editor-content", content);
                }}
                aiController={editorAIController}
                handleImageUpload={async (file: File) => {
                    const result = await storageSource.uploadFile({
                        file,
                        path: "editor_test"
                    });
                    const downloadConfig = await storageSource.getDownloadURL(result.path);
                    const url = downloadConfig.url;
                    if (!url) {
                        throw new Error("Error uploading image");
                    }
                    return url;
                }}/>}
        </Container>
    )
}

const defaultEditorContent = `
![](https://firebasestorage.googleapis.com/v0/b/firecms-demo-27150.appspot.com/o/firecms_logo_192.png?alt=media&token=aac5bda6-0e3e-4a43-822c-970ebb1bb08d)
# Introducing the FireCMS editor

> The [FireCMS editor](https://firecms.co/) is a Notion-style WYSIWYG editor built with [Tiptap](https://tiptap.dev/).

## Features

1. Slash menu (try hitting '/' in a new line)
2. Bubble menu (try selecting some code)
3. Image uploads (drag & drop / copy & paste)
4. Bullet and numbered lists
5. AI autocompletion
6. JSON, HTML or Markdown output

\`\`\`
code blocks
\`\`\`

> I like to look at one or two random quotes each morning.

## Learn more

This editor is in development and your **feedback** is very **valuable**. The content of this editor is only stored locally in this demo.

- [x] Star us on [GitHub](https://github.com/firecmsco/firecms)

- [x] Leave us your comments on [Discord](https://discord.gg/fxy7xsQm3m)`
