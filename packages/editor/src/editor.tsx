"use client";
import React, { useEffect, useMemo, useState } from "react";

import TiptapUnderline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

import { Markdown } from "tiptap-markdown";
import Highlight from "@tiptap/extension-highlight";

import { EditorBubble, EditorCommand, EditorCommandEmpty, EditorCommandItem, type JSONContent } from "./components";
import { Command, createSuggestionItems, renderItems } from "./extensions";

import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { TextButtons } from "./selectors/text-buttons";

import {
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
    Separator,
    TextFieldsIcon,
    useInjectStyles
} from "@firecms/ui";
// import { startImageUpload } from "./plugins";
import { Editor, EditorProvider, EditorProviderProps } from "@tiptap/react";
import { useDebouncedCallback } from "./utils/useDebouncedCallback";
import { removeClassesFromJson } from "./utils/remove_classes";
import { horizontalRule, placeholder, starterKit, taskItem, taskList, tiptapLink } from "./editor_extensions";
import { createImageExtension } from "./extensions/Image";
import { CustomKeymap } from "./extensions/custom-keymap";
import { DragAndDrop } from "./extensions/drag-and-drop";
import { EditorCommandProvider } from "./components/editor-command";
import Document from "@tiptap/extension-document"

export type FireCMSEditorProps = {
    content?: JSONContent | string,
    onMarkdownContentChange?: (content: string) => void,
    onJsonContentChange?: (content: JSONContent | null) => void,
    onHtmlContentChange?: (content: string) => void,
    handleImageUpload: (file: File) => Promise<string>
};

const CustomDocument = Document.extend({
    // content: 'heading block*',
})

export const FireCMSEditor = ({
                                  handleImageUpload,
                                  content,
                                  onJsonContentChange,
                                  onHtmlContentChange,
                                  onMarkdownContentChange
                              }: FireCMSEditorProps) => {

    const defaultEditorProps: EditorProviderProps["editorProps"] = {
        handleDOMEvents: {
            keydown: (_view, event) => {
                // prevent default event listeners from firing when slash command is active
                if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
                    const slashCommand = document.querySelector("#slash-command");
                    if (slashCommand) {
                        return true;
                    }
                }
                return false;
            }
        }
        // handlePaste: (view, event) => {
        //     if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
        //         event.preventDefault();
        //         const file = event.clipboardData.files[0];
        //         const pos = view.state.selection.from;
        //
        //         // startImageUpload({ file, view, pos, handleImageUpload });
        //         return true;
        //     }
        //     return false;
        // },
        // handleDrop: (view, event, _slice, moved) => {
        //     console.log("handleDrop", { event, moved });
        //     if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        //         console.log("handleDrop!!!", { event, moved });
        //         event.preventDefault();
        //         const file = event.dataTransfer.files[0];
        //         const coordinates = view.posAtCoords({
        //             left: event.clientX,
        //             top: event.clientY
        //         });
        //         // here we deduct 1 from the pos or else the image will create an extra node
        //         startImageUpload({
        //             file,
        //             view,
        //             pos: coordinates?.pos || 0 - 1,
        //             handleImageUpload,
        //         });
        //         return true;
        //     }
        //     return false;
        // }
    };

    const suggestionItems = createSuggestionItems([
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
            searchTerms: ["photo", "picture", "media"],
            icon: <ImageIcon size={18}/>,
            command: ({
                          editor,
                          range
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
                        // startImageUpload({
                        //     file,
                        //     view: editor.view,
                        //     pos,
                        //     handleImageUpload
                        // });
                    }
                };
                input.click();
            }
        }
    ]);

    const slashCommand = Command.configure({
        suggestion: {
            items: () => suggestionItems,
            render: renderItems
        }
    });

    const imageExtension = useMemo(() => createImageExtension(handleImageUpload), []);

    const extensions = [
        TiptapUnderline,
        TextStyle,
        Color,
        CustomDocument,
        Highlight.configure({
            multicolor: true
        }),
        Markdown.configure({
            html: false,
            transformCopiedText: true
        }),
        CustomKeymap,
        DragAndDrop,
        starterKit,
        placeholder,
        tiptapLink,
        imageExtension,
        taskList,
        taskItem,
        horizontalRule,
        slashCommand];
    const [openNode, setOpenNode] = useState(false);
    const [openLink, setOpenLink] = useState(false);

    useInjectStyles("Editor", cssStyles);

    const editorRef = React.useRef<Editor | null>(null);
    const [markdownContent, setMarkdownContent] = useState<string | null>(null);
    const [jsonContent, setJsonContent] = useState<JSONContent | null>(null);
    const [htmlContent, setHtmlContent] = useState<string | null>(null);

    useEffect(() => {
        console.log("Content changed", content);
        editorRef.current?.commands.setContent(content ?? "");
    }, [content]);

    const onEditorUpdate = (editor: Editor) => {
        editorRef.current = editor;
        if (onMarkdownContentChange) {
            setMarkdownContent(editor.storage.markdown.getMarkdown());
        }
        if (onJsonContentChange) {
            setJsonContent(removeClassesFromJson(editor.getJSON()));
        }
        if (onHtmlContentChange) {
            setHtmlContent(editor.getHTML());
        }
    }

    useDebouncedCallback(markdownContent, () => {

        if (editorRef.current) {
            const markdown = editorRef.current.storage.markdown.getMarkdown();
            onMarkdownContentChange?.(addLineBreakAfterImages(markdown));
        }
    }, false, 300);

    useDebouncedCallback(jsonContent, () => {
        if (jsonContent)
            onJsonContentChange?.(jsonContent);
    }, false, 300);

    useDebouncedCallback(htmlContent, () => {
        if (htmlContent)
            onHtmlContentChange?.(htmlContent);
    }, false, 300);

    return (
        <EditorCommandProvider>
            <div
                className="relative min-h-[300px] w-full bg-white dark:bg-gray-950 rounded-lg">
                <EditorProvider
                    content={content ?? ""}
                    extensions={extensions}
                    editorProps={{
                        ...defaultEditorProps,
                        attributes: {
                            class: "prose-lg prose-headings:font-title font-default focus:outline-none max-w-full p-12"
                        }
                    }}
                    onUpdate={({ editor }) => {
                        console.debug("Editor updated");
                        onEditorUpdate(editor as Editor);
                    }}>

                    <EditorCommand
                        className={cls("text-gray-900 dark:text-white z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-white dark:bg-gray-900 px-1 py-2 shadow transition-all", defaultBorderMixin)}>
                        <EditorCommandEmpty className="px-2 text-gray-700 dark:text-slate-300">
                            No results
                        </EditorCommandEmpty>
                        {suggestionItems.map((item) => (
                            <EditorCommandItem
                                value={item.title}
                                onCommand={(val) => item?.command?.(val)}
                                className={"flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-blue-50 hover:dark:bg-gray-700 aria-selected:bg-blue-50 aria-selected:dark:bg-gray-700"}
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
                            </EditorCommandItem>
                        ))}
                    </EditorCommand>

                    <EditorBubble
                        tippyOptions={{
                            placement: "top"
                        }}
                        className={cls("flex w-fit max-w-[90vw] h-10 overflow-hidden rounded border bg-white dark:bg-gray-900 shadow", defaultBorderMixin)}
                    >
                        {/*<Separator orientation="vertical"/>*/}
                        <NodeSelector open={openNode} onOpenChange={setOpenNode}/>
                        <Separator orientation="vertical"/>

                        <LinkSelector open={openLink} onOpenChange={setOpenLink}/>
                        <Separator orientation="vertical"/>
                        <TextButtons/>
                        {/*<Separator orientation="vertical"/>*/}
                        {/*<ColorSelector open={openColor} onOpenChange={setOpenColor}/>*/}
                    </EditorBubble>

                </EditorProvider>
            </div>

        </EditorCommandProvider>
    );
};

function addLineBreakAfterImages(markdown: string): string {
    // Regular expression to match markdown image syntax
    const imageRegex = /!\[.*?\]\(.*?\)/g;
    // Replace image with image followed by a line break
    return markdown.replace(imageRegex, (match) => `${match}\n`);
}

const cssStyles = `

.ProseMirror .is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color:  rgb(100 116 139); //500
  pointer-events: none;
  height: 0;
}
.ProseMirror .is-empty::before {
  content: attr(data-placeholder);
  float: left;
  color:  rgb(100 116 139); //500
  pointer-events: none;
  height: 0;
}

[data-theme="dark"] {
  .ProseMirror .is-empty::before {
    color: rgb(100 116 139); //500
  }
}

.is-empty {
  color: rgb(100 116 139); //500
}


/* Custom image styles */

.ProseMirror img {
  transition: filter 0.1s ease-in-out;

  &:hover {
    cursor: pointer;
    filter: brightness(90%);
  }

  &.ProseMirror-selectednode {
    outline: 3px solid #5abbf7;
    filter: brightness(90%);
  }
}

/* Custom TODO list checkboxes – shoutout to this awesome tutorial: https://moderncss.dev/pure-css-custom-checkbox-style/ */

ul[data-type="taskList"] li > label {
  margin-right: 0.2rem;
  user-select: none;
}

@media screen and (max-width: 768px) {
  ul[data-type="taskList"] li > label {
    margin-right: 0.5rem;
  }
}


[data-theme="dark"] {
  ul[data-type="taskList"] li > label input[type="checkbox"] {
    background-color: rgb(30 41 59); // 800
    border: 2px solid #666;
  
    &:hover {
      background-color: rgb(51 65 85); // 700
    }
  
    &:active {
      background-color: rgb(71 85 105);
    }
  }
}
  

ul[data-type="taskList"] li > label input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  background-color: white;
  margin: 0;
  cursor: pointer;
  width: 1.2em;
  height: 1.2em;
  position: relative;
  top: 5px;
  border: 2px solid #777;
  border-radius: 0.25em;
  margin-right: 0.3rem;
  display: grid;
  place-content: center;

  &:hover {
    background-color: rgb(241 245 249); //100
  }

  &:active {
    background-color: rgb(226 232 240); //200
  }

  &::before {
    content: "";
    width: 0.65em;
    height: 0.65em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em;
    transform-origin: center;
    clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
  }

  &:checked::before {
    transform: scale(1);
  }
}

[data-theme="dark"] {
  ul[data-type="taskList"] li[data-checked="true"] > div > p {
    color: rgb(226 232 240);
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }
}

ul[data-type="taskList"] li[data-checked="true"] > div > p {
  color: rgb(51 65 85); // 700
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

/* Overwrite tippy-box original max-width */

.tippy-box {
  max-width: 400px !important;
}

.ProseMirror:not(.dragging) .ProseMirror-selectednode {
  outline: none !important;
  background-color: rgb(219 234 254); // blue 100
  transition: background-color 0.2s;
  box-shadow: none;
}

[data-theme="dark"] .ProseMirror:not(.dragging) .ProseMirror-selectednode {
  background-color:  rgb(51 65 85); // 700
}

.drag-handle {
  position: absolute;
  opacity: 1;
  transition: opacity ease-in 0.2s;
  border-radius: 0.25rem;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(128, 128, 128, 0.9)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: calc(0.5em + 0.375rem) calc(0.5em + 0.375rem);
  background-repeat: no-repeat;
  background-position: center;
  width: 1.2rem;
  height: 1.5rem;
  z-index: 100;
  cursor: grab;

  &:hover {
    background-color: rgb(241 245 249); //100
    transition: background-color 0.2s;
  }

  &:active {
    background-color: rgb(226 232 240); //200
    transition: background-color 0.2s;
  }

  &.hide {
    opacity: 0;
    pointer-events: none;
  }

  @media screen and (max-width: 600px) {
    display: none;
    pointer-events: none;
  }
}

[data-theme="dark"] .drag-handle {
  &:hover {
    background-color: rgb(51 65 85); // 700
  }

  &:active {
    background-color: rgb(51 65 85); // 700
  }
}
`;
