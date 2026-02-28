import React from "react";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorBubbleItem } from "../components";

import {
    Button,
    CheckBoxIcon,
    CheckIcon,
    CodeIcon,
    FormatListBulletedIcon,
    FormatListNumberedIcon,
    FormatQuoteIcon,
    KeyboardArrowDownIcon,
    Looks3Icon,
    LooksOneIcon,
    LooksTwoIcon,
    Popover,
    TextFieldsIcon
} from "@firecms/ui";
import { useProseMirrorContext } from "../hooks/useProseMirrorContext";
import { isNodeActive } from "../utils/prosemirror-utils";
import { schema } from "../schema";
import { setBlockType, wrapIn } from "prosemirror-commands";
import { wrapInList } from "prosemirror-schema-list";

export type SelectorItem = {
    name: string;
    icon: React.ElementType;
    command: (state: EditorState, dispatch: (tr: Transaction) => void) => void;
    isActive: (state: EditorState) => boolean;
};

const items: SelectorItem[] = [
    {
        name: "Text",
        icon: TextFieldsIcon,
        command: (state, dispatch) => setBlockType(schema.nodes.paragraph)(state, dispatch),
        isActive: (state) =>
            isNodeActive(state, schema.nodes.paragraph) &&
            !isNodeActive(state, schema.nodes.bullet_list) &&
            !isNodeActive(state, schema.nodes.ordered_list),
    },
    {
        name: "Heading 1",
        icon: LooksOneIcon,
        command: (state, dispatch) => setBlockType(schema.nodes.heading, { level: 1 })(state, dispatch),
        isActive: (state) => isNodeActive(state, schema.nodes.heading, { level: 1 }),
    },
    {
        name: "Heading 2",
        icon: LooksTwoIcon,
        command: (state, dispatch) => setBlockType(schema.nodes.heading, { level: 2 })(state, dispatch),
        isActive: (state) => isNodeActive(state, schema.nodes.heading, { level: 2 }),
    },
    {
        name: "Heading 3",
        icon: Looks3Icon,
        command: (state, dispatch) => setBlockType(schema.nodes.heading, { level: 3 })(state, dispatch),
        isActive: (state) => isNodeActive(state, schema.nodes.heading, { level: 3 }),
    },
    {
        name: "To-do List",
        icon: CheckBoxIcon,
        command: (state, dispatch) => wrapInList(schema.nodes.task_list)(state, dispatch),
        isActive: (state) => isNodeActive(state, schema.nodes.task_item),
    },
    {
        name: "Bullet List",
        icon: FormatListBulletedIcon,
        command: (state, dispatch) => wrapInList(schema.nodes.bullet_list)(state, dispatch),
        isActive: (state) => isNodeActive(state, schema.nodes.bullet_list),
    },
    {
        name: "Numbered List",
        icon: FormatListNumberedIcon,
        command: (state, dispatch) => wrapInList(schema.nodes.ordered_list)(state, dispatch),
        isActive: (state) => isNodeActive(state, schema.nodes.ordered_list),
    },
    {
        name: "Quote",
        icon: FormatQuoteIcon,
        command: (state, dispatch) => wrapIn(schema.nodes.blockquote)(state, dispatch),
        isActive: (state) => isNodeActive(state, schema.nodes.blockquote),
    },
    {
        name: "Code",
        icon: CodeIcon,
        command: (state, dispatch) => setBlockType(schema.nodes.code_block)(state, dispatch),
        isActive: (state) => isNodeActive(state, schema.nodes.code_block),
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
    const { state, view } = useProseMirrorContext();
    if (!state || !view) return null;

    const activeItem = items.filter((item) => item.isActive(state)).pop() ?? {
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
                <KeyboardArrowDownIcon size={"small"} />
            </Button>}
            modal={true}
            open={open}
            onOpenChange={onOpenChange}>
            {items.map((item, index) => (
                <EditorBubbleItem
                    key={index}
                    onSelect={() => {
                        item.command(view.state, view.dispatch);
                        view.focus();
                        onOpenChange(false);
                    }}
                    className="flex cursor-pointer items-center justify-between rounded px-2 py-1 text-sm hover:bg-blue-50 hover:dark:bg-surface-700 text-surface-900 dark:text-white"
                >
                    <div className="flex items-center space-x-2">
                        <item.icon size="smallest" />
                        <span>{item.name}</span>
                    </div>
                    {activeItem.name === item.name && <CheckIcon size="smallest" />}
                </EditorBubbleItem>
            ))}
        </Popover>
    );
};
