import { useEffect, useRef, useState } from "react";
import { EditorState, Transaction, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "./schema";
import { markdownParser, markdownSerializer } from "./markdown";
import { removeClassesFromJson } from "./utils/remove_classes";
import { DOMParser as ProseMirrorDOMParser, DOMSerializer } from "prosemirror-model";

export interface UseProseMirrorOptions {
    content?: any;
    plugins?: Plugin[];
    editable?: boolean;
    onMarkdownContentChange?: (content: string) => void;
    onJsonContentChange?: (content: any | null) => void;
    onHtmlContentChange?: (content: string) => void;
    version?: number;
}

export function useProseMirror(options: UseProseMirrorOptions) {
    const mountRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const [editorState, setEditorState] = useState<EditorState | null>(null);
    const isUpdatingContentRef = useRef(false);

    useEffect(() => {
        if (!mountRef.current) return;

        let doc;
        try {
            if (typeof options.content === "string") {
                if (options.content.trim() === "") {
                    doc = schema.node("doc", null, [schema.node("paragraph")]);
                } else if (options.content.startsWith("<")) {
                    const temp = document.createElement("div");
                    temp.innerHTML = options.content;
                    doc = ProseMirrorDOMParser.fromSchema(schema).parse(temp);
                } else {
                    doc = markdownParser.parse(options.content);
                }
            } else if (options.content && typeof options.content === "object" && Object.keys(options.content).length > 0) {
                doc = schema.nodeFromJSON(options.content);
            } else {
                doc = schema.node("doc", null, [schema.node("paragraph")]);
            }
        } catch (e) {
            console.warn("Failed to parse initial content, falling back to empty doc", e);
            doc = schema.node("doc", null, [schema.node("paragraph")]);
        }

        const state = EditorState.create({
            doc,
            schema,
            plugins: options.plugins || [],
        });

        const view = new EditorView(mountRef.current, {
            state,
            editable: () => options.editable !== false,
            dispatchTransaction(transaction: Transaction) {
                const newState = view.state.apply(transaction);
                view.updateState(newState);
                setEditorState(newState);

                if (transaction.docChanged && !isUpdatingContentRef.current) {

                    if (options.onMarkdownContentChange) {
                        options.onMarkdownContentChange(markdownSerializer.serialize(newState.doc));
                    }
                    if (options.onJsonContentChange) {
                        options.onJsonContentChange(removeClassesFromJson(newState.doc.toJSON()));
                    }
                    if (options.onHtmlContentChange) {
                        const div = document.createElement("div");
                        const fragment = DOMSerializer.fromSchema(schema).serializeFragment(newState.doc.content);
                        div.appendChild(fragment);
                        options.onHtmlContentChange(div.innerHTML);
                    }
                }
            },
        });





        viewRef.current = view;
        setEditorState(state);

        return () => {
            view.destroy();
            viewRef.current = null;
        };
    }, []); // Initialize once

    // Handle external content updates (like version change)
    useEffect(() => {
        if (!viewRef.current || options.version === undefined || options.version <= 0) return;
        try {
            isUpdatingContentRef.current = true;
            let doc;
            if (typeof options.content === "string") {
                doc = markdownParser.parse(options.content) || schema.node("doc", null, [schema.node("paragraph")]);
            } else if (options.content) {
                doc = schema.nodeFromJSON(options.content);
            } else {
                doc = schema.node("doc", null, [schema.node("paragraph")]);
            }

            const tr = viewRef.current.state.tr.replaceWith(0, viewRef.current.state.doc.content.size, doc);
            viewRef.current.dispatch(tr);
            isUpdatingContentRef.current = false;
        } catch (e) {
            console.error("Error updating content manually via version bump:", e);
            isUpdatingContentRef.current = false;
        }
    }, [options.version]);

    // Handle editable prop change
    useEffect(() => {
        if (viewRef.current && editorState) {
            viewRef.current.setProps({ editable: () => options.editable !== false });
        }
    }, [options.editable, editorState]);

    return { mountRef, view: viewRef.current, editorState };
}
