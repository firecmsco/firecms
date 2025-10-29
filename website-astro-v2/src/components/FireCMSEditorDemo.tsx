import { FireCMSEditor } from "@firecms/editor";

export function FireCMSEditorDemo() {

    return (
        <div className={"md:p-8 bg-white dark:bg-surface-950"}>
            {defaultEditorContent && <FireCMSEditor
                content={defaultEditorContent}
                handleImageUpload={async (file: File) => {
                    alert("Image upload is not implemented in this demo.");
                    return URL.createObjectURL(file);
                }}/>}
        </div>
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

- [ ] Star us on [GitHub](https://github.com/firecmsco/firecms)

- [ ] Leave us your comments on [Discord](https://discord.gg/fxy7xsQm3m)`

