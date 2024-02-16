"use client";
import React, { useDeferredValue, useEffect, useState } from "react";
// import { useDebouncedCallback } from "use-debounce";
import {
    defaultEditorProps,
    type Editor,
    EditorBubble,
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandItem,
    EditorContent,
    EditorRoot,
    type JSONContent,
} from "./components";
import { ImageResizer } from "./extensions";
import { defaultExtensions } from "./editor_extensions";
// import { Separator } from "./ui/separator";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { ColorSelector } from "./selectors/color-selector";

import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { defaultEditorContent } from "./content";
import { cn, defaultBorderMixin, useInjectStyles } from "@firecms/ui";

const extensions = [...defaultExtensions, slashCommand];

export const TailwindEditor = () => {
    const [initialContent, setInitialContent] = useState<null | JSONContent>(
        null,
    );
    // const [saveStatus, setSaveStatus] = useState("Saved");

    const [openNode, setOpenNode] = useState(false);
    const [openColor, setOpenColor] = useState(false);
    const [openLink, setOpenLink] = useState(false);

    useInjectStyles("Editor", cssStyles);
    const [value, setValue] = useState<JSONContent | null>(null);

    const debouncedUpdates = useDeferredValue(value);
    // const debouncedUpdates = useDebouncedCallback(async (editor: Editor) => {
    //     const json = editor.getJSON();
    //
    //     window.localStorage.setItem("novel-content", JSON.stringify(json));
    //     // setSaveStatus("Saved");
    // }, 500);

    useEffect(() => {
        const content = window.localStorage.getItem("novel-content");
        if (content) setInitialContent(JSON.parse(content));
        else setInitialContent(defaultEditorContent);
    }, []);

    if (!initialContent) return null;

    return (
        <div className="relative w-full p-8">
            {/*<div className="absolute right-5 top-5 z-10 mb-5 rounded-lg bg-blue-50 dark:bg-gray-700 px-2 py-1 text-sm text-gray-400 dark:text-gray-400">*/}
            {/*  {saveStatus}*/}
            {/*</div>*/}
            <EditorRoot>
                <EditorContent
                    initialContent={initialContent}
                    extensions={extensions}
                    className="relative min-h-[500px] w-full p-8 bg-white dark:bg-gray-900 sm:mb-[calc(20vh)] rounded-lg"
                    editorProps={{
                        ...defaultEditorProps,
                        attributes: {
                            class: `prose-lg prose-stone dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
                        },
                    }}
                    onUpdate={({ editor }) => {
                        setValue(editor.getJSON());
                        // debouncedUpdates(editor);
                        // setSaveStatus("Unsaved");
                    }}
                    slotAfter={<ImageResizer/>}
                >
                    <EditorCommand
                        className={cn("text-gray-900 dark:text-white z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-white dark:bg-gray-900 px-1 py-2 shadow transition-all", defaultBorderMixin)}>
                        <EditorCommandEmpty className="px-2 text-gray-700 dark:text-gray-300">
                            No results
                        </EditorCommandEmpty>
                        {suggestionItems.map((item) => (
                            <EditorCommandItem
                                value={item.title}
                                onCommand={(val) => item?.command?.(val)}
                                className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-blue-50 hover:dark:bg-gray-700 aria-selected:bg-blue-50 aria-selected:dark:bg-gray-700`}
                                key={item.title}
                            >
                                <div
                                    className={cn("flex h-10 w-10 items-center justify-center rounded-md border bg-white dark:bg-gray-900", defaultBorderMixin)}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-xs text-gray-700 dark:text-gray-300">
                                        {item.description}
                                    </p>
                                </div>
                            </EditorCommandItem>
                        ))}
                    </EditorCommand>

                    <EditorBubble
                        tippyOptions={{
                            placement: "top",
                        }}
                        className={cn("flex w-fit max-w-[90vw] overflow-hidden rounded border bg-white dark:bg-gray-900 shadow", defaultBorderMixin)}
                    >
                        {/*<Separator orientation="vertical" />*/}
                        <NodeSelector open={openNode} onOpenChange={setOpenNode}/>
                        {/*<Separator orientation="vertical" />*/}

                        <LinkSelector open={openLink} onOpenChange={setOpenLink}/>
                        {/*<Separator orientation="vertical" />*/}
                        <TextButtons/>
                        {/*<Separator orientation="vertical" />*/}
                        <ColorSelector open={openColor} onOpenChange={setOpenColor}/>
                    </EditorBubble>
                </EditorContent>
            </EditorRoot>
        </div>
    );
};

const cssStyles = `
.ProseMirror {
  @apply p-12 px-8 sm:px-12;
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

.img-placeholder {
  position: relative;

  &:before {
    content: "";
    box-sizing: border-box;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid var(--novel-stone-200);
    border-top-color: var(--novel-stone-800);
    animation: spinning 0.6s linear infinite;
  }
}

@keyframes spinning {
  to {
    transform: rotate(360deg);
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
      background-color: rgb(71 85 105);;
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
  position: fixed;
  opacity: 1;
  transition: opacity ease-in 0.2s;
  border-radius: 0.25rem;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(128, 128, 128, 0.9)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: calc(0.5em + 0.375rem) calc(0.5em + 0.375rem);
  background-repeat: no-repeat;
  background-position: center;
  width: 1.2rem;
  height: 1.5rem;
  z-index: 50;
  cursor: grab;

  &:hover {
    background-color: var(--novel-stone-100);
    transition: background-color 0.2s;
  }

  &:active {
    background-color: var(--novel-stone-200);
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

.dark .drag-handle {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(255, 255, 255, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
}
`;

