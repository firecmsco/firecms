import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from "react"
import { Editor, mergeAttributes, Node, Range, ReactRenderer, useCurrentEditor } from "@tiptap/react";
import { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model"
import { PluginKey } from "@tiptap/pm/state"
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";

import {
    AutoAwesomeIcon,
    CheckBoxIcon,
    cls,
    CodeIcon,
    defaultBorderMixin,
    FormatListBulletedIcon,
    FormatListNumberedIcon,
    FormatQuoteIcon,
    ImageIcon,
    Looks3Icon,
    LooksOneIcon,
    LooksTwoIcon,
    TextFieldsIcon
} from "@firecms/ui"
import tippy from "tippy.js"
import { onFileRead, UploadFn } from "./Image";
import { EditorAIController } from "../types";

// See `addAttributes` below
export interface CommandNodeAttrs {
    /**
     * The identifier for the selected item that was mentioned, stored as a `data-id`
     * attribute.
     */
    id: string | null;
    /**
     * The label to be rendered by the editor as the displayed text for this mentioned
     * item, if provided. Stored as a `data-label` attribute. See `renderLabel`.
     */
    label?: string | null;
}

export type CommandOptions<SuggestionItem = any, Attrs extends Record<string, any> = CommandNodeAttrs> = {
    /**
     * The HTML attributes for a command node.
     * @default {}
     * @example { class: 'foo' }
     */
    HTMLAttributes: Record<string, any>

    /**
     * A function to render the label of a command.
     * @deprecated use renderText and renderHTML instead
     * @param props The render props
     * @returns The label
     * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
     */
    renderLabel?: (props: { options: CommandOptions<SuggestionItem, Attrs>; node: ProseMirrorNode }) => string

    /**
     * A function to render the text of a command.
     * @param props The render props
     * @returns The text
     * @example ({ options, node }) => `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
     */
    renderText: (props: { options: CommandOptions<SuggestionItem, Attrs>; node: ProseMirrorNode }) => string

    /**
     * A function to render the HTML of a command.
     * @param props The render props
     * @returns The HTML as a ProseMirror DOM Output Spec
     * @example ({ options, node }) => ['span', { 'data-type': 'command' }, `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`]
     */
    renderHTML: (props: { options: CommandOptions<SuggestionItem, Attrs>; node: ProseMirrorNode }) => DOMOutputSpec

    /**
     * Whether to delete the trigger character with backspace.
     * @default false
     */
    deleteTriggerWithBackspace: boolean

    /**
     * The suggestion options.
     * @default {}
     * @example { char: '@', pluginKey: CommandPluginKey, command: ({ editor, range, props }) => { ... } }
     */
    suggestion: Omit<SuggestionOptions<SuggestionItem, Attrs>, "editor">
}

/**
 * The plugin key for the command plugin.
 * @default 'command'
 */
export const CommandPluginKey = new PluginKey("slash-command")

export const SlashCommand = Node.create<CommandOptions>({
    name: "command",

    addOptions() {
        return {
            HTMLAttributes: {},
            renderText({
                           options,
                           node
                       }) {
                return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
            },
            deleteTriggerWithBackspace: false,
            renderHTML({
                           options,
                           node
                       }) {
                return [
                    "span",
                    mergeAttributes(this.HTMLAttributes, options.HTMLAttributes),
                    `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
                ]
            },
            suggestion: {
                char: "/",
                pluginKey: CommandPluginKey,
                command: ({
                              editor,
                              range,
                              props
                          }) => {
                    // increase range.to by one when the next node is of type "text"
                    // and starts with a space character
                    const nodeAfter = editor.view.state.selection.$to.nodeAfter
                    const overrideSpace = nodeAfter?.text?.startsWith(" ")

                    if (overrideSpace) {
                        range.to += 1
                    }

                    editor
                        .chain()
                        .focus()
                        .insertContentAt(range, [
                            {
                                type: this.name,
                                attrs: props
                            },
                            {
                                type: "text",
                                text: " "
                            }
                        ])
                        .run()

                    window.getSelection()?.collapseToEnd()
                },
                allow: ({
                            state,
                            range
                        }) => {
                    const $from = state.doc.resolve(range.from)
                    const type = state.schema.nodes[this.name]
                    const allow = !!$from.parent.type.contentMatch.matchType(type)

                    return allow
                }
            }
        }
    },

    group: "inline",

    inline: true,

    selectable: false,

    atom: true,

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute("data-id"),
                renderHTML: attributes => {
                    if (!attributes.id) {
                        return {}
                    }

                    return {
                        "data-id": attributes.id
                    }
                }
            },

            label: {
                default: null,
                parseHTML: element => element.getAttribute("data-label"),
                renderHTML: attributes => {
                    if (!attributes.label) {
                        return {}
                    }

                    return {
                        "data-label": attributes.label
                    }
                }
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: `span[data-type="${this.name}"]`
            }
        ]
    },

    renderHTML({
                   node,
                   HTMLAttributes
               }) {
        if (this.options.renderLabel !== undefined) {
            console.warn("renderLabel is deprecated use renderText and renderHTML instead")
            return [
                "span",
                mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes),
                this.options.renderLabel({
                    options: this.options,
                    node
                })
            ]
        }
        const mergedOptions = { ...this.options }

        mergedOptions.HTMLAttributes = mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes)
        const html = this.options.renderHTML({
            options: mergedOptions,
            node
        })

        if (typeof html === "string") {
            return [
                "span",
                mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes),
                html
            ]
        }
        return html
    },

    renderText({ node }) {
        return this.options.renderText({
            options: this.options,
            node
        })
    },

    addKeyboardShortcuts() {
        return {
            Backspace: () => this.editor.commands.command(({
                                                               tr,
                                                               state
                                                           }) => {
                let isCommand = false
                const { selection } = state
                const {
                    empty,
                    anchor
                } = selection

                if (!empty) {
                    return false
                }

                state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
                    if (node.type.name === this.name) {
                        isCommand = true
                        tr.insertText(
                            this.options.deleteTriggerWithBackspace ? "" : this.options.suggestion.char || "",
                            pos,
                            pos + node.nodeSize
                        )

                        return false
                    }
                    return true
                })

                return isCommand
            })
        }
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion
            })
        ]
    }
});

export interface SuggestionItem {
    title: string;
    description: string;
    icon: ReactNode;
    searchTerms?: string[];
    command?: (props: { editor: Editor; range: Range, upload: UploadFn, aiController?: EditorAIController }) => void;
}

export const suggestion = (ref: React.MutableRefObject<any>, {
    upload,
    onDisabledAutocompleteClick,
    aiController
}: {
    upload: UploadFn,
    onDisabledAutocompleteClick?: () => void,
    aiController?: EditorAIController
}): Omit<SuggestionOptions<SuggestionItem, any>, "editor"> =>
    ({
            items: ({ query }) => {
                const availableSuggestionItems = [...suggestionItems];
                if (!onDisabledAutocompleteClick && aiController) {
                    availableSuggestionItems.push(autocompleteSuggestionItem)
                }
                if (onDisabledAutocompleteClick) {
                    availableSuggestionItems.push({
                        title: "Autocomplete",
                        description: "Add text based on the context.",
                        searchTerms: ["ai"],
                        icon: <AutoAwesomeIcon size={18}/>,
                        command: onDisabledAutocompleteClick
                    })
                }

                return availableSuggestionItems
                    .filter(item => {
                        const inTitle = item.title.toLowerCase().startsWith(query.toLowerCase());
                        if (inTitle) return inTitle;
                        const inSearchTerms = item.searchTerms?.some(term => term.toLowerCase().startsWith(query.toLowerCase()));
                        return inSearchTerms;
                    })
            },

            render: () => {
                let component: any;
                let popup: any;

                return {
                    onStart: (props) => {

                        component = new ReactRenderer(CommandList, {
                            props: {
                                ...props,
                                upload,
                                aiController
                            },
                            editor: props.editor,
                        })

                        if (!props.clientRect) {
                            return
                        }
                        // @ts-ignore
                        popup = tippy("body", {
                            getReferenceClientRect: props.clientRect,
                            appendTo: ref?.current,
                            content: component.element,
                            showOnCreate: true,
                            interactive: true,
                            trigger: "manual",
                            placement: "bottom-start"
                        });
                    },

                    onUpdate(props) {
                        component.updateProps(props)

                        if (!props.clientRect) {
                            return
                        }

                        popup[0].setProps({
                            getReferenceClientRect: props.clientRect
                        })
                    },

                    onKeyDown(props) {
                        if (props.event.key === "Escape") {
                            popup[0].hide()
                            props.event.preventDefault();
                            return true
                        }

                        return component.ref?.onKeyDown(props)
                    },

                    onExit() {
                        if (popup && popup[0])
                            popup[0].destroy()
                        component?.destroy()
                    }
                }
            }
        }
    );

const CommandList = forwardRef((props: {
    items: SuggestionItem[];
    query: string;
    range: Range;
    command: (props: { id: string }) => void;
    upload: UploadFn;
    aiController: EditorAIController;
}, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const { editor } = useCurrentEditor();
    const selectItem = (item?: SuggestionItem) => {
        if (!editor) return;
        item?.command?.({
            editor,
            range: props.range,
            upload: props.upload,
            aiController: props.aiController
        })
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        const item = props.items[selectedIndex]
        selectItem(item);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: React.KeyboardEvent }) => {
            if (event.key === "ArrowUp") {
                upHandler();
                return true;
            }
            if (event.key === "ArrowDown") {
                downHandler();
                return true;
            }
            if (event.key === "Enter") {
                enterHandler();
                return true;
            }
            return false;
        }
    }));

    const itemRefs = useRef<HTMLElement[]>([]);

    useEffect(() => {
        if (itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex].scrollIntoView({
                block: "nearest"
            });
        }
    }, [selectedIndex]);

    return (
        <div
            className={cls("text-gray-900 dark:text-white z-50 max-h-[280px] h-auto w-72 overflow-y-auto rounded-md border bg-white dark:bg-gray-900 px-1 py-2 shadow transition-all", defaultBorderMixin)}>
            {props.items.length ? (
                props.items.map((item, index) => (
                    <button
                        value={item.title}
                        ref={el => {
                            if (!el) return;
                            return itemRefs.current[index] = el;
                        }}
                        onClick={() => selectItem(item)}
                        tabIndex={index === selectedIndex ? 0 : -1}
                        aria-selected={index === selectedIndex}
                        className={cls("flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-blue-50 hover:dark:bg-gray-700 aria-selected:bg-blue-50 aria-selected:dark:bg-gray-700",
                            index === selectedIndex ? "bg-blue-100 dark:bg-slate-950" : "")}
                        key={item.title}
                    >
                        <div
                            className={cls("flex h-10 w-10 items-center justify-center rounded-md border bg-white dark:bg-gray-900", defaultBorderMixin)}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-gray-700 dark:text-slate-300">
                                {item.description}
                            </p>
                        </div>
                    </button>
                ))
            ) : (
                <div className="item">No result</div>
            )}
        </div>
    );
});

const autocompleteSuggestionItem: SuggestionItem = {
    title: "Autocomplete",
    description: "Add text based on the context.",
    searchTerms: ["ai"],
    icon: <AutoAwesomeIcon size={18}/>,
    command: async ({
                        editor,
                        range,
                        aiController
                    }) => {
        if (!aiController)
            throw Error("No AiController");

        editor
            .chain()
            .focus()
            .deleteRange(range)
            .toggleNode("paragraph", "paragraph")
            .run();

        const { state } = editor;
        const {
            from,
            to
        } = state.selection;

        // Get text before the cursor (from start to the cursor position)
        const textBeforeCursor = state.doc.textBetween(0, from, "\n");

        // Get text after the cursor (from the cursor position to the end)
        const textAfterCursor = state.doc.textBetween(to, state.doc.content.size, "\n");

        let buffer = "";
        const result = await aiController.autocomplete(textBeforeCursor, textAfterCursor, (delta) => {
            buffer += delta;
            if (delta.length !== 0) {
                editor.chain().focus().toggleLoadingDecoration(buffer).run()
            }
        });

        editor.chain().focus()
            .insertContent(result, {
                applyInputRules: false,
                applyPasteRules: false,
                parseOptions: {
                    preserveWhitespace: false
                }
            }).run();

    }
};
const suggestionItems: SuggestionItem[] = [
    {
        title: "Text",
        description: "Just start typing with plain text.",
        searchTerms: ["p", "paragraph"],
        icon: <TextFieldsIcon size={18}/>,
        command: ({
                      editor,
                      range
                  }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleNode("paragraph", "paragraph")
                .run();
        }
    },
    {
        title: "To-do List",
        description: "Track tasks with a to-do list.",
        searchTerms: ["todo", "task", "list", "check", "checkbox"],
        icon: <CheckBoxIcon size={18}/>,
        command: ({
                      editor,
                      range
                  }) => {
            editor.chain().focus().deleteRange(range).toggleTaskList().run();
        }
    },
    {
        title: "Heading 1",
        description: "Big section heading.",
        searchTerms: ["title", "big", "large"],
        icon: <LooksOneIcon size={18}/>,
        command: ({
                      editor,
                      range
                  }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 1 })
                .run();
        }
    },
    {
        title: "Heading 2",
        description: "Medium section heading.",
        searchTerms: ["subtitle", "medium"],
        icon: <LooksTwoIcon size={18}/>,
        command: ({
                      editor,
                      range
                  }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 2 })
                .run();
        }
    },
    {
        title: "Heading 3",
        description: "Small section heading.",
        searchTerms: ["subtitle", "small"],
        icon: <Looks3Icon size={18}/>,
        command: ({
                      editor,
                      range
                  }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 3 })
                .run();
        }
    },
    {
        title: "Bullet List",
        description: "Create a simple bullet list.",
        searchTerms: ["unordered", "point"],
        icon: <FormatListBulletedIcon size={18}/>,
        command: ({
                      editor,
                      range
                  }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        }
    },
    {
        title: "Numbered List",
        description: "Create a list with numbering.",
        searchTerms: ["ordered"],
        icon: <FormatListNumberedIcon size={18}/>,
        command: ({
                      editor,
                      range
                  }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        }
    },
    {
        title: "Quote",
        description: "Capture a quote.",
        searchTerms: ["blockquote"],
        icon: <FormatQuoteIcon size={18}/>,
        command: ({
                      editor,
                      range
                  }) =>
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .toggleNode("paragraph", "paragraph")
                .toggleBlockquote()
                .run()
    },
    {
        title: "Code",
        description: "Capture a code snippet.",
        searchTerms: ["codeblock"],
        icon: <CodeIcon size={18}/>,
        command: ({
                      editor,
                      range
                  }) =>
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
    {
        title: "Image",
        description: "Upload an image from your computer.",
        searchTerms: ["photo", "picture", "media", "upload", "file"],
        icon: <ImageIcon size={18}/>,
        command: ({
                      editor,
                      range,
                      upload
                  }) => {

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

                    const fileList = input.files;
                    const files = Array.from(fileList);
                    const images = files.filter(file => /image/i.test(file.type));

                    if (images.length === 0) {
                        console.log("No images found in uploaded files");
                        return false;
                    }

                    const view = editor.view;

                    images.forEach(image => {
                        // const position = view.posAtCoords({
                        //     left: event.clientX,
                        //     top: event.clientY
                        // });
                        // if (!position) return;

                        const reader = new FileReader();
                        reader.onload = async (readerEvent) => {
                            await onFileRead(view, readerEvent, pos, upload, image);
                            // await onFileRead(view, readerEvent, position.pos, upload, image);
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

