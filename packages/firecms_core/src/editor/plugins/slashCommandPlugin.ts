import { Plugin, PluginKey, TextSelection } from "prosemirror-state";

export const SlashCommandPluginKey = new PluginKey("slash-command");

export interface SlashCommandState {
    active: boolean;
    range?: { from: number; to: number };
    query?: string;
}

export function slashCommandPlugin() {
    return new Plugin({
        key: SlashCommandPluginKey,
        state: {
            init(): SlashCommandState {
                return { active: false };
            },
            apply(tr, value, oldState, newState): SlashCommandState {
                const { selection } = newState;
                if (!(selection instanceof TextSelection) || !selection.empty) {
                    return { active: false };
                }

                // Make sure we are in a paragraph or heading block, not a code_block for example
                const $anchor = selection.$anchor;
                if ($anchor.parent.type.name === "code_block") {
                    return { active: false };
                }

                const textBefore = $anchor.parent.textBetween(
                    Math.max(0, $anchor.parentOffset - 20),
                    $anchor.parentOffset,
                    undefined,
                    "\ufffc"
                );
                const match = textBefore.match(/(?:\s|^)(\/)([a-zA-Z0-9]*)$/);

                if (match) {
                    // match[1] is the slash, match[2] is the query
                    const query = match[2];
                    const from = $anchor.pos - query.length - 1;
                    const to = $anchor.pos;
                    return { active: true, range: { from, to }, query };
                }
                return { active: false };
            },
        }
    });
}
