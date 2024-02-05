import { Editor } from "novel";

export function TestEditorView() {
    return (
        <Editor className={"bg-initial"}
                onDebouncedUpdate={(value) => console.log(value)}
        />
    )
}
