import React, { useEffect, useRef, useState, ReactNode } from "react";
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
    AutoFixHighIcon
} from "@firecms/ui";
import { setBlockType, wrapIn } from "prosemirror-commands";
import { wrapInList } from "prosemirror-schema-list";
import { schema } from "../schema";
import { EditorView } from "prosemirror-view";
import { EditorAIController } from "../types";
import { onFileRead, UploadFn } from "../extensions/Image";
import { textLoadingCommands } from "../extensions/TextLoadingDecorationExtension";

interface SuggestionItem {
    title: string;
    description: string;
    icon: ReactNode;
    searchTerms?: string[];
    command: (view: EditorView, range: { from: number; to: number }, upload: UploadFn, aiController?: EditorAIController) => void;
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

        // Insert text result at cursor
        view.dispatch(view.state.tr.insertText(result));
    }
};

export const SlashCommandMenu = ({ upload, aiController }: { upload: UploadFn, aiController?: EditorAIController }) => {
    const { view, state } = useProseMirrorContext();
    const menuRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

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
                    filteredItems[selectedIndex].command(view, range, upload, aiController);
                    view.focus();
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                // Close menu gracefully
                view.dispatch(view.state.tr.setMeta(SlashCommandPluginKey, { active: false }));
            }
        };

        const dom = view.dom;
        dom.addEventListener("keydown", handleKeyDown, { capture: true });
        return () => dom.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [isActive, selectedIndex, filteredItems, view, range, upload, aiController]);

    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        if (itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex]);

    if (!isActive || filteredItems.length === 0) return null;

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
                            item.command(view, range, upload, aiController);
                            view.focus();
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
