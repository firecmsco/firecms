export { EditorBubble } from "./editor-bubble.js";
export { EditorBubbleItem } from "./editor-bubble-item.js";
export { SlashCommandMenu } from "./SlashCommandMenu.js";
export { ImageBubble } from "./image-bubble.js";
export { TableBubble } from "./table-bubble.js";

export type JSONContent = {
    type?: string;
    attrs?: Record<string, any>;
    content?: JSONContent[];
    marks?: { type: string; attrs?: Record<string, any> }[];
    text?: string;
    [key: string]: any;
};
