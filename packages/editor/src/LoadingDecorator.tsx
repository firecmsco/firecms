import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Command, Extension } from "@tiptap/core";

// Define and export the plugin key
export const loadingDecorationKey = new PluginKey<LoadingDecorationState>("loadingDecoration");

interface LoadingDecorationState {
    decorationSet: DecorationSet;
    hasDecoration: boolean;
}
 // this decoration is used to display streaming content from an LLM, called withing the slash command
const LoadingDecoration = Extension.create({
    name: "loadingDecoration",

    addOptions() {
        return {
            pluginKey: loadingDecorationKey
        };
    },

    addProseMirrorPlugins() {
        const pluginKey = this.options.pluginKey;

        return [
            new Plugin<LoadingDecorationState>({
                key: pluginKey,

                state: {
                    init() {
                        return {
                            decorationSet: DecorationSet.empty,
                            hasDecoration: false
                        };
                    },

                    apply(tr, oldState) {
                        const action = tr.getMeta(pluginKey);

                        if (action?.type === "loadingDecoration") {
                            const { pos, remove, loadingHtml } = action;

                            if (remove) {
                                return {
                                    decorationSet: DecorationSet.empty,
                                    hasDecoration: false
                                };
                            }

                            const decoration = Decoration.widget(pos, () => {
                                const container = document.createElement("span");
                                container.className = "loading-decoration";

                                // Sanitize and append HTML
                                if (loadingHtml) {
                                    container.innerHTML = loadingHtml;
                                } else {
                                    const span = document.createElement("span");
                                    span.innerText = "loading...";
                                    container.appendChild(span);
                                }

                                return container;
                            });

                            return {
                                decorationSet: DecorationSet.empty.add(tr.doc, [decoration]),
                                hasDecoration: true
                            };
                        }

                        return {
                            decorationSet: oldState.decorationSet.map(tr.mapping, tr.doc),
                            hasDecoration: oldState.hasDecoration
                        };
                    }
                },

                props: {
                    decorations(state) {
                        return this.getState(state)?.decorationSet || DecorationSet.empty;
                    }
                }
            })
        ];
    },

    // @ts-ignore
    addCommands() {
        return {
            toggleLoadingDecoration: (loadingHtml?: string): Command => ({ state, dispatch }) => {
                const { selection } = state;
                const pos = selection.from;

                if (!dispatch) return false;

                const pluginKey = this.options.pluginKey;
                const pluginState = pluginKey.get(state);
                const decorationExists = pluginState?.getState(state)?.hasDecoration ?? false;

                const tr = state.tr.setMeta(pluginKey, {
                    pos,
                    type: "loadingDecoration",
                    remove: false,
                    loadingHtml
                });

                dispatch(tr);
                return true;
            },

            removeLoadingDecoration: (): Command => ({ state, dispatch }) => {
                if (!dispatch) return false;

                const pluginKey = this.options.pluginKey;
                const tr = state.tr.setMeta(pluginKey, {
                    pos: 0, // We can pass any position as it will remove the entire decoration set
                    type: "loadingDecoration",
                    remove: true
                });

                dispatch(tr);
                return true;
            }
        };
    }
});

export default LoadingDecoration;
