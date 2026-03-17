import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Node } from "prosemirror-model";

export const placeholderPluginKey = new PluginKey("placeholderPlugin");

function isNodeEmpty(node: Node) {
    const defaultContent = node.type.createAndFill()
    if (!defaultContent) return true
    return node.content.eq(defaultContent.content)
}

export function placeholderPlugin(text: string) {
    return new Plugin({
        key: placeholderPluginKey,
        props: {
            decorations: (state) => {
                const doc = state.doc;
                const decorations: Decoration[] = [];
                const isEmptyDoc = doc.childCount === 1 && doc.firstChild?.isTextblock && doc.firstChild.content.size === 0;

                doc.descendants((node, pos) => {
                    const isEmpty = !node.isLeaf && isNodeEmpty(node);

                    if (isEmpty) {
                        const classes = ["is-empty"];
                        if (isEmptyDoc) {
                            classes.push("is-editor-empty");
                        }

                        decorations.push(
                            Decoration.node(pos, pos + node.nodeSize, {
                                class: classes.join(" "),
                                "data-placeholder": text
                            })
                        );
                    }
                    return false; // Stop descending (equivalent to includeChildren: false in Tiptap)
                });

                return DecorationSet.create(doc, decorations);
            }
        }
    });
}

