import { EditorState, Transaction } from "prosemirror-state";
import { EditorBubbleItem } from "../components";
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
import { useProseMirrorContext } from "../hooks/useProseMirrorContext";
import { isMarkActive } from "../utils/prosemirror-utils";
import { schema } from "../schema";
import { toggleMark } from "prosemirror-commands";

export const TextButtons = () => {
    const { state, view } = useProseMirrorContext();
    if (!state || !view) return null;

    // We pass state directly to isActive, and dispatch to command
    const items = [
        {
            name: "bold",
            isActive: (s: EditorState) => isMarkActive(s, schema.marks.bold),
            command: (s: EditorState, dispatch: (tr: Transaction) => void) => toggleMark(schema.marks.bold)(s, dispatch),
            icon: FormatBoldIcon,
        },
        {
            name: "italic",
            isActive: (s: EditorState) => isMarkActive(s, schema.marks.italic),
            command: (s: EditorState, dispatch: (tr: Transaction) => void) => toggleMark(schema.marks.italic)(s, dispatch),
            icon: FormatItalicIcon,
        },
        {
            name: "underline",
            isActive: (s: EditorState) => isMarkActive(s, schema.marks.underline),
            command: (s: EditorState, dispatch: (tr: Transaction) => void) => toggleMark(schema.marks.underline)(s, dispatch),
            icon: FormatUnderlinedIcon,
        },
        {
            name: "strike",
            isActive: (s: EditorState) => isMarkActive(s, schema.marks.strike),
            command: (s: EditorState, dispatch: (tr: Transaction) => void) => toggleMark(schema.marks.strike)(s, dispatch),
            icon: FormatStrikethroughIcon,
        },
        {
            name: "code",
            isActive: (s: EditorState) => isMarkActive(s, schema.marks.code),
            command: (s: EditorState, dispatch: (tr: Transaction) => void) => toggleMark(schema.marks.code)(s, dispatch),
            icon: CodeIcon,
        },
    ];

    return (
        <div className="flex">
            {items.map((item, index) => (
                <EditorBubbleItem
                    key={index}
                    onSelect={() => {
                        item.command(view.state, view.dispatch);
                        view.focus();
                    }}
                >
                    <Button size={"small"}
                        color="text"
                        className="gap-2 rounded-none h-full"
                        variant="text">
                        <item.icon
                            className={cls({
                                "text-inherit": !item.isActive(state),
                                "text-blue-500": item.isActive(state),
                            })}
                        />
                    </Button>
                </EditorBubbleItem>
            ))}
        </div>
    );
};
