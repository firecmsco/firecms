import type { Dispatch, SetStateAction } from "react";
import { EditorBubbleItem } from "../components";
import { Button, CheckIcon, KeyboardArrowDownIcon, Popover } from "@rebasepro/ui";
import { useProseMirrorContext } from "../hooks/useProseMirrorContext";
import { isMarkActive, getMarkAttributes, setMark, unsetMark } from "../utils/prosemirror-utils";
import { schema } from "../schema";

export interface BubbleColorMenuItem {
    name: string;
    color: string;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
    {
        name: "Default",
        color: "black",
    },
    {
        name: "Purple",
        color: "#9333EA",
    },
    {
        name: "Red",
        color: "#E00000",
    },
    {
        name: "Yellow",
        color: "#EAB308",
    },
    {
        name: "Blue",
        color: "#2563EB",
    },
    {
        name: "Green",
        color: "#008A00",
    },
    {
        name: "Orange",
        color: "#FFA500",
    },
    {
        name: "Pink",
        color: "#BA4081",
    },
    {
        name: "Gray",
        color: "#A8A29E",
    },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
    {
        name: "Default",
        color: "inherit",
    },
    {
        name: "Purple",
        color: "#9333EA",
    },
    {
        name: "Red",
        color: "#E00000",
    },
    {
        name: "Yellow",
        color: "#EAB308",
    },
    {
        name: "Blue",
        color: "#2563EB",
    },
    {
        name: "Green",
        color: "#008A00",
    },
    {
        name: "Orange",
        color: "#FFA500",
    },
    {
        name: "Pink",
        color: "#BA4081",
    },
    {
        name: "Gray",
        color: "#A8A29E",
    },
];

interface ColorSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ColorSelector = ({
    open,
    onOpenChange
}: ColorSelectorProps) => {

    const { state, view } = useProseMirrorContext();

    if (!state || !view) return null;

    const currentTextColor = getMarkAttributes(state, schema.marks.textStyle).color;
    const currentHighlightColor = getMarkAttributes(state, schema.marks.highlight).color;

    const activeColorItem = TEXT_COLORS.find(({ color }) => color === currentTextColor);
    const activeHighlightItem = HIGHLIGHT_COLORS.find(({ color }) => color === currentHighlightColor);

    return (
        <Popover
            sideOffset={5}
            align={"start"}
            className="my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border p-1 shadow"
            trigger={
                <Button className="gap-2 rounded-none" variant="text" color={"text"}>
                    <span
                        className="rounded px-1"
                        style={{
                            color: activeColorItem?.color,
                            backgroundColor: activeHighlightItem?.color,
                        }}
                    >
                        A
                    </span>
                    <KeyboardArrowDownIcon size={"small"} />
                </Button>}
            modal={true} open={open} onOpenChange={onOpenChange}>


            <div className="flex flex-col">
                <div className="my-1 px-2 text-sm font-semibold text-surface-400 dark:text-surface-400">
                    Color
                </div>
                {TEXT_COLORS.map(({
                    name,
                    color
                }, index) => (
                    <EditorBubbleItem
                        key={index}
                        onSelect={() => {
                            unsetMark(schema.marks.textStyle)(view.state, view.dispatch);
                            if (name !== "Default") {
                                setMark(schema.marks.textStyle, { color })(view.state, view.dispatch);
                            }
                            view.focus();
                        }}
                        className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-surface-100 hover:dark:bg-surface-700"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="rounded border px-2 py-px font-medium"
                                style={{ color }}
                            >
                                A
                            </div>
                            <span>{name}</span>
                        </div>
                    </EditorBubbleItem>
                ))}
            </div>
            <div>
                <div className="my-1 px-2 text-sm font-semibold text-surface-400 dark:text-surface-400">
                    Background
                </div>
                {HIGHLIGHT_COLORS.map(({
                    name,
                    color
                }, index) => (
                    <EditorBubbleItem
                        key={index}
                        onSelect={() => {
                            unsetMark(schema.marks.highlight)(view.state, view.dispatch);
                            if (name !== "Default") {
                                setMark(schema.marks.highlight, { color })(view.state, view.dispatch);
                            }
                            view.focus();
                        }}
                        className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-surface-100 hover:dark:bg-surface-700"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="rounded border px-2 py-px font-medium"
                                style={{ backgroundColor: color }}
                            >
                                A
                            </div>
                            <span>{name}</span>
                        </div>
                        {currentHighlightColor === color && (
                            <CheckIcon className="h-4 w-4" />
                        )}
                    </EditorBubbleItem>
                ))}
            </div>

        </Popover>
    );
};
