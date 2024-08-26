import { Container } from "@firecms/ui";
import { FireCMSEditor, type JSONContent } from "@firecms/editor";
import { useEffect, useState } from "react";
import { CircularProgressCenter, useAuthController, useStorageSource } from "@firecms/core";
import { useEditorAIController } from "@firecms/data_enhancement";

export function TestEditorView() {

    const [initialContent, setInitialContent] = useState<string | JSONContent | null>(null);
    console.log("initialContent", initialContent);

    const storageSource = useStorageSource();
    const authController = useAuthController();

    const [firebaseToken, setFirebaseToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (authController.user) {
            authController.getAuthToken().then(setFirebaseToken);
        }
    }, []);

    useEffect(() => {
        const content = window.localStorage.getItem("editor-content");
        if (content) {
            // const parse = JSON.parse(content);
            setInitialContent(content);
        } else {
            setInitialContent(defaultEditorContent);
        }
    }, []);

    const editorAIController = useEditorAIController({ firebaseToken });

    return (
        <Container className={"md:p-8 bg-white dark:bg-gray-950 md:my-4"}>
            {!initialContent && <CircularProgressCenter/>}
            {initialContent && <FireCMSEditor
                content={initialContent}
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
                    // window.localStorage.setItem("editor-content", content);
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

const defaultEditorContent = `![](https://firebasestorage.googleapis.com/v0/b/firecms-demo-27150.appspot.com/o/editor_test%2Fimage.png?alt=media&token=c5cae8f7-e13d-4b95-aee2-55962b5fbc57)
# Introducing the FireCMS editor

> The [FireCMS editor](https://firecms.co/) is a Notion-style WYSIWYG editor built with [Tiptap](https://tiptap.dev/).
>
> It is currently under development, but stable enough to try out 

## Features

1. Slash menu (try hitting '/' in a new line)
2. Bubble menu (try selecting some code)
3. Image uploads (drag & drop / copy & paste)
4. Bullet and numbered lists
5. AI autocompletion (WIP)
6. JSON, HTML or Markdown output

\`\`\`
code blocks
\`\`\`

> I like to look at one or two random quotes each morning.

![](https://firebasestorage.googleapis.com/v0/b/firecms-demo-27150.appspot.com/o/editor_test%2Flogo_192.png?alt=media&token=8e1f2d8f-2fd3-406c-942d-3b9a848e2cff)
## Learn more

This editor is in development and your **feedback** is very **valuable**. The content of this editor is only stored locally in this demo.

- [x] Star us on [GitH](https://github.com/steven-tey/novel)[ub](https://github.com/firecmsco/firecms)

- [x] Leave us your comments on [Discord](https://discord.gg/fxy7xsQm3m)`
