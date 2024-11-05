import StarterKit from "@tiptap/starter-kit";

import { HorizontalRule, Placeholder, TaskItem, TaskList, TiptapLink, } from "./extensions";

import { cls, defaultBorderMixin } from "@firecms/ui";
import { Markdown } from "tiptap-markdown";

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

export const markdownExtension = Markdown.configure({
    html: true,
});

export const horizontalRule = HorizontalRule.configure({
    HTMLAttributes: {
        class: cls("mt-4 mb-6 border-t", defaultBorderMixin),
    },
});

export const starterKit = StarterKit.configure({
    bulletList: {
        HTMLAttributes: {
            class: cls("list-disc list-outside leading-3 -mt-2"),
        },
    },
    orderedList: {
        HTMLAttributes: {
            class: cls("list-decimal list-outside leading-3 -mt-2"),
        },
    },
    listItem: {
        HTMLAttributes: {
            class: cls("leading-normal -mb-2"),
        },
    },
    blockquote: {
        HTMLAttributes: {
            class: cls("border-l-4 border-primary"),
        },
    },
    codeBlock: {
        HTMLAttributes: {
            class: cls("rounded bg-blue-50 dark:bg-surface-700 border p-5 font-mono font-medium", defaultBorderMixin),
        },
    },
    code: {
        HTMLAttributes: {
            class: cls("rounded-md bg-surface-accent-50 dark:bg-surface-700 px-1.5 py-1 font-mono font-medium"),
            spellcheck: "false",
        },
    },
    document: false,
    horizontalRule: false,
    dropcursor: {
        color: "#DBEAFE",
        width: 4,
    },
    gapcursor: false,
});
