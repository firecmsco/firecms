import { Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

function debounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
        return new Promise((resolve, reject) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                try {
                    const output = callback(...args);
                    resolve(output);
                } catch (err) {
                    reject(err);
                }
            }, delay);
        });
    };
}
// TODO: this is a working version of a suggestion extension, it is just not connected to any API
export const AutocompleteExtension = Node.create<
    {
        suggestionDebounce: number;
    },
    {
        getSuggestion: ((previousText: string, cb: (suggestion: string | null) => void) => void) | undefined;
        suggestion: string | null;
    }
>({
    name: "suggestion",

    addOptions() {
        return {
            suggestionDebounce: 1500,
            previousTextLength: 4000
        };
    },

    addProseMirrorPlugins() {
        const pluginKey = new PluginKey<DecorationSet>("suggestion");

        const getSuggestion = debounce(async (previousText: string, cb: (suggestion: string | null) => void) => {
            const suggestion = await Promise.resolve("Test suggestion");

            cb(suggestion);
        }, this.options.suggestionDebounce);

        return [
            new Plugin({
                key: pluginKey,
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(tr, oldValue) {
                        if (tr.getMeta(pluginKey)) {
                            // Update the decoration state based on the async data
                            const { decorations } = tr.getMeta(pluginKey);
                            return decorations;
                        }
                        return tr.docChanged ? oldValue.map(tr.mapping, tr.doc) : oldValue;
                    }
                },
                view() {
                    return {
                        update(view, prevState) {
                            // This will add the widget decoration at the cursor position
                            const selection = view.state.selection;
                            const cursorPos = selection.$head.pos;
                            const nextNode = view.state.doc.nodeAt(cursorPos);

                            // If the cursor is not at the end of the block and we have a suggestion => hide the suggestion
                            if (nextNode && !nextNode.isBlock && pluginKey.getState(view.state)?.find().length) {
                                const tr = view.state.tr;
                                tr.setMeta("addToHistory", false);
                                tr.setMeta(pluginKey, { decorations: DecorationSet.empty });
                                view.dispatch(tr);
                                return;
                            }

                            // If the document didn't change, do nothing
                            if (prevState && prevState.doc.eq(view.state.doc)) {
                                return;
                            }

                            // reset the suggestion before fetching a new one
                            setTimeout(() => {
                                const tr = view.state.tr;
                                tr.setMeta("addToHistory", false);
                                tr.setMeta(pluginKey, { decorations: DecorationSet.empty });
                                view.dispatch(tr);
                            }, 0);

                            // fetch a new suggestion
                            const previousText = view.state.doc.textBetween(0, view.state.doc.content.size, " ").slice(-4000);
                            getSuggestion(previousText, (suggestion) => {
                                if (!suggestion) return;

                                const updatedState = view.state;

                                const cursorPos = updatedState.selection.$head.pos;
                                const suggestionDecoration = Decoration.widget(
                                    cursorPos, () => {
                                        const parentNode = document.createElement("span");
                                        const addSpace = nextNode && nextNode.isText ? " " : "";
                                        parentNode.innerHTML = `${addSpace}${suggestion}`;
                                        parentNode.classList.add("text-gray-400", "dark:text-gray-500", "suggestion");
                                        return parentNode;
                                    }, {
                                        side: 1,
                                        suggestionText: suggestion
                                    }
                                );

                                const decorations = DecorationSet.create(updatedState.doc, [suggestionDecoration]);
                                const tr = view.state.tr;
                                tr.setMeta("addToHistory", false);
                                tr.setMeta(pluginKey, { decorations });
                                view.dispatch(tr);
                            });
                        }
                    };
                },
                props: {
                    decorations(editorState) {
                        return pluginKey.getState(editorState);
                    },
                    handleKeyDown(view, event) {
                        const pluginState = pluginKey.getState(view.state);
                        if (!pluginState) return false;

                        if (event.key === "Tab") {
                            const selection = view.state.selection;
                            const cursorPos = selection.$head.pos;

                            // Find the suggestion decoration
                            const decoration = pluginState.find(cursorPos)?.[0];
                            console.log(decoration);
                            // @ts-ignore
                            if (decoration && decoration.type?.spec?.suggestionText) {
                                // @ts-ignore
                                const suggestionText = decoration.type.spec.suggestionText;
                                const tr = view.state.tr;
                                tr.insertText(suggestionText, cursorPos);

                                // Dispatch the transaction
                                view.dispatch(tr.setMeta("addToHistory", true));

                                // Clear decorations after applying suggestion
                                const clearDecoTr = view.state.tr;
                                clearDecoTr.setMeta(pluginKey, { decorations: DecorationSet.empty });
                                view.dispatch(clearDecoTr);

                                // Prevent default behavior of the keypress
                                event.preventDefault();
                                return true;
                            }
                        }
                        return false;
                    }
                }
            })
        ];
    }
});
