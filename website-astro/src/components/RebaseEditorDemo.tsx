import { RebaseEditor } from "@rebasepro/editor";

export function RebaseEditorDemo() {

    return (
        <div className={"md:p-8 bg-white dark:bg-surface-950"}>
            {defaultEditorContent && <RebaseEditor
                content={defaultEditorContent}
                handleImageUpload={async (file: File) => {
                    alert("Image upload is not implemented in this demo.");
                    return URL.createObjectURL(file);
                }} />}
        </div>
    )
}

const defaultEditorContent = `
![](/img/rebase_logo_192.png)
# Edit me!

> The [Rebase editor](https://rebase.pro/) is a Notion-style WYSIWYG editor built with [Tiptap](https://tiptap.dev/).

## Features

1. Slash menu (try hitting '/' in a new line)
2. Bubble menu (try selecting some code)
3. Image uploads (drag & drop / copy & paste)
4. Bullet and numbered lists
5. AI autocompletion
6. JSON, HTML or Markdown output

- [ ] Star us on [GitHub](https://github.com/rebaseco/rebase)

- [ ] Leave us your comments on [Discord](https://discord.gg/fxy7xsQm3m)`

