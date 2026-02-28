import { Schema, NodeSpec, MarkSpec } from "prosemirror-model";

const marks: { [key: string]: MarkSpec } = {
    link: {
        attrs: {
            href: {},
            title: { default: null },
            target: { default: "_blank" },
        },
        inclusive: false,
        parseDOM: [
            {
                tag: "a[href]",
                getAttrs(dom: HTMLElement | string) {
                    if (typeof dom === "string") return false;
                    return {
                        href: dom.getAttribute("href"),
                        title: dom.getAttribute("title"),
                        target: dom.getAttribute("target") || "_blank",
                    };
                },
            },
        ],
        toDOM(node) {
            let { href, title, target } = node.attrs;
            return ["a", { href, title, target, class: "text-surface-700 dark:text-surface-accent-200 underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer" }, 0];
        },
    },
    bold: {
        parseDOM: [
            { tag: "strong" },
            { tag: "b", getAttrs: (node: HTMLElement | string) => typeof node !== "string" && node.style.fontWeight !== "normal" && null },
            { style: "font-weight=400", clearMark: m => m.type.name === "bold" },
            { style: "font-weight", getAttrs: (value: string | HTMLElement) => typeof value === "string" && /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null },
        ],
        toDOM() { return ["strong", 0]; },
    },
    italic: {
        parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
        toDOM() { return ["em", 0]; },
    },
    strike: {
        parseDOM: [{ tag: "s" }, { tag: "del" }, { tag: "strike" }, { style: "text-decoration=line-through" }],
        toDOM() { return ["s", 0]; },
    },
    underline: {
        parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
        toDOM() { return ["u", 0]; },
    },
    code: {
        parseDOM: [{ tag: "code" }],
        toDOM() { return ["code", { class: "rounded-md bg-surface-accent-50 dark:bg-surface-700 px-1.5 py-1 font-mono font-medium", spellcheck: "false" }, 0]; },
    },
    textStyle: {
        attrs: { color: { default: null } },
        parseDOM: [
            {
                style: "color",
                getAttrs: (value: string | HTMLElement) => {
                    if (typeof value === "string") return { color: value };
                    return false;
                },
            },
        ],
        toDOM(mark) {
            let style = "";
            if (mark.attrs.color) style += `color: ${mark.attrs.color};`;
            return ["span", { style }, 0];
        },
    },
    highlight: {
        attrs: { color: { default: null } },
        parseDOM: [
            {
                tag: "mark",
                getAttrs: (dom: HTMLElement | string) => {
                    if (typeof dom === "string") return false;
                    return { color: dom.style.backgroundColor || dom.getAttribute("data-color") };
                }
            },
        ],
        toDOM(mark) {
            return ["mark", mark.attrs.color ? { style: `background-color: ${mark.attrs.color}; color: inherit;`, "data-color": mark.attrs.color } : {}, 0];
        },
    },
};

const nodes: { [key: string]: NodeSpec } = {
    doc: {
        content: "block+",
    },
    paragraph: {
        content: "inline*",
        group: "block",
        parseDOM: [{ tag: "p" }],
        toDOM() { return ["p", 0]; },
    },
    text: {
        group: "inline",
    },
    blockquote: {
        content: "block+",
        group: "block",
        defining: true,
        parseDOM: [{ tag: "blockquote" }],
        toDOM() { return ["blockquote", { class: "border-l-4 border-primary" }, 0]; },
    },
    heading: {
        attrs: { level: { default: 1 } },
        content: "inline*",
        group: "block",
        defining: true,
        parseDOM: [
            { tag: "h1", attrs: { level: 1 } },
            { tag: "h2", attrs: { level: 2 } },
            { tag: "h3", attrs: { level: 3 } },
            { tag: "h4", attrs: { level: 4 } },
            { tag: "h5", attrs: { level: 5 } },
            { tag: "h6", attrs: { level: 6 } },
        ],
        toDOM(node) { return ["h" + node.attrs.level, 0]; },
    },
    horizontal_rule: {
        group: "block",
        parseDOM: [{ tag: "hr" }],
        toDOM() { return ["hr", { class: "mt-4 mb-6 border-t border-solid border-gray-200 dark:border-gray-800" }]; },
    },
    code_block: {
        content: "text*",
        marks: "",
        group: "block",
        code: true,
        defining: true,
        attrs: { language: { default: null } },
        parseDOM: [
            { tag: "pre", preserveWhitespace: "full" },
        ],
        toDOM(node) { return ["pre", { class: "rounded bg-blue-50 dark:bg-surface-700 border border-solid border-gray-200 dark:border-gray-800 p-5 font-mono font-medium" }, ["code", 0]]; },
    },
    image: {
        inline: false,
        group: "block",
        attrs: {
            src: {},
            alt: { default: null },
            title: { default: null },
        },
        draggable: true,
        parseDOM: [
            {
                tag: "img[src]",
                getAttrs(dom: HTMLElement | string) {
                    if (typeof dom === "string") return false;
                    return {
                        src: dom.getAttribute("src"),
                        title: dom.getAttribute("title"),
                        alt: dom.getAttribute("alt"),
                    };
                },
            },
        ],
        toDOM(node) {
            let { src, alt, title } = node.attrs;
            return ["img", { src, alt, title, class: "rounded-lg border border-solid border-gray-200 dark:border-gray-800 max-w-full" }];
        },
    },
    bullet_list: {
        content: "list_item+",
        group: "block",
        parseDOM: [{ tag: "ul" }],
        toDOM() { return ["ul", { class: "list-disc list-outside leading-3 -mt-2" }, 0]; },
    },
    ordered_list: {
        content: "list_item+",
        group: "block",
        attrs: { order: { default: 1 } },
        parseDOM: [
            {
                tag: "ol",
                getAttrs(dom: HTMLElement | string) {
                    if (typeof dom === "string") return false;
                    return { order: dom.hasAttribute("start") ? +dom.getAttribute("start")! : 1 };
                },
            },
        ],
        toDOM(node) {
            return node.attrs.order === 1 ? ["ol", { class: "list-decimal list-outside leading-3 -mt-2" }, 0] : ["ol", { start: node.attrs.order, class: "list-decimal list-outside leading-3 -mt-2" }, 0];
        },
    },
    list_item: {
        content: "paragraph block*",
        parseDOM: [{ tag: "li" }],
        toDOM() { return ["li", { class: "leading-normal -mb-2" }, 0]; },
        defining: true,
    },
    task_list: {
        group: "block",
        content: "task_item+",
        parseDOM: [{ tag: 'ul[data-type="taskList"]' }],
        toDOM() { return ["ul", { "data-type": "taskList", class: "not-prose" }, 0]; },
    },
    task_item: {
        content: "paragraph block*",
        defining: true,
        attrs: { checked: { default: false } },
        parseDOM: [
            {
                tag: 'li[data-type="taskItem"]',
                getAttrs(dom: HTMLElement | string) {
                    if (typeof dom === "string") return false;
                    return { checked: dom.getAttribute("data-checked") === "true" };
                },
            },
        ],
        toDOM(node) {
            return ["li", { "data-type": "taskItem", "data-checked": node.attrs.checked ? "true" : "false", class: "flex items-start my-4" }, 0];
        },
    },
    hard_break: {
        inline: true,
        group: "inline",
        selectable: false,
        parseDOM: [{ tag: "br" }],
        toDOM() { return ["br"]; },
    },
};

export const schema = new Schema({ nodes, marks });
