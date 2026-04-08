import { keymap } from "prosemirror-keymap";
import { history, undo, redo } from "prosemirror-history";
import { slashCommandPlugin } from "./slashCommandPlugin";
import { dragHandlePlugin, globalDragDropPlugin } from "../extensions/drag-and-drop";
import { baseKeymap, setBlockType, toggleMark, chainCommands, exitCode, joinUp, joinDown, lift, selectParentNode } from "prosemirror-commands";
import { highlightDecorationPlugin } from "../extensions/HighlightDecorationExtension";
import { textLoadingDecorationPlugin } from "../extensions/TextLoadingDecorationExtension";
import { splitListItem, liftListItem, sinkListItem } from "prosemirror-schema-list";
import { schema } from "../schema";
import { Plugin } from "prosemirror-state";
import { gapCursor } from "prosemirror-gapcursor";
import { dropCursor } from "prosemirror-dropcursor";
import { markdownInputRules } from "./inputrules";
import { placeholderPlugin } from "./placeholderPlugin";
import { goToNextCell } from "prosemirror-tables";

const customKeymap = {
    "Tab": goToNextCell(1),
    "Shift-Tab": goToNextCell(-1),
    "Mod-z": undo,
    "Mod-y": redo,
    "Shift-Mod-z": redo,
    "Mod-b": toggleMark(schema.marks.bold),
    "Mod-i": toggleMark(schema.marks.italic),
    "Mod-u": toggleMark(schema.marks.underline),
    "Mod-Shift-s": toggleMark(schema.marks.strike),
    "Mod-e": toggleMark(schema.marks.code),
    "Mod-Shift-h": toggleMark(schema.marks.highlight),

    "Enter": splitListItem(schema.nodes.list_item),
    "Shift-Enter": splitListItem(schema.nodes.task_item),

    "Mod-[": liftListItem(schema.nodes.list_item),
    "Mod-]": sinkListItem(schema.nodes.list_item),

    "Shift-Mod-8": setBlockType(schema.nodes.bullet_list),
    "Shift-Mod-9": setBlockType(schema.nodes.ordered_list),

    "Mod-Alt-1": setBlockType(schema.nodes.heading, { level: 1 }),
    "Mod-Alt-2": setBlockType(schema.nodes.heading, { level: 2 }),
    "Mod-Alt-3": setBlockType(schema.nodes.heading, { level: 3 }),

    "Mod-Alt-0": setBlockType(schema.nodes.paragraph),
};

export const corePlugins: Plugin[] = [
    history(),
    keymap(customKeymap),
    keymap(baseKeymap),
    globalDragDropPlugin(),
    gapCursor(),
    slashCommandPlugin(),
    dragHandlePlugin(),
    highlightDecorationPlugin(),
    textLoadingDecorationPlugin(),
    markdownInputRules,
    placeholderPlugin("Press '/' for commands")
];
