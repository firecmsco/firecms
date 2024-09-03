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
    hasHighlight: boolean;
    decorationSet?: DecorationSet
}

export interface HighlightDecorationOptions {
    pluginKey: PluginKey<AutocompleteHighlightState>
    highlight?: { from: number, to: number }
}

const highlightPluginKey = new PluginKey<AutocompleteHighlightState>("highlightPlugin");

/**
 * This plugin is used to highlight the current autocomplete suggestion.
 * It allows to set a range and remove it.
 */
export const HighlightDecorationExtension = Extension.create<HighlightDecorationOptions>({
    name: "highlightDecoration",
    addOptions() {
        return {
            pluginKey: highlightPluginKey
        };
    },
    addProseMirrorPlugins() {

        const pluginKey = this.options.pluginKey;
        return [
            new Plugin<AutocompleteHighlightState>({
                key: highlightPluginKey,
                state: {
                    init(_, { doc }) {
                        return {
                            hasHighlight: false
                        }
                    },
                    apply(transaction, oldState) {
                        const action = transaction.getMeta(pluginKey);
                        const highlight = action?.range;
                        if (action?.type === "highlightDecoration") {

                            const { remove } = action;

                            if (remove) {
                                return {
                                    decorationSet: DecorationSet.empty,
                                    hasHighlight: false
                                };
                            }

                            const decorations: [any?] = []

                            if (highlight) {
                                decorations.push(
                                    Decoration.inline(highlight.from, highlight.to, {
                                        class: "dark:bg-slate-700 bg-slate-300"
                                    })
                                );
                            }
                            return {
                                decorationSet: DecorationSet.create(transaction.doc, decorations),
                                hasHighlight: !!highlight,
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

    // @ts-ignore
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
                const pluginState = pluginKey.get(state);

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
