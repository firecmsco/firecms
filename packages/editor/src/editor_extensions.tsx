import StarterKit from "@tiptap/starter-kit";

import { HorizontalRule, Placeholder, TaskItem, TaskList, TiptapLink, } from "./extensions";

import { cls, defaultBorderMixin } from "@firecms/ui";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";

export const placeholder = Placeholder;

export const tiptapLink = TiptapLink.configure({
    HTMLAttributes: {
        class: cls(
            "text-surface-700 dark:text-surface-accent-200 underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
        ),
    },
});

export const taskList = TaskList.configure({
    HTMLAttributes: {
        class: cls("not-prose"),
    },
});
export const taskItem = TaskItem.configure({
    HTMLAttributes: {
        class: cls("flex items-start my-4"),
    },
    nested: true,
});

export const horizontalRule = HorizontalRule.configure({
    HTMLAttributes: {
        class: cls("mt-4 mb-6 border-t", defaultBorderMixin),
    },
});

export const bulletList = BulletList.configure({
    HTMLAttributes: {
        class: cls("list-disc list-outside leading-3 -mt-2"),
    },
});

export const orderedList = OrderedList.configure({
    HTMLAttributes: {
        class: cls("list-decimal list-outside leading-3 -mt-2"),
    },
});

export const listItem = ListItem.configure({
    HTMLAttributes: {
        class: cls("leading-normal -mb-2"),
    },
});

export const blockquote = Blockquote.configure({
    HTMLAttributes: {
        class: cls("border-l-4 border-primary"),
    },
});

export const codeBlock = CodeBlock.configure({
    HTMLAttributes: {
        class: cls("rounded bg-blue-50 dark:bg-surface-700 border p-5 font-mono font-medium", defaultBorderMixin),
    },
});

//    code: {
//         HTMLAttributes: {
//             class: cls("rounded-md bg-surface-accent-50 dark:bg-surface-700 px-1.5 py-1 font-mono font-medium"),
//             spellcheck: "false",
//         },
//     },

export const code = Code.configure({
    HTMLAttributes: {
        class: cls("rounded-md bg-surface-accent-50 dark:bg-surface-700 px-1.5 py-1 font-mono font-medium"),
        spellcheck: "false",
    },
});

export const starterKit = StarterKit.configure({
    document: false,
    horizontalRule: false,
    dropcursor: {
        color: "#DBEAFE",
        width: 4,
    },
    gapcursor: false,
});
