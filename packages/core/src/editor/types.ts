import { JSONContent } from "./components";
export type { JSONContent };

export type EditorAIController = {
    autocomplete: (textBefore: string, textAfter: string, onUpdate: (delta: string) => void) => Promise<string>;
}
