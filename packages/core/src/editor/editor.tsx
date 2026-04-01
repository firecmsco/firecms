"use client";
import React, { useEffect, useState, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { cls, defaultBorderMixin, Separator, useInjectStyles, TextareaAutosize } from "@rebasepro/ui";
import { useTranslation } from "../hooks/useTranslation";
import { EditorBubble, ImageBubble, SlashCommandMenu, TableBubble, type JSONContent } from "./components";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { TextButtons } from "./selectors/text-buttons";
import { removeClassesFromJson } from "./utils/remove_classes";
import { parser, serializer } from "./markdown";
import { EditorAIController } from "./types";
import { useProseMirror } from "./hooks/useProseMirror";
import { ProseMirrorContext } from "./hooks/useProseMirrorContext";
import { highlightCommands } from "./extensions/HighlightDecorationExtension";
import { schema } from "./schema";

export type CustomEditorComponent = {
  name: string,
  component: React.FC
};

export interface MarkdownEditorConfig {
  html?: boolean;
  transformPastedText?: boolean;
}

export type RebaseEditorTextSize = "sm" | "base" | "lg";

export type RebaseEditorProps = {
  content?: JSONContent | string,
  onMarkdownContentChange?: (content: string) => void,
  onJsonContentChange?: (content: JSONContent | null) => void,
  onHtmlContentChange?: (content: string) => void,
  handleImageUpload: (file: File) => Promise<string>,
  version?: number,
  textSize?: RebaseEditorTextSize,
  highlight?: { from: number, to: number },
  aiController?: EditorAIController,
  customComponents?: CustomEditorComponent[];
  disabled?: boolean;
  markdownConfig?: MarkdownEditorConfig;
};

const proseClasses = {
  "sm": "prose-sm",
  "base": "prose-base",
  "lg": "prose-lg"
}

export const RebaseEditor = ({
  content,
  onJsonContentChange,
  onHtmlContentChange,
  onMarkdownContentChange,
  version,
  textSize = "base",
  highlight,
  handleImageUpload,
  aiController,
  disabled,
  markdownConfig
}: RebaseEditorProps) => {
  const { t } = useTranslation();

  const [openNode, setOpenNode] = useState(false);
  const [openLink, setOpenLink] = useState(false);

  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [internalMarkdown, setInternalMarkdown] = useState<string>("");

  useEffect(() => {
    if (!isMarkdownMode) return;
    const timeout = setTimeout(() => {
      if (callbacksRef.current.onMarkdownContentChange) {
        callbacksRef.current.onMarkdownContentChange(internalMarkdown);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [internalMarkdown, isMarkdownMode]);

  const handleToggleMarkdown = () => {
    if (!isMarkdownMode) {
      if (view) {
        setInternalMarkdown(serializer.serialize(view.state.doc));
      }
      setIsMarkdownMode(true);
    } else {
      if (view) {
        const newDoc = parser.parse(internalMarkdown);
        if (newDoc) {
          const tr = view.state.tr.replaceWith(0, view.state.doc.content.size, newDoc.content);
          view.dispatch(tr);
        }
      }
      setIsMarkdownMode(false);
    }
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalMarkdown(e.target.value);
  };

  const handleMarkdownBlur = () => {
    const { onMarkdownContentChange, onJsonContentChange } = callbacksRef.current;
    if (onMarkdownContentChange) {
      onMarkdownContentChange(internalMarkdown);
    }
    if (onJsonContentChange) {
      try {
        const newDoc = parser.parse(internalMarkdown);
        if (newDoc) {
          onJsonContentChange(removeClassesFromJson(newDoc.toJSON()) as JSONContent);
        }
      } catch (e) {
        console.warn("Could not parse markdown to JSON", e);
      }
    }
  };

  useInjectStyles("Editor", cssStyles);

  const callbacksRef = useRef({ onMarkdownContentChange, onJsonContentChange });
  useEffect(() => {
    callbacksRef.current = { onMarkdownContentChange, onJsonContentChange };
  }, [onMarkdownContentChange, onJsonContentChange]);

  const flushChanges = (currentState: EditorState) => {
    const { onMarkdownContentChange, onJsonContentChange } = callbacksRef.current;
    if (onMarkdownContentChange) {
      try {
        const markdown = serializer.serialize(currentState.doc);
        onMarkdownContentChange(markdown);
      } catch (e) {
        console.warn("[RebaseEditor] Could not serialize editor state to markdown:", e);
      }
    }
    if (onJsonContentChange) {
      const jsonContent = removeClassesFromJson(currentState.doc.toJSON()) as JSONContent;
      onJsonContentChange(jsonContent);
    }
  };

  const { state, view, editorRef } = useProseMirror({
    initialContent: content,
    editable: !disabled,
    handleImageUpload,
  });

  const doc = state?.doc;
  useEffect(() => {
    if (!state) return;
    const timeout = setTimeout(() => {
      flushChanges(state);
    }, 250);
    return () => clearTimeout(timeout);
  }, [doc]);

  useEffect(() => {
    if (!view) return;
    const dom = view.dom;
    const handleBlur = () => {
      flushChanges(view.state);
    };
    dom.addEventListener("blur", handleBlur);
    return () => dom.removeEventListener("blur", handleBlur);
  }, [view]);



  useEffect(() => {
    if (view) {
      if (highlight) {
        highlightCommands.toggleAutocompleteHighlight(highlight)(view.state, view.dispatch);
      } else {
        highlightCommands.removeAutocompleteHighlight()(view.state, view.dispatch);
      }
    }
  }, [highlight?.from, highlight?.to]);

  const proseClass = proseClasses[textSize];



  return (
    <div className="relative min-h-[300px] w-full">
      <button
        type="button"
        onClick={handleToggleMarkdown}
        title={isMarkdownMode ? "Switch to Visual Editor" : "Switch to Markdown"}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs font-medium text-surface-400 hover:text-surface-700 dark:text-surface-600 dark:hover:text-surface-300 transition-colors opacity-50 hover:opacity-100 bg-transparent rounded"
      >
        {isMarkdownMode ? "Visual" : "Markdown"}
      </button>

      <ProseMirrorContext.Provider value={{ state, view }}>

        <div style={{ display: isMarkdownMode ? "none" : "block" }}>
          <div
            ref={editorRef}
            className={cls(proseClass, "prose-headings:font-title font-default focus:outline-none max-w-full p-12")}
          />

          {view && (
          <>
            <EditorBubble
              options={{
                placement: "top",
                offset: 6,
              }}
              className={cls("flex w-fit max-w-[90vw] h-10 overflow-hidden rounded border bg-white dark:bg-surface-900 shadow", defaultBorderMixin)}
            >
              <NodeSelector portalContainer={editorRef.current} open={openNode} onOpenChange={setOpenNode} />
              <Separator orientation="vertical" />
              <LinkSelector open={openLink} onOpenChange={setOpenLink} />
              <Separator orientation="vertical" />
              <TextButtons />
            </EditorBubble>

            <ImageBubble
               options={{
                placement: "bottom",
                offset: 6,
              }}
            />
            <TableBubble />
          </>
        )}

        <SlashCommandMenu upload={handleImageUpload} aiController={aiController} />
        </div>

        {isMarkdownMode && (
          <TextareaAutosize
            value={internalMarkdown}
            onChange={handleMarkdownChange as any}
            onBlur={handleMarkdownBlur as any}
            className={cls(
              "w-full h-full min-h-[300px] p-12 bg-transparent resize-none font-mono focus:ring-0",
              proseClass
            )}
            style={{ 
              tabSize: 4,
              outline: "none",
              border: "none",
              boxShadow: "none"
            }}
          />
        )}

      </ProseMirrorContext.Provider>
    </div>
  );
};



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

.ProseMirror img {
  transition: filter 0.1s ease-in-out;
  &:hover {
    cursor: pointer;
    filter: brightness(90%);
  }
  &.ProseMirror-selectednode {
    filter: brightness(90%);
    box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000) !important;
  }
}

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
    background-color: rgb(30 41 59);
    border: 2px solid #666;
    &:hover { background-color: rgb(51 65 85); }
    &:active { background-color: rgb(71 85 105); }
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
  &:hover { background-color: rgb(241 245 249); }
  &:active { background-color: rgb(226 232 240); }
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
  &:checked::before { transform: scale(1); }
}

[data-theme="dark"] {
  ul[data-type="taskList"] li[data-checked="true"] > div > p {
    color: rgb(226 232 240);
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }
}
ul[data-type="taskList"] li[data-checked="true"] > div > p {
  color: rgb(51 65 85);
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}
.tippy-box { max-width: 400px !important; }

.ProseMirror:not(.dragging) .ProseMirror-selectednode {
  background-color: rgb(219 234 254);
  transition: background-color 0.2s;
  box-shadow: none;
}
[data-theme="dark"] .ProseMirror:not(.dragging) .ProseMirror-selectednode {
  background-color:  rgb(51 65 85);
}
.prose-base table p { margin: 0; }

.drag-handle {
  position: absolute;
  opacity: 1;
  transition: opacity ease-in 0.2s;
  border-radius: 0.25rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(128, 128, 128, 0.9)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7,8.44771525 7,9 7,9 C7,9.55228475 7,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: calc(0.5em + 0.375rem) calc(0.5em + 0.375rem);
  background-repeat: no-repeat;
  background-position: center;
  width: 1.2rem;
  height: 1.5rem;
  z-index: 100;
  cursor: grab;
  
  /* Create a hover area around the handle itself that doesn't overlap text */
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    bottom: -10px;
    left: -20px; 
    right: 0px;
    z-index: -1;
  }
  
  &:hover { background-color: rgb(241 245 249); transition: background-color 0.2s; }
  &:active { background-color: rgb(226 232 240); transition: background-color 0.2s; }
  &.hide { opacity: 0; pointer-events: none; }
  @media screen and (max-width: 600px) { display: none; pointer-events: none; }
}
[data-theme="dark"] .drag-handle {
  &:hover { background-color: rgb(51 65 85); }
  &:active { background-color: rgb(51 65 85); }
}
.prosemirror-dropcursor-block {
  background-color: var(--color-surface-accent-600);
}
[data-theme="dark"] .prosemirror-dropcursor-block {
  background-color: var(--color-surface-accent-300);
}

.ProseMirror table {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  width: 100%;
  margin: 1em 0;
  overflow: hidden;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
}
[data-theme="dark"] .ProseMirror table {
  border-color: #374151;
}

.ProseMirror td, .ProseMirror th {
  min-width: 1em;
  padding: 8px 10px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}
[data-theme="dark"] .ProseMirror td, [data-theme="dark"] .ProseMirror th {
  border-right-color: #374151;
  border-bottom-color: #374151;
}

.ProseMirror tr:last-child td, .ProseMirror tr:last-child th {
  border-bottom: none;
}
.ProseMirror th:last-child, .ProseMirror td:last-child {
  border-right: none;
}

.ProseMirror th {
  font-weight: 600;
  text-align: left;
  background-color: #f9fafb;
}
[data-theme="dark"] .ProseMirror th {
  background-color: #1f2937;
}
`;
