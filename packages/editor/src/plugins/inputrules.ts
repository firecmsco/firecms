import {
    inputRules,
    wrappingInputRule,
    textblockTypeInputRule,
    smartQuotes,
    emDash,
    ellipsis,
    InputRule,
} from "prosemirror-inputrules";
import { schema } from "../schema";
import { MarkType } from "prosemirror-model";

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

const horizontalRuleInputRule = new InputRule(
    /^(?:---|—-|___\s|\*\*\*\s)$/,
    (state, match, start, end) => {
        const tr = state.tr;
        tr.replaceWith(start - 1, end, schema.nodes.horizontal_rule.create());
        return tr;
    }
);

function markInputRule(regexp: RegExp, markType: MarkType, getAttrs?: (match: RegExpMatchArray) => Record<string, any>) {
    return new InputRule(regexp, (state, match, start, end) => {
        const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
        const tr = state.tr;
        if (match[1]) {
            const textStart = start + match[0].indexOf(match[1]);
            const textEnd = textStart + match[1].length;
            if (textEnd < end) tr.delete(textEnd, end);
            if (textStart > start) tr.delete(start, textStart);
            end = start + match[1].length;
        }
        tr.addMark(start, end, markType.create(attrs));
        tr.removeStoredMark(markType);
        return tr;
    });
}

const strongRule = markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, schema.marks.bold);
const emRule = markInputRule(/(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)$/, schema.marks.italic);
const codeRule = markInputRule(/(?:`)([^`]+)(?:`)$/, schema.marks.code);
const strikeRule = markInputRule(/(?:~~)([^~]+)(?:~~)$/, schema.marks.strike);

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
        horizontalRuleInputRule,
        strongRule,
        emRule,
        codeRule,
        strikeRule
    ],
});
