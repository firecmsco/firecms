import React, { useEffect, useRef, useState, ReactNode } from "react";
import { Fragment, DOMParser } from "prosemirror-model";
import { useProseMirrorContext } from "../hooks/useProseMirrorContext";
import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { SlashCommandPluginKey } from "../plugins/slashCommandPlugin";
import {
    cls,
    defaultBorderMixin,
    TextFieldsIcon,
    CheckBoxIcon,
    LooksOneIcon,
    LooksTwoIcon,
    Looks3Icon,
    FormatListBulletedIcon,
    FormatListNumberedIcon,
    FormatQuoteIcon,
    CodeIcon,
    ImageIcon,
    AutoFixHighIcon,
    TableChartIcon
} from "@firecms/ui";
import { setBlockType, wrapIn } from "prosemirror-commands";
import { wrapInList } from "prosemirror-schema-list";
import { schema } from "../schema";
import { EditorView } from "prosemirror-view";
import { TextSelection } from "prosemirror-state";
import { EditorAIController } from "../types";
import { onFileRead, UploadFn } from "../extensions/Image";
import { textLoadingCommands } from "../extensions/TextLoadingDecorationExtension";
import { parser } from "../markdown";

interface SuggestionItem {
    title: string;
    description: string;
    icon: ReactNode;
    searchTerms?: string[];
    command: (
        view: EditorView, 
        range: { from: number; to: number }, 
        upload: UploadFn, 
        aiController?: EditorAIController,
        setSubView?: (viewId: string | null) => void
    ) => void;
}

const suggestionItems: SuggestionItem[] = [
    {
        title: "Text",
        description: "Just start typing with plain text.",
        searchTerms: ["p", "paragraph"],
        icon: <TextFieldsIcon size={18} />,
        command: (view, range) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));
            setBlockType(schema.nodes.paragraph)(view.state, view.dispatch);
        }
    },
    {
        title: "To-do List",
        description: "Track tasks with a to-do list.",
        searchTerms: ["todo", "task", "list", "check", "checkbox"],
        icon: <CheckBoxIcon size={18} />,
        command: (view, range) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));
            wrapInList(schema.nodes.task_list)(view.state, view.dispatch);
        }
    },
    {
        title: "Heading 1",
        description: "Big section heading.",
        searchTerms: ["title", "big", "large"],
        icon: <LooksOneIcon size={18} />,
        command: (view, range) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));
            setBlockType(schema.nodes.heading, { level: 1 })(view.state, view.dispatch);
        }
    },
    {
        title: "Heading 2",
        description: "Medium section heading.",
        searchTerms: ["subtitle", "medium"],
        icon: <LooksTwoIcon size={18} />,
        command: (view, range) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));
            setBlockType(schema.nodes.heading, { level: 2 })(view.state, view.dispatch);
        }
    },
    {
        title: "Heading 3",
        description: "Small section heading.",
        searchTerms: ["subtitle", "small"],
        icon: <Looks3Icon size={18} />,
        command: (view, range) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));
            setBlockType(schema.nodes.heading, { level: 3 })(view.state, view.dispatch);
        }
    },
    {
        title: "Bullet List",
        description: "Create a simple bullet list.",
        searchTerms: ["unordered", "point"],
        icon: <FormatListBulletedIcon size={18} />,
        command: (view, range) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));
            wrapInList(schema.nodes.bullet_list)(view.state, view.dispatch);
        }
    },
    {
        title: "Numbered List",
        description: "Create a list with numbering.",
        searchTerms: ["ordered"],
        icon: <FormatListNumberedIcon size={18} />,
        command: (view, range) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));
            wrapInList(schema.nodes.ordered_list)(view.state, view.dispatch);
        }
    },
    {
        title: "Quote",
        description: "Capture a quote.",
        searchTerms: ["blockquote"],
        icon: <FormatQuoteIcon size={18} />,
        command: (view, range) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));
            wrapIn(schema.nodes.blockquote)(view.state, view.dispatch);
        }
    },
    {
        title: "Code",
        description: "Capture a code snippet.",
        searchTerms: ["codeblock"],
        icon: <CodeIcon size={18} />,
        command: (view, range) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));
            setBlockType(schema.nodes.code_block)(view.state, view.dispatch);
        }
    },
    {
        title: "Image",
        description: "Upload an image from your computer.",
        searchTerms: ["photo", "picture", "media", "upload", "file"],
        icon: <ImageIcon size={18} />,
        command: (view, range, upload) => {
            view.dispatch(view.state.tr.deleteRange(range.from, range.to));

            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
                if (input.files?.length) {
                    const file = input.files[0];
                    if (!file) return;
                    const pos = view.state.selection.from;

                    const images = Array.from(input.files).filter(f => /image/i.test(f.type));
                    if (images.length === 0) return false;

                    images.forEach(image => {
                        const reader = new FileReader();
                        reader.onload = async (readerEvent) => {
                            await onFileRead(view, readerEvent, pos, upload, image);
                        };
                        reader.readAsDataURL(image);
                    });
                }
                return true;
            };
            input.click();
        }
    },
    {
        title: "Table",
        description: "Insert a custom grid table.",
        searchTerms: ["table", "grid", "row", "col"],
        icon: <TableChartIcon size={18} />,
        command: (view, range, upload, aiController, setSubView) => {
            if (setSubView) setSubView("table-grid");
        }
    }
];

const autocompleteSuggestionItem: SuggestionItem = {
    title: "Autocomplete",
    description: "Add text based on the context.",
    searchTerms: ["ai"],
    icon: <AutoFixHighIcon size={18} />,
    command: async (view, range, upload, aiController) => {
        if (!aiController) throw Error("No AiController");

        view.dispatch(view.state.tr.deleteRange(range.from, range.to));
        setBlockType(schema.nodes.paragraph)(view.state, view.dispatch);

        const { state } = view;
        const { from, to } = state.selection;

        const textBeforeCursor = state.doc.textBetween(0, from, "\n");
        const textAfterCursor = state.doc.textBetween(to, state.doc.content.size, "\n");

        let buffer = "";
        const result = await aiController.autocomplete(textBeforeCursor, textAfterCursor, (delta) => {
            buffer += delta;
            if (delta.length !== 0) {
                textLoadingCommands.toggleLoadingDecoration(view.state, view.dispatch, buffer);
            }
        });

        // Insert parsed text result at cursor natively
        try {
            // The AI controller might stream literal "\n" characters depending on its JSON decoding layer.
            // We need to un-escape these back to genuine newlines so MarkdownIt block-parsing works.
            const unescapedResult = result.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

            const isHTML = /<\/?[a-z][\s\S]*>/i.test(unescapedResult);
            let parsedDoc;

            if (isHTML) {
                const div = document.createElement("div");
                div.innerHTML = unescapedResult;
                parsedDoc = DOMParser.fromSchema(view.state.schema).parse(div);
            } else {
                parsedDoc = parser.parse(unescapedResult);
            }

            if (parsedDoc) {
                const tr = view.state.tr.replaceWith(view.state.selection.from, view.state.selection.from, parsedDoc.content);
                view.dispatch(tr);
            } else {
                view.dispatch(view.state.tr.insertText(unescapedResult));
            }
        } catch (e) {
            console.error(e);
            view.dispatch(view.state.tr.insertText(result));
        }
    }
};

export const SlashCommandMenu = ({ upload, aiController }: { upload: UploadFn, aiController?: EditorAIController }) => {
    const { view, state } = useProseMirrorContext();
    const menuRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [subView, setSubView] = useState<string | null>(null);
    const [tableGridCoords, setTableGridCoords] = useState({ r: 0, c: 0 });

    const pluginState = state ? SlashCommandPluginKey.getState(state) : null;
    const isActive = pluginState?.active;
    const query = pluginState?.query || "";
    const range = pluginState?.range;

    const filteredItems = React.useMemo(() => {
        if (!isActive) return [];
        const availableItems = [...suggestionItems];
        if (aiController) availableItems.push(autocompleteSuggestionItem);

        return availableItems.filter(item => {
            const inTitle = item.title.toLowerCase().includes(query.toLowerCase());
            if (inTitle) return inTitle;
            return item.searchTerms?.some(term => term.toLowerCase().includes(query.toLowerCase()));
        });
    }, [query, isActive, aiController]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (!isActive) setSubView(null);
    }, [isActive]);

    useEffect(() => {
        if (!view || !isActive || !range || !menuRef.current) return;

        const start = view.coordsAtPos(range.from);
        const virtualEl = {
            getBoundingClientRect() {
                return {
                    width: 0,
                    height: start.bottom - start.top,
                    x: start.left,
                    y: start.top,
                    top: start.top,
                    left: start.left,
                    right: start.left,
                    bottom: start.bottom,
                };
            }
        };

        const cleanup = autoUpdate(virtualEl as any, menuRef.current, () => {
            if (!menuRef.current) return;
            computePosition(virtualEl as any, menuRef.current, {
                placement: "bottom-start",
                middleware: [offset(4), flip(), shift()],
                strategy: "fixed"
            }).then(({ x, y }) => {
                if (menuRef.current) {
                    Object.assign(menuRef.current.style, {
                        left: `${x}px`,
                        top: `${y}px`,
                        visibility: "visible",
                    });
                }
            });
        });
        return () => cleanup();
    }, [view, isActive, range]);

    useEffect(() => {
        if (!isActive || !view) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (subView === "table-grid") {
                if (e.key === "Escape") {
                    e.preventDefault(); e.stopPropagation();
                    setSubView(null);
                    setTableGridCoords({ r: 0, c: 0 });
                } else if (e.key === "ArrowUp") {
                    e.preventDefault(); e.stopPropagation();
                    setTableGridCoords(prev => ({ r: Math.max(0, prev.r - 1), c: prev.c }));
                } else if (e.key === "ArrowDown") {
                    e.preventDefault(); e.stopPropagation();
                    setTableGridCoords(prev => ({ r: Math.min(4, prev.r + 1), c: prev.c }));
                } else if (e.key === "ArrowLeft") {
                    e.preventDefault(); e.stopPropagation();
                    setTableGridCoords(prev => ({ r: prev.r, c: Math.max(0, prev.c - 1) }));
                } else if (e.key === "ArrowRight") {
                    e.preventDefault(); e.stopPropagation();
                    setTableGridCoords(prev => ({ r: prev.r, c: Math.min(4, prev.c + 1) }));
                } else if (e.key === "Enter") {
                    e.preventDefault(); e.stopPropagation();
                    if (range) {
                        const tableNode = createTableNode(view.state.schema, tableGridCoords.r + 1, tableGridCoords.c + 1);
                        const tr = view.state.tr.replaceWith(range.from, range.to, tableNode);
                        try {
                            const selection = TextSelection.create(tr.doc, range.from + 4);
                            tr.setSelection(selection);
                        } catch (e) {
                            console.warn("Could not select first cell", e);
                        }
                        tr.setMeta(SlashCommandPluginKey, { active: false });
                        view.dispatch(tr);
                        view.focus();
                        setSubView(null);
                        setTableGridCoords({ r: 0, c: 0 });
                    }
                }
                return;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();
                setSelectedIndex(prev => (prev + filteredItems.length - 1) % filteredItems.length);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                e.stopPropagation();
                setSelectedIndex(prev => (prev + 1) % filteredItems.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                if (filteredItems[selectedIndex] && range) {
                    filteredItems[selectedIndex].command(view, range, upload, aiController, setSubView);
                    // Do not focus view if a subview opened
                    setTimeout(() => {
                        // Focus is managed by the caller
                    }, 0);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                // Close menu gracefully and keep it dismissed
                view.dispatch(view.state.tr.setMeta(SlashCommandPluginKey, { active: false, dismissed: true }));
            }
        };

        const dom = view.dom;
        dom.addEventListener("keydown", handleKeyDown, { capture: true });
        return () => dom.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [isActive, selectedIndex, filteredItems, view, range, upload, aiController, subView, tableGridCoords]);

    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        if (itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex]);

    useEffect(() => {
        if (!subView) {
            setTableGridCoords({ r: 0, c: 0 });
        }
    }, [subView]);

    if (!isActive || filteredItems.length === 0) return null;

    if (subView === "table-grid" && range && view) {
        return (
            <div
                ref={menuRef}
                onMouseDown={(e) => e.preventDefault()}
                style={{ position: "fixed", zIndex: 9999, visibility: "hidden" }}
                className={cls("text-surface-900 dark:text-white rounded-md border bg-white dark:bg-surface-900 p-2 shadow transition-none", defaultBorderMixin)}
            >
                <TableGridPicker
                    hoveredRow={tableGridCoords.r}
                    hoveredCol={tableGridCoords.c}
                    onHover={(r, c) => setTableGridCoords({ r, c })}
                    onSelect={(rows, cols) => {
                        const tableNode = createTableNode(view.state.schema, rows, cols);
                        const tr = view.state.tr.replaceWith(range.from, range.to, tableNode);
                        try {
                            const selection = TextSelection.create(tr.doc, range.from + 4);
                            tr.setSelection(selection);
                        } catch (e) {
                            console.warn("Could not select first cell", e);
                        }
                        tr.setMeta(SlashCommandPluginKey, { active: false });
                        view.dispatch(tr);
                        view.focus();
                        setSubView(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div
            ref={menuRef}
            style={{ position: "fixed", zIndex: 9999, visibility: "hidden" }}
            className={cls("text-surface-900 dark:text-white max-h-[280px] w-72 overflow-y-auto rounded-md border bg-white dark:bg-surface-900 px-1 py-2 shadow transition-none", defaultBorderMixin)}
        >
            {filteredItems.map((item, index) => (
                <button
                    key={item.title}
                    ref={el => { itemRefs.current[index] = el; }}
                    onClick={(e) => {
                        e.preventDefault();
                        if (range && view) {
                            item.command(view, range, upload, aiController, setSubView);
                            // Only focus back to editor if it didn't open a sub-view
                            if (!subView) view.focus();
                        }
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cls("flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-blue-50 hover:dark:bg-surface-700",
                        index === selectedIndex ? "bg-blue-100 dark:bg-surface-accent-950" : "")}
                >
                    <div className={cls("flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-white dark:bg-surface-900", defaultBorderMixin)}>
                        {item.icon}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-xs text-surface-700 dark:text-surface-accent-300 truncate">
                            {item.description}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
};

const createTableNode = (schema: any, rowsCount: number, colsCount: number) => {
    const rows = [];
    for (let r = 0; r < rowsCount; r++) {
        const cells = [];
        for (let c = 0; c < colsCount; c++) {
            const isHeader = r === 0;
            const cellType = isHeader ? schema.nodes.table_header : schema.nodes.table_cell;
            const cell = cellType.createAndFill();
            if (cell) cells.push(cell);
        }
        const row = schema.nodes.table_row.create(null, Fragment.from(cells));
        rows.push(row);
    }
    return schema.nodes.table.create(null, Fragment.from(rows));
};

const TableGridPicker = ({ 
    hoveredRow, 
    hoveredCol, 
    onHover, 
    onSelect 
}: { 
    hoveredRow: number; 
    hoveredCol: number; 
    onHover: (r: number, c: number) => void;
    onSelect: (r: number, c: number) => void; 
}) => {
    return (
        <div className="flex flex-col gap-1 items-center justify-center p-1 w-fit">
            <span className="text-xs text-gray-500 font-medium mb-1">
                {hoveredCol + 1} x {hoveredRow + 1} Table
            </span>
            <div className="flex flex-col gap-1">
                {Array.from({ length: 5 }).map((_, r) => (
                    <div key={r} className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, c) => (
                            <div
                                key={c}
                                className={cls(
                                    "w-5 h-5 border rounded-sm cursor-pointer transition-colors duration-75",
                                    r <= hoveredRow && c <= hoveredCol 
                                        ? "bg-blue-100 border-blue-400 dark:bg-blue-900 dark:border-blue-500" 
                                        : "bg-white dark:bg-surface-800 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                                )}
                                onMouseEnter={() => onHover(r, c)}
                                onClick={() => onSelect(hoveredRow + 1, hoveredCol + 1)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
