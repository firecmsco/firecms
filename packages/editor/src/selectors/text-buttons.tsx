import { EditorBubbleItem, useEditor } from "../components";
import type { SelectorItem } from "./node-selector";
import {
    Button,
    cls,
    CodeIcon,
    FormatBoldIcon,
    FormatItalicIcon,
    FormatStrikethroughIcon,
    FormatUnderlinedIcon
} from "@firecms/ui";

export const TextButtons = () => {
    const { editor } = useEditor();
    if (!editor) return null;
    const items: SelectorItem[] = [
        {
            name: "bold",
            labelKey: "editor_bold",
            isActive: (editor) => editor?.isActive("bold") ?? false,
            command: (editor) => editor?.chain().focus().toggleBold().run(),
            icon: FormatBoldIcon,
        },
        {
            name: "italic",
            labelKey: "editor_italic",
            isActive: (editor) => editor?.isActive("italic") ?? false,
            command: (editor) => editor?.chain().focus().toggleItalic().run(),
            icon: FormatItalicIcon,
        },
        {
            name: "underline",
            labelKey: "editor_underline",
            isActive: (editor) => editor?.isActive("underline") ?? false,
            command: (editor) => editor?.chain().focus().toggleUnderline().run(),
            icon: FormatUnderlinedIcon,
        },
        {
            name: "strike",
            labelKey: "editor_strikethrough",
            isActive: (editor) => editor?.isActive("strike") ?? false,
            command: (editor) => editor?.chain().focus().toggleStrike().run(),
            icon: FormatStrikethroughIcon,
        },
        {
            name: "code",
            labelKey: "editor_code",
            isActive: (editor) => editor?.isActive("code") ?? false,
            command: (editor) => editor?.chain().focus().toggleCode().run(),
            icon: CodeIcon,
        },
    ];
    return (
        <div className="flex">
            {items.map((item, index) => (
                <EditorBubbleItem
                    key={index}
                    onSelect={(editor) => {
                        item.command(editor);
                    }}
                >
                    <Button size={"small"}
                            color="text"
                            className="gap-2 rounded-none h-full"
                            variant="text">
                        <item.icon
                            className={cls( {
                                "text-inherit": !item.isActive(editor),
                                "text-blue-500": item.isActive(editor),
                            })}
                        />
                    </Button>
                </EditorBubbleItem>
            ))}
        </div>
    );
};
