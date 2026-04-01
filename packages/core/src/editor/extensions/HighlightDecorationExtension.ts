import { Plugin, PluginKey, Transaction, EditorState } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export interface HighlightRange {
    from: number
    to: number
}

interface AutocompleteHighlightState {
    highlight?: HighlightRange
    decorationSet?: DecorationSet
}

export const highlightDecorationKey = new PluginKey<AutocompleteHighlightState>("highlightDecoration");

function buildDecorationSet(highlight: any, doc: any) {
    const decorations: [any?] = [];

    if (highlight) {
        decorations.push(
            Decoration.inline(highlight.from, highlight.to, {
                class: "dark:bg-surface-accent-700 bg-surface-accent-300"
            })
        );
    }
    const decorationSet = DecorationSet.create(doc, decorations);
    return decorationSet;
}

/**
 * Commands to toggle the highlight
 */
export const highlightCommands = {
    toggleAutocompleteHighlight: (range?: HighlightRange) => (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
        const { selection } = state;
        const pos = selection.from;

        if (!dispatch) return false;

        const tr = state.tr.setMeta(highlightDecorationKey, {
            pos,
            type: "highlightDecoration",
            remove: false,
            range
        });

        dispatch(tr);
        return true;
    },

    removeAutocompleteHighlight: () => (state: EditorState, dispatch?: (tr: Transaction) => void): boolean => {
        if (!dispatch) return false;

        const tr = state.tr.setMeta(highlightDecorationKey, {
            pos: 0,
            type: "highlightDecoration",
            remove: true
        });

        dispatch(tr);
        return true;
    }
}

/**
 * This plugin is used to highlight the current autocomplete suggestion.
 * It allows to set a range and remove it.
 */
export const highlightDecorationPlugin = (initialHighlight?: HighlightRange) => {
    return new Plugin<AutocompleteHighlightState>({
        key: highlightDecorationKey,
        state: {
            init: (_, { doc }) => {
                const decorationSet = initialHighlight && doc ? buildDecorationSet(initialHighlight, doc) : DecorationSet.empty;
                return {
                    decorationSet,
                    highlight: initialHighlight
                };
            },
            apply(transaction, oldState) {
                const action = transaction.getMeta(highlightDecorationKey);
                const highlight = action?.range;
                if (action?.type === "highlightDecoration") {

                    const doc = transaction.doc;
                    const { remove } = action;

                    if (remove) {
                        return {
                            decorationSet: DecorationSet.empty
                        };
                    }
                    const decorationSet = buildDecorationSet(highlight, doc);
                    return {
                        decorationSet: decorationSet,
                        highlight
                    }
                } else {
                    return oldState
                }
            }
        },
        props: {
            decorations(state) {
                const autocompleteState = this.getState(state);
                if (autocompleteState?.decorationSet) {
                    return autocompleteState.decorationSet
                } else {
                    return DecorationSet.empty
                }
            }
        }
    });
};
