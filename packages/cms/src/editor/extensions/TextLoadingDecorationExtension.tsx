import { Plugin, PluginKey, Transaction, EditorState } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

// Define and export the plugin key
export const loadingDecorationKey = new PluginKey<LoadingDecorationState>("loadingDecoration");

interface LoadingDecorationState {
    decorationSet: DecorationSet;
    hasDecoration: boolean;
}

export const textLoadingCommands = {
    toggleLoadingDecoration: (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined, loadingHtml?: string): boolean => {
        const { selection } = state;
        const pos = selection.from;

        if (!dispatch) return false;

        const tr = state.tr.setMeta(loadingDecorationKey, {
            pos,
            type: "loadingDecoration",
            remove: false,
            loadingHtml
        });

        dispatch(tr);
        return true;
    },

    removeLoadingDecoration: (state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean => {
        if (!dispatch) return false;

        const tr = state.tr.setMeta(loadingDecorationKey, {
            pos: 0, // We can pass any position as it will remove the entire decoration set
            type: "loadingDecoration",
            remove: true
        });

        dispatch(tr);
        return true;
    }
};

/**
 * This plugin is used to display streaming content from an LLM.
 */
export const textLoadingDecorationPlugin = () => {
    return new Plugin<LoadingDecorationState>({
        key: loadingDecorationKey,

        state: {
            init() {
                return {
                    decorationSet: DecorationSet.empty,
                    hasDecoration: false
                };
            },

            apply(tr, oldState) {
                const action = tr.getMeta(loadingDecorationKey);

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
    });
};
