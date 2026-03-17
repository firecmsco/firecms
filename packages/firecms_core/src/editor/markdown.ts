import {
    MarkdownParser,
    MarkdownSerializer,
    defaultMarkdownParser,
    defaultMarkdownSerializer
} from "prosemirror-markdown";
import markdownIt from "markdown-it";
// @ts-ignore
import markdownItTaskLists from "markdown-it-task-lists";
// @ts-ignore
import markdownItMark from "markdown-it-mark";
// @ts-ignore
import markdownItIns from "markdown-it-ins";

import { schema } from "./schema";

const parserTokens: any = {
    ...defaultMarkdownParser.tokens,
    em: { mark: "italic" },
    strong: { mark: "bold" },
    html_inline: { ignore: true, noCloseToken: true },
    html_block: { ignore: true, noCloseToken: true },
    s: {
        mark: "strike",
    },
    task_list: {
        block: "task_list",
    },
    task_item: {
        block: "task_item",
        getAttrs: (tok: any) => ({ checked: tok.attrGet("checked") === "true" }),
    },
    mark: {
        mark: "highlight"
    },
    ins: {
        mark: "underline"
    }
};

const md = markdownIt({ html: false })
    .use(markdownItTaskLists)
    .use(markdownItMark)
    .use(markdownItIns);

// Unwrap images from paragraphs so they can be parsed as block nodes by ProseMirror
md.core.ruler.after("inline", "image-to-block", (state: any) => {
    const tokens = state.tokens;
    for (let i = tokens.length - 2; i >= 1; i--) {
        if (
            tokens[i - 1] && tokens[i - 1].type === "paragraph_open" &&
            tokens[i] && tokens[i].type === "inline" &&
            tokens[i + 1] && tokens[i + 1].type === "paragraph_close"
        ) {
            const inlineTokens = tokens[i].children || [];
            if (inlineTokens.length === 1 && inlineTokens[0].type === "image") {
                state.tokens.splice(i - 1, 3, inlineTokens[0]);
                // No need to adjust index when looping backward!
            }
        }
    }
});

export const markdownParser = new MarkdownParser(schema, md, parserTokens);


export const markdownSerializer = new MarkdownSerializer(
    {
        ...defaultMarkdownSerializer.nodes,
        // Add custom serialization for task lists
        task_list(state, node) {
            state.renderList(node, "  ", () => "- ");
        },
        task_item(state, node) {
            state.write(`[${node.attrs.checked ? "x" : " "}] `);
            state.renderContent(node);
        },
        horizontal_rule(state, node) {
            state.write(node.attrs.markup || "---");
            state.closeBlock(node);
        }
    },
    {
        ...defaultMarkdownSerializer.marks,
        bold: defaultMarkdownSerializer.marks.strong,
        italic: defaultMarkdownSerializer.marks.em,
        strike: { open: "~~", close: "~~", mixable: true, expelEnclosingWhitespace: true },
        highlight: { open: "==", close: "==", mixable: true, expelEnclosingWhitespace: true },
        underline: { open: "++", close: "++", mixable: true, expelEnclosingWhitespace: true },
    }
);
export const parser = markdownParser;
export const serializer = markdownSerializer;
