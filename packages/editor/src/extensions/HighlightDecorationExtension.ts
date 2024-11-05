import { Command, Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        highlightDecoration: {
            toggleAutocompleteHighlight: (range?: { from: number, to: number }) => ReturnType;
            removeAutocompleteHighlight: () => ReturnType;
        };
    }
}

export interface HighlightRange {
    from: number
    to: number
}

interface AutocompleteHighlightState {
    highlight?: HighlightRange
    decorationSet?: DecorationSet
}

export interface HighlightDecorationOptions {
    pluginKey: PluginKey<AutocompleteHighlightState>
    highlight?: { from: number, to: number }
}

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
 * This plugin is used to highlight the current autocomplete suggestion.
 * It allows to set a range and remove it.
 */
export const HighlightDecorationExtension = (initialHighlight?: HighlightRange) => Extension.create<HighlightDecorationOptions>({
    name: "highlightDecoration",
    addOptions() {
        return {
            pluginKey: new PluginKey<AutocompleteHighlightState>("highlightDecoration"),
            highlight: initialHighlight
        };
    },
    addProseMirrorPlugins() {

        const pluginKey = this.options.pluginKey;
        return [
            new Plugin<AutocompleteHighlightState>({
                key: pluginKey,
                state: {
                    init: (_, { doc }) => {
                        const highlight = this.options.highlight;
                        const decorationSet = highlight && doc ? buildDecorationSet(highlight, doc) : DecorationSet.empty;
                        return {
                            decorationSet,
                            highlight
                        };
                    },
                    apply(transaction, oldState) {
                        const action = transaction.getMeta(pluginKey);
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
            })
        ]
    },

    addCommands() {
        return {
            toggleAutocompleteHighlight: (range?: { from: number, to: number }): Command => ({
                                                                                                 state,
                                                                                                 dispatch
                                                                                             }) => {

                const { selection } = state;
                const pos = selection.from;

                if (!dispatch) return false;

                const pluginKey = this.options.pluginKey;

                const tr = state.tr.setMeta(pluginKey, {
                    pos,
                    type: "highlightDecoration",
                    remove: false,
                    range
                });

                dispatch(tr);
                return true;
            },

            removeAutocompleteHighlight: (): Command => ({
                                                             state,
                                                             dispatch
                                                         }) => {

                if (!dispatch) return false;

                const pluginKey = this.options.pluginKey;
                const tr = state.tr.setMeta(pluginKey, {
                    pos: 0, // We can pass any position as it will remove the entire decoration set
                    type: "highlightDecoration",
                    remove: true
                });

                dispatch(tr);
                return true;
            }
        };
    }
});
