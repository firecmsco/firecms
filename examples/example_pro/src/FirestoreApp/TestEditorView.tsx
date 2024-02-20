import { Container } from "@firecms/ui";
import { FireCMSEditor, type JSONContent } from "@firecms/editor";
import { useEffect, useState } from "react";
import { CircularProgressCenter } from "@firecms/core";

export function TestEditorView() {

    const [initialContent, setInitialContent] = useState<string | JSONContent | null>(null);

    useEffect(() => {
        const content = window.localStorage.getItem("editor-content");
        if (content) {
            console.log("content", content)
            // const parse = JSON.parse(content);
            setInitialContent(content);
        } else {
            console.log("no content")
            setInitialContent(defaultEditorContent);
        }
    }, []);

    return (
        <Container>
            {!initialContent && <CircularProgressCenter/>}
            {initialContent && <FireCMSEditor
                initialContent={initialContent}
                onHtmlContentChange={(content) => {
                    console.log(content);
                }}
                onJsonContentChange={(content) => {
                    // console.log(JSON.stringify(content));
                    // window.localStorage.setItem("editor-content", JSON.stringify(content));
                }}
                onMarkdownContentChange={(content) => {
                    console.log(content);
                    window.localStorage.setItem("editor-content", content);
                }}
                handleImageUpload={(file: File) => {
                    return "https://picsum.photos/300"

                }}/>}
        </Container>
    )
}

const defaultEditorContent = `

![header.png](https://firecms.co/assets/images/pawel-czerwinski-C2tWWNKExfw-unsplash-219b6fe0f2e6d87490cb81b76f309789.jpg "header.png")

## Introducing the FireCMS editors

The [FireCMS editor](https://firecms.co/) is a Notion-style WYSIWYG editor built with [Tiptap](https://tiptap.dev/)

### Features

1. Slash menu & bubble menu
2. Image uploads (drag & drop / copy & paste, or select from slash menu) 

\`\`\`
code blocks
\`\`\`

![logo.png](https://firecms.co/img/firecms_logo.svg "logo.png")

### Learn more

- [ ] Star us on [GitH](https://github.com/steven-tey/novel)[ub](https://github.com/firecmsco/firecms)

- [ ] Leave us your comments on [Discord](https://discord.gg/fxy7xsQm3m) `

// export const defaultEditorContent = {
//     type: "doc",
//     content: [{
//         type: "heading",
//         attrs: { level: 2 },
//         content: [{ type: "text", text: "Introducing the FireCMS editor" }]
//     }, {
//         type: "paragraph",
//         content: [{ type: "text", text: "The " }, {
//             type: "text",
//             marks: [{
//                 type: "link",
//                 attrs: { href: "https://firecms.co/", target: "_blank", rel: "noopener noreferrer nofollow" }
//             }],
//             text: "FireCMS editor"
//         }, { type: "text", text: " is a Notion-style WYSIWYG editor built with " }, {
//             type: "text",
//             marks: [{
//                 type: "link",
//                 attrs: { href: "https://tiptap.dev/", target: "_blank", rel: "noopener noreferrer nofollow" }
//             }],
//             text: "Tiptap"
//         }]
//     }, {
//         type: "heading",
//         attrs: { level: 3 },
//         content: [{ type: "text", text: "Features" }]
//     }, {
//         type: "orderedList",
//         attrs: { tight: true, start: 1 },
//         content: [{
//             type: "listItem",
//             content: [{ type: "paragraph", content: [{ type: "text", text: "Slash menu & bubble menu" }] }]
//         }, {
//             type: "listItem",
//             content: [{
//                 type: "paragraph",
//                 content: [{
//                     type: "text",
//                     text: "Image uploads (drag & drop / copy & paste, or select from slash menu) "
//                 }]
//             }]
//         }]
//     }, {
//         type: "codeBlock",
//         attrs: { language: null },
//         content: [{ type: "text", text: "code blocks" }]
//     }, {
//         type: "image",
//         attrs: {
//             src: "https://public.blob.vercel-storage.com/pJrjXbdONOnAeZAZ/banner-2wQk82qTwyVgvlhTW21GIkWgqPGD2C.png",
//             alt: "banner.png",
//             title: "banner.png"
//         }
//     }, { type: "horizontalRule" }, {
//         type: "heading",
//         attrs: { level: 3 },
//         content: [{ type: "text", text: "Learn more" }]
//     }, {
//         type: "taskList",
//         content: [{
//             type: "taskItem",
//             attrs: { checked: false },
//             content: [{
//                 type: "paragraph",
//                 content: [{ type: "text", text: "Star us on " }, {
//                     type: "text",
//                     marks: [{
//                         type: "link",
//                         attrs: {
//                             href: "https://github.com/steven-tey/novel",
//                             target: "_blank",
//                             rel: "noopener noreferrer nofollow"
//                         }
//                     }],
//                     text: "GitH"
//                 }, {
//                     type: "text",
//                     marks: [{
//                         type: "link",
//                         attrs: {
//                             href: "https://github.com/firecmsco/firecms",
//                             target: "_blank",
//                             rel: "noopener noreferrer nofollow"
//                         }
//                     }],
//                     text: "ub"
//                 }]
//             }]
//         }, {
//             type: "taskItem",
//             attrs: { checked: false },
//             content: [{
//                 type: "paragraph",
//                 content: [{ type: "text", text: "Leave us your comments on " }, {
//                     type: "text",
//                     marks: [{
//                         type: "link",
//                         attrs: {
//                             href: "https://discord.gg/fxy7xsQm3m",
//                             target: "_blank",
//                             rel: "noopener noreferrer nofollow"
//                         }
//                     }],
//                     text: "Discord"
//                 }, { type: "text", text: " " }]
//             }]
//         }]
//     }]
// };
