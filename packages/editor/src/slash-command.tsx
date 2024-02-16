// import {
//   CheckSquare,
//   Code,
//   Heading1,
//   Heading2,
//   Heading3,
//   ImageIcon,
//   List,
//   ListOrdered,
//   MessageSquarePlus,
//   Text,
//   TextQuote,
// } from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "./extensions";
import { startImageUpload } from "./plugins";
import {
    AddCommentIcon,
    CheckBoxIcon,
    CodeIcon,
    FormatListBulletedIcon,
    FormatListNumberedIcon,
    FormatQuoteIcon,
    ImageIcon,
    Looks3Icon,
    LooksOneIcon,
    LooksTwoIcon,
    TextFieldsIcon
} from "@firecms/ui";

export const suggestionItems = createSuggestionItems([
    {
        title: "Send Feedback",
        description: "Let us know how we can improve.",
        icon: <AddCommentIcon size={18}/>,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            window.open("/feedback", "_blank");
        },
    },
    {
        title: "Text",
        description: "Just start typing with plain text.",
        searchTerms: ["p", "paragraph"],
        icon: <TextFieldsIcon size={18}/>,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleNode("paragraph", "paragraph")
                .run();
        },
    },
    {
        title: "To-do List",
        description: "Track tasks with a to-do list.",
        searchTerms: ["todo", "task", "list", "check", "checkbox"],
        icon: <CheckBoxIcon size={18}/>,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        },
    },
    {
        title: "Heading 1",
        description: "Big section heading.",
        searchTerms: ["title", "big", "large"],
        icon: <LooksOneIcon size={18}/>,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 1 })
                .run();
        },
    },
    {
        title: "Heading 2",
        description: "Medium section heading.",
        searchTerms: ["subtitle", "medium"],
        icon: <LooksTwoIcon size={18}/>,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 2 })
                .run();
        },
    },
    {
        title: "Heading 3",
        description: "Small section heading.",
        searchTerms: ["subtitle", "small"],
        icon: <Looks3Icon size={18}/>,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 3 })
                .run();
        },
    },
    {
        title: "Bullet List",
        description: "Create a simple bullet list.",
        searchTerms: ["unordered", "point"],
        icon: <FormatListBulletedIcon size={18}/>,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: "Numbered List",
        description: "Create a list with numbering.",
        searchTerms: ["ordered"],
        icon: <FormatListNumberedIcon size={18}/>,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: "Quote",
        description: "Capture a quote.",
        searchTerms: ["blockquote"],
        icon: <FormatQuoteIcon size={18}/>,
        command: ({ editor, range }) =>
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleNode("paragraph", "paragraph")
                .toggleBlockquote()
                .run(),
    },
    {
        title: "Code",
        description: "Capture a code snippet.",
        searchTerms: ["codeblock"],
        icon: <CodeIcon size={18}/>,
        command: ({ editor, range }) =>
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
        title: "Image",
        description: "Upload an image from your computer.",
        searchTerms: ["photo", "picture", "media"],
        icon: <ImageIcon size={18}/>,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).run();
            // upload image
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
                if (input.files?.length) {
                    const file = input.files[0];
                    if (!file) return;
                    const pos = editor.view.state.selection.from;
                    startImageUpload(file, editor.view, pos);
                }
            };
            input.click();
        },
    },
]);

export const slashCommand = Command.configure({
    suggestion: {
        items: () => suggestionItems,
        render: renderItems,
    },
});
