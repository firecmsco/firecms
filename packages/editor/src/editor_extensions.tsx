import { HorizontalRule, Placeholder, StarterKit, TaskItem, TaskList, TiptapImage, TiptapLink, } from "./extensions";

import { cn, defaultBorderMixin } from "@firecms/ui";

//You can overwrite the placeholder with your own configuration
export const placeholder = Placeholder;
export const tiptapLink = TiptapLink.configure({
    HTMLAttributes: {
        class: cn(
            "text-gray-600 dark:text-gray-300 underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
        ),
    },
});

// export const tiptapImage = TiptapImage.extend({
//     addProseMirrorPlugins() {
//         return [UploadImagesPlugin()];
//     },
// }).configure({
//     allowBase64: true,
//     HTMLAttributes: {
//         class: cn("rounded-lg border", defaultBorderMixin),
//     },
// });

// const updatedImage = UpdatedImage.configure({
//     HTMLAttributes: {
//         class: cn("rounded-lg border", defaultBorderMixin),
//     },
// });

export const taskList = TaskList.configure({
    HTMLAttributes: {
        class: cn("not-prose"),
    },
});
export const taskItem = TaskItem.configure({
    HTMLAttributes: {
        class: cn("flex items-start my-4"),
    },
    nested: true,
});

export const horizontalRule = HorizontalRule.configure({
    HTMLAttributes: {
        class: cn("mt-4 mb-6 border-t", defaultBorderMixin),
    },
});

export const starterKit = StarterKit.configure({
    bulletList: {
        HTMLAttributes: {
            class: cn("list-disc list-outside leading-3 -mt-2"),
        },
    },
    orderedList: {
        HTMLAttributes: {
            class: cn("list-decimal list-outside leading-3 -mt-2"),
        },
    },
    listItem: {
        HTMLAttributes: {
            class: cn("leading-normal -mb-2"),
        },
    },
    blockquote: {
        HTMLAttributes: {
            class: cn("border-l-4 border-primary"),
        },
    },
    codeBlock: {
        HTMLAttributes: {
            class: cn("rounded bg-blue-50 dark:bg-gray-700 border p-5 font-mono font-medium", defaultBorderMixin),
        },
    },
    code: {
        HTMLAttributes: {
            class: cn("rounded-md bg-slate-50 dark:bg-gray-700 px-1.5 py-1 font-mono font-medium"),
            spellcheck: "false",
        },
    },
    horizontalRule: false,
    dropcursor: {
        color: "#DBEAFE",
        width: 4,
    },
    gapcursor: false,
});
