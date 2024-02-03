import { Container } from "@firecms/ui";

import { useEditor, EditorContent } from '@tiptap/react'

export function TestEditorView() {

    const editor = useEditor()

    return <Container>
        <EditorContent editor={editor} />
    </Container>;
}

