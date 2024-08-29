export type { JSONContent } from "@tiptap/react";

export type EditorAIController = {
    autocomplete: (textBefore: string, textAfter: string, onUpdate: (delta: string) => void) => Promise<string>;
}
