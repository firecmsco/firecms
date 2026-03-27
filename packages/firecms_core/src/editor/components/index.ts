export { EditorBubble } from "./editor-bubble";
export { EditorBubbleItem } from "./editor-bubble-item";
export { SlashCommandMenu } from "./SlashCommandMenu";
export { ImageBubble } from "./image-bubble";

export type JSONContent = {
    type?: string;
    attrs?: Record<string, any>;
    content?: JSONContent[];
    marks?: { type: string; attrs?: Record<string, any> }[];
    text?: string;
    [key: string]: any;
};
