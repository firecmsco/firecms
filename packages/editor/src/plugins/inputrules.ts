import {
    inputRules,
    wrappingInputRule,
    textblockTypeInputRule,
    smartQuotes,
    emDash,
    ellipsis,
} from "prosemirror-inputrules";
import { schema } from "../schema";

const blockQuoteRule = wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote);

const orderedListRule = wrappingInputRule(
    /^(\d+)\.\s$/,
    schema.nodes.ordered_list,
    (match) => ({ order: +match[1] }),
    (match, node) => node.childCount + node.attrs.order === +match[1]
);

const bulletListRule = wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list);

const taskListRule = wrappingInputRule(/^\s*(\[ \])\s$/, schema.nodes.task_list);

const codeBlockRule = textblockTypeInputRule(/^```$/, schema.nodes.code_block);

const headingRule = textblockTypeInputRule(
    new RegExp("^(#{1,6})\\s$"),
    schema.nodes.heading,
    (match) => ({ level: match[1].length })
);

export const markdownInputRules = inputRules({
    rules: [
        ...smartQuotes,
        ellipsis,
        emDash,
        blockQuoteRule,
        orderedListRule,
        bulletListRule,
        codeBlockRule,
        headingRule,
        taskListRule,
    ],
});
