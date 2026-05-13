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

// Override the escape rule so that `\` before a newline is kept as literal
// text instead of being silently consumed as a hardbreak. The default
// markdown-it behaviour strips the backslash and produces a <br>, which
// causes users to lose visible `\` characters in their content.
md.inline.ruler.at("escape", function escapeOverride(state: any, silent: boolean): boolean {
    let pos = state.pos;
    const max = state.posMax;

    if (state.src.charCodeAt(pos) !== 0x5C /* \ */) return false;
    pos++;

    if (pos >= max) return false;

    const ch1 = state.src.charCodeAt(pos);

    // KEY CHANGE: when `\` is followed by a newline, output the backslash as
    // literal text and let the normal softbreak handling deal with the newline.
    if (ch1 === 0x0A) {
        if (!silent) {
            state.pending += "\\";
        }
        state.pos = pos; // leave the newline for softbreak to handle
        return true;
    }

    // For escaped ASCII punctuation, output the character without the backslash
    // (standard markdown escape behaviour: `\*` → `*`).
    let escapedStr = state.src[pos];
    // Handle surrogate pairs
    if (ch1 >= 0xD800 && ch1 <= 0xDBFF && pos + 1 < max) {
        const ch2 = state.src.charCodeAt(pos + 1);
        if (ch2 >= 0xDC00 && ch2 <= 0xDFFF) {
            escapedStr += state.src[pos + 1];
            pos++;
        }
    }

    const origStr = "\\" + escapedStr;

    if (!silent) {
        // Check if the character is an ASCII punctuation that
        // markdown-it considers escapable (codes < 256 in its lookup table).
        const isEscapable = ch1 < 256 && /[\\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-]/.test(String.fromCharCode(ch1));
        const token = state.push("text_special", "", 0);
        if (isEscapable) {
            token.content = escapedStr;
        } else {
            token.content = origStr;
        }
        token.markup = origStr;
        token.info = "escape";
    }
    state.pos = pos + 1;
    return true;
});

// Also disable the newline rule which redundantly converts `\` + newline
// to hardbreaks via a separate code path.
md.inline.ruler.disable(["newline"]);

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
                    let cellContent = "";
                    const oldWrite = state.write.bind(state);
                    state.write = (s: string) => { cellContent += s; };
                    
                    let first = true;
                    cell.forEach((block: any) => {
                        if (!first) cellContent += "<br>";
                        state.renderInline(block);
                        first = false;
                    });
                    
                    state.write = oldWrite;
                    state.write(cellContent.replace(/\|/g, "\\|"));
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
        table_header() {},
        // Custom text serializer: since our parser override keeps `\` as
        // literal text (instead of consuming it), we must avoid the default
        // esc() from double-escaping it. We escape all standard markdown
        // specials *except* the backslash itself.
        text(state: any, node: any) {
            const escaped = node.text.replace(/[`*~\[\]_]/g, (m: string, i: number) => {
                // Don't escape mid-word underscores (same logic as default esc)
                if (m === "_" && i > 0 && i + 1 < node.text.length
                    && /\w/.test(node.text[i - 1]) && /\w/.test(node.text[i + 1])) {
                    return m;
                }
                return "\\" + m;
            });
            // Handle start-of-line patterns that could be parsed as block syntax
            const lines = escaped.split("\n");
            for (let i = 0; i < lines.length; i++) {
                state.write();
                let line = lines[i];
                if (state.atBlockStart || i > 0) {
                    line = line
                        .replace(/^(\+[ ]|[-*>])/, "\\$&")
                        .replace(/^(\s*)(#{1,6})(\s|$)/, '$1\\$2$3')
                        .replace(/^(\s*\d+)\.\s/, "$1\\. ");
                }
                state.out += line;
                if (i !== lines.length - 1) state.out += "\n";
            }
        }
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
