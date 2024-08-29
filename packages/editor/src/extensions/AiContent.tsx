import { Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { DecorationSet } from "@tiptap/pm/view";
import { EditorAIController } from "../types";

export const AiContentExtensionKey = new PluginKey("AiContentExtension");

export const AiContentExtension = Node.create<
    {
        aiController: EditorAIController
    },
    {
        aiController: EditorAIController
    }
>({
    name: "aiContent",

    addProseMirrorPlugins() {
        const pluginKey = AiContentExtensionKey;
        // const aiController = this.options.aiController

        const plugin = new Plugin({
            key: pluginKey,
            state: {

                init() {
                    return DecorationSet.empty;
                },
                apply(tr, oldValue) {
                    // if (tr.getMeta(pluginKey)) {
                    //     // Update the decoration state based on the async data
                    //     const { decorations } = tr.getMeta(pluginKey);
                    //     return decorations;
                    // }
                    // return tr.docChanged ? oldValue.map(tr.mapping, tr.doc) : oldValue;
                    return tr.getMeta(pluginKey) || oldValue;
                }
            },
            view() {
                return {
                    update(view, prevState) {
                        const prevDecos = plugin.getState(prevState);
                        const newDecos = plugin.getState(view.state);
                        if (prevDecos !== newDecos) {
                            view.updateState(view.state);
                        }
                    }
                };
            },
            // props: {
            //     decorations(editorState) {
            //         return pluginKey.getState(editorState);
            //     },
            //     handleKeyDown(view, event) {
            //         const pluginState = pluginKey.getState(view.state);
            //         if (!pluginState) return false;
            //
            //         if (event.key === "Tab") {
            //             const selection = view.state.selection;
            //             const cursorPos = selection.$head.pos;
            //
            //             // Find the suggestion decoration
            //             const decoration = pluginState.find(cursorPos)?.[0];
            //             console.log(decoration);
            //             // @ts-ignore
            //             if (decoration && decoration.type?.spec?.suggestionText) {
            //                 // @ts-ignore
            //                 const suggestionText = decoration.type.spec.suggestionText;
            //                 const tr = view.state.tr;
            //                 tr.insertText(suggestionText, cursorPos);
            //
            //                 // Dispatch the transaction
            //                 view.dispatch(tr.setMeta("addToHistory", true));
            //
            //                 // Clear decorations after applying suggestion
            //                 const clearDecoTr = view.state.tr;
            //                 clearDecoTr.setMeta(pluginKey, { decorations: DecorationSet.empty });
            //                 view.dispatch(clearDecoTr);
            //
            //                 // Prevent default behavior of the keypress
            //                 event.preventDefault();
            //                 return true;
            //             }
            //         }
            //         return false;
            //     }
            // }
        });
        return [plugin];
    }
});
