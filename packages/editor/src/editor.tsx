"use client";
import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import TiptapUnderline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

import { Markdown } from "tiptap-markdown";
import Highlight from "@tiptap/extension-highlight";

import { EditorBubble, type JSONContent } from "./components";

import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { TextButtons } from "./selectors/text-buttons";

import { cls, defaultBorderMixin, Separator, useInjectStyles } from "@firecms/ui";
import { Editor, EditorProvider } from "@tiptap/react";
import { removeClassesFromJson } from "./utils/remove_classes";
import { horizontalRule, placeholder, starterKit, taskItem, taskList, tiptapLink } from "./editor_extensions";
import { createDropImagePlugin, createImageExtension } from "./extensions/Image";
import { CustomKeymap } from "./extensions/custom-keymap";
import { DragAndDrop } from "./extensions/drag-and-drop";
import Document from "@tiptap/extension-document"
import { SlashCommand, suggestion } from "./extensions/slashCommand";
import { AIController } from "./types";

export type FireCMSEditorTextSize = "sm" | "base" | "lg";

export type FireCMSEditorProps = {
    content?: JSONContent | string,
    onMarkdownContentChange?: (content: string) => void,
    onJsonContentChange?: (content: JSONContent | null) => void,
    onHtmlContentChange?: (content: string) => void,
    handleImageUpload: (file: File) => Promise<string>,
    version?: number,
    textSize?: FireCMSEditorTextSize,
    highlight?: { from: number, to: number },
    aiController?: AIController
};

const CustomDocument = Document.extend({
    // content: 'heading block*',
});

const proseClasses = {
    "sm": "prose-sm",
    "base": "prose-base",
    "lg": "prose-lg",
}

export const FireCMSEditor = ({
                                  content,
                                  onJsonContentChange,
                                  onHtmlContentChange,
                                  onMarkdownContentChange,
                                  version,
                                  textSize = "base",
                                  highlight,
                                  handleImageUpload,
                                  aiController
                              }: FireCMSEditorProps) => {

    const ref = React.useRef<HTMLDivElement | null>(null);
    const editorRef = React.useRef<Editor | null>(null);

    const imagePlugin = createDropImagePlugin(handleImageUpload);
    const imageExtension = useMemo(() => createImageExtension(imagePlugin), []);

    const [openNode, setOpenNode] = useState(false);
    const [openLink, setOpenLink] = useState(false);

    useInjectStyles("Editor", cssStyles);

    const deferredHighlight = useDeferredValue(highlight);

    useEffect(() => {
        if (version === undefined) return;
        if (version > 0 && editorRef.current) {
            editorRef.current?.commands.setContent(content ?? "");
        }
    }, [version]);

    const currentHighlight = useRef(deferredHighlight);

    useEffect(() => {
        if (version === undefined) return;
        if (editorRef.current && version > 0) {
            const {
                from: selectionFrom,
                to: selectionTo
            } = editorRef.current.state.selection;

            const chain = editorRef.current.chain();
            const currentContent = editorRef.current.storage.markdown.getMarkdown();
            if (currentContent !== content) {
                chain.setContent(content ?? "");
            }

            if (deferredHighlight) {
                if (currentHighlight.current?.from !== deferredHighlight.from || currentHighlight.current?.to !== deferredHighlight.to) {
                    chain.focus()
                        .setTextSelection({
                            from: deferredHighlight?.from,
                            to: deferredHighlight?.to
                        })
                        .toggleHighlight({ color: "#64748B68" });
                }
            } else {
                chain.focus().selectAll().unsetHighlight();
            }
            currentHighlight.current = deferredHighlight;

            chain.focus().setTextSelection({
                from: selectionFrom,
                to: selectionTo
            }).run();
        }
    }, [editorRef.current, deferredHighlight]);

    const onEditorUpdate = (editor: Editor) => {
        editorRef.current = editor;
        if (onMarkdownContentChange) {
            const markdown = editorRef.current.storage.markdown.getMarkdown();
            onMarkdownContentChange?.(addLineBreakAfterImages(markdown));
        }
        if (onJsonContentChange) {
            const jsonContent = removeClassesFromJson(editor.getJSON());
            onJsonContentChange(jsonContent);
        }
        if (onHtmlContentChange) {
            onHtmlContentChange?.(editor.getHTML());
        }
    }

    const proseClass = proseClasses[textSize];

    const extensions = useMemo(() => ([
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
        SlashCommand.configure({
            HTMLAttributes: {
                class: "mention",
            },
            suggestion: suggestion(ref, {
                upload: handleImageUpload,
                aiController
            }),
        })
    ]), []);

    return (
        <div
            ref={ref}
            className="relative min-h-[300px] w-full">
            <EditorProvider
                content={content ?? ""}
                extensions={extensions}
                editorProps={{
                    attributes: {
                        class: cls(proseClass, "prose-headings:font-title font-default focus:outline-none max-w-full p-12")
                    }
                }}
                onCreate={({ editor }) => {
                    // @ts-ignore
                    editorRef.current = editor;
                }}
                onUpdate={({ editor }) => {
                    onEditorUpdate(editor as Editor);
                }}>

                <EditorBubble
                    tippyOptions={{
                        placement: "top"
                    }}
                    className={cls("flex w-fit max-w-[90vw] h-10 overflow-hidden rounded border bg-white dark:bg-gray-900 shadow", defaultBorderMixin)}
                >
                    {/*<Separator orientation="vertical"/>*/}
                    <NodeSelector portalContainer={ref.current} open={openNode} onOpenChange={setOpenNode}/>
                    <Separator orientation="vertical"/>

                    <LinkSelector open={openLink} onOpenChange={setOpenLink}/>
                    <Separator orientation="vertical"/>
                    <TextButtons/>
                    {/*<Separator orientation="vertical"/>*/}
                    {/*<ColorSelector open={openColor} onOpenChange={setOpenColor}/>*/}
                </EditorBubble>

            </EditorProvider>
        </div>

    );
};

function addLineBreakAfterImages(markdown: string): string {
    // Regular expression to match markdown image syntax
    const imageRegex = /!\[.*?\]\(.*?\)/g;
    // Replace image with image followed by a line break
    return markdown.replace(imageRegex, (match) => `${match}\n`);
}

const cssStyles = `
.ProseMirror {
    box-shadow: none !important;
}
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
  cursor: text;
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
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000) !important;
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
  // outline: none !important;
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
