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
    },
    table: { block: "table" },
    thead: { ignore: true },
    tbody: { ignore: true },
    tr: { block: "table_row" },
    th: { block: "table_header" },
    td: { block: "table_cell" }
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

// Wrap inline tokens inside table cells into paragraphs to satisfy ProseMirror table cell schema (block+)
md.core.ruler.after("inline", "tables-wrap-paragraphs", (state: any) => {
    const tokens = state.tokens;
    for (let i = tokens.length - 1; i >= 0; i--) {
        if (tokens[i].type === "td_open" || tokens[i].type === "th_open") {
            let closeIndex = i + 1;
            while (closeIndex < tokens.length && tokens[closeIndex].type !== "td_close" && tokens[closeIndex].type !== "th_close") {
                closeIndex++;
            }
            if (closeIndex < tokens.length) {
                const pOpen = new state.Token("paragraph_open", "p", 1);
                pOpen.block = true;
                const pClose = new state.Token("paragraph_close", "p", -1);
                pClose.block = true;
                
                state.tokens.splice(closeIndex, 0, pClose);
                state.tokens.splice(i + 1, 0, pOpen);
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
        },
        image(state, node) {
            const rawSrc = node.attrs.src || "";
            const src = rawSrc.replace(/ /g, "%20");
            state.write("![" + state.esc(node.attrs.alt || "") + "](" + src.replace(/[\(\)]/g, "\\$&") +
                (node.attrs.title ? ' "' + node.attrs.title.replace(/"/g, '\\"') + '"' : "") + ")");
            state.closeBlock(node);
        },
        table(state, node) {
            node.forEach((row, _, i) => {
                row.forEach((cell, _, j) => {
                    state.write(j === 0 ? "| " : " ");
                    cell.forEach((block) => {
                        state.renderInline(block);
                    });
                    state.write(" |");
                });
                state.write("\n");
                if (i === 0) {
                    row.forEach((cell, _, j) => {
                        state.write(j === 0 ? "|---|" : "---|");
                    });
                    state.write("\n");
                }
            });
            state.closeBlock(node);
        },
        table_row() {},
        table_cell() {},
        table_header() {}
    },
    {
        ...defaultMarkdownSerializer.marks,
        bold: defaultMarkdownSerializer.marks.strong,
        italic: defaultMarkdownSerializer.marks.em,
        strike: { open: "~~", close: "~~", mixable: true, expelEnclosingWhitespace: true },
        highlight: { open: "==", close: "==", mixable: true, expelEnclosingWhitespace: true },
        underline: { open: "++", close: "++", mixable: true, expelEnclosingWhitespace: true },
        link: {
            ...defaultMarkdownSerializer.marks.link,
            close(state: any, mark, parent, index) {
                const inAutolink = state.inAutolink;
                state.inAutolink = undefined;
                const href = mark.attrs.href.replace(/ /g, "%20");
                return inAutolink ? ">"
                    : "](" + href.replace(/[\(\)"]/g, "\\$&") + (mark.attrs.title ? ` "${mark.attrs.title.replace(/"/g, '\\"')}"` : "") + ")";
            }
        },
        // textStyle (colored text from HTML) has no markdown equivalent — emit content as-is
        textStyle: { open: "", close: "", mixable: true, expelEnclosingWhitespace: true },
    }
);
export const parser = markdownParser;
export const serializer = markdownSerializer;
