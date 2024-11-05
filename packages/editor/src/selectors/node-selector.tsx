import React from "react";
import { EditorBubbleItem, useEditor } from "../components";

import {
    Button,
    CheckBoxIcon,
    CheckIcon,
    CodeIcon,
    ExpandMoreIcon,
    FormatListBulletedIcon,
    FormatListNumberedIcon,
    FormatQuoteIcon,
    Looks3Icon,
    LooksOneIcon,
    LooksTwoIcon,
    Popover,
    TextFieldsIcon
} from "@firecms/ui";

export type SelectorItem = {
    name: string;
    icon: React.ElementType;
    command: (editor: ReturnType<typeof useEditor>["editor"]) => void;
    isActive: (editor: ReturnType<typeof useEditor>["editor"]) => boolean;
};

const items: SelectorItem[] = [
    {
        name: "Text",
        icon: TextFieldsIcon,
        command: (editor) =>
            editor?.chain().focus().toggleNode("paragraph", "paragraph").run(),
        // I feel like there has to be a more efficient way to do this – feel free to PR if you know how!
        isActive: (editor) =>
            (editor?.isActive("paragraph") &&
                !editor?.isActive("bulletList") &&
                !editor?.isActive("orderedList")) ?? false,
    },
    {
        name: "Heading 1",
        icon: LooksOneIcon,
        command: (editor) =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: (editor) => editor?.isActive("heading", { level: 1 }) ?? false,
    },
    {
        name: "Heading 2",
        icon: LooksTwoIcon,
        command: (editor) =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: (editor) => editor?.isActive("heading", { level: 2 }) ?? false,
    },
    {
        name: "Heading 3",
        icon: Looks3Icon,
        command: (editor) =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: (editor) => editor?.isActive("heading", { level: 3 }) ?? false,
    },
    {
        name: "To-do List",
        icon: CheckBoxIcon,
        command: (editor) => editor?.chain().focus().toggleTaskList().run(),
        isActive: (editor) => editor?.isActive("taskItem") ?? false,
    },
    {
        name: "Bullet List",
        icon: FormatListBulletedIcon,
        command: (editor) => editor?.chain().focus().toggleBulletList().run(),
        isActive: (editor) => editor?.isActive("bulletList") ?? false,
    },
    {
        name: "Numbered List",
        icon: FormatListNumberedIcon,
        command: (editor) => editor?.chain().focus().toggleOrderedList().run(),
        isActive: (editor) => editor?.isActive("orderedList") ?? false,
    },
    {
        name: "Quote",
        icon: FormatQuoteIcon,
        command: (editor) => editor?.chain()
            .focus()
            .toggleNode("paragraph", "paragraph")
            .toggleBlockquote()
            .run(),
        isActive: (editor) => editor?.isActive("blockquote") ?? false,
    },
    {
        name: "Code",
        icon: CodeIcon,
        command: (editor) => editor?.chain().focus().toggleCodeBlock().run(),
        isActive: (editor) => editor?.isActive("codeBlock") ?? false,
    },
];

interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    portalContainer: HTMLElement | null;
}

export const NodeSelector = ({
                                 open,
                                 onOpenChange,
                                 portalContainer
                             }: NodeSelectorProps) => {
    const { editor } = useEditor();
    if (!editor) return null;
    const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
        name: "Multiple",
    };

    return (

        <Popover
            sideOffset={5}
            align="start"
            portalContainer={portalContainer}
            className="w-48 p-1"
            trigger={<Button variant="text"
                             className="gap-2 rounded-none"
                             color="text">
                <span className="whitespace-nowrap text-sm">{activeItem.name}</span>
                <ExpandMoreIcon size={"small"}/>
            </Button>}
            modal={true}
            open={open}
            onOpenChange={onOpenChange}>
            {items.map((item, index) => (
                <EditorBubbleItem
                    key={index}
                    onSelect={(editor) => {
                        item.command(editor);
                        onOpenChange(false);
                    }}
                    className="flex cursor-pointer items-center justify-between rounded px-2 py-1 text-sm hover:bg-blue-50 hover:dark:bg-surface-700 text-surface-900 dark:text-white"
                >
                    <div className="flex items-center space-x-2">
                        <item.icon size="smallest"/>
                        <span>{item.name}</span>
                    </div>
                    {activeItem.name === item.name && <CheckIcon size="smallest"/>}
                </EditorBubbleItem>
            ))}

        </Popover>
    );
};
