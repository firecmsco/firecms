import StarterKit from "@tiptap/starter-kit";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { Editor, InputRule } from "@tiptap/core";
import { loadingDecorationKey } from "./TextLoadingDecorationExtension";

const PlaceholderExtension = Placeholder.configure({
    placeholder: ({
                      node,
                      editor
                  }) => {
        const {
            from,
            to
        } = editor.state.selection;

        function hasLoadingDecoration(editor: Editor): boolean {
            const pluginState = loadingDecorationKey.get(editor.state);
            return pluginState?.getState(editor.state)?.hasDecoration ?? false;
        }

        const hasDecoration = hasLoadingDecoration(editor);

        if (hasDecoration) {
            return "";
        }
        if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`;
        }
        return "Press '/' for commands";
    },
    includeChildren: true
});

const Horizontal = HorizontalRule.extend({
    addInputRules() {
        return [
            new InputRule({
                find: /^(?:---|—-|___\s|\*\*\*\s)$/,
                handler: ({
                              state,
                              range
                          }) => {
                    const attributes = {};

                    const { tr } = state;
                    const start = range.from;
                    const end = range.to;

                    tr.insert(start - 1, this.type.create(attributes) as any).delete(
                        tr.mapping.map(start),
                        tr.mapping.map(end)
                    );
                }
            })
        ];
    }
});

export {
    PlaceholderExtension as Placeholder,
    StarterKit,
    Horizontal as HorizontalRule,
    TiptapLink,
    TiptapImage,
    TaskItem,
    TaskList,
    InputRule
};

export { getPrevText } from "../utils/utils";
