import { JSONContent } from "./components/index.js";
export type { JSONContent };

export type EditorAIController = {
    autocomplete: (textBefore: string, textAfter: string, onUpdate: (delta: string) => void) => Promise<string>;
}
