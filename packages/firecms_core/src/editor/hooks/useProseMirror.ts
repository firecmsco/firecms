import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "../schema";
import { corePlugins } from "../plugins";
import { parser } from "../markdown";
import { nodeViews } from "../nodeViews";
import { createDropImagePlugin } from "../extensions/Image";

interface UseProseMirrorProps {
    initialContent?: string | any;
    onChange?: (state: EditorState, view: EditorView) => void;
    editable?: boolean;
    handleImageUpload?: (file: File) => Promise<string>;
}

export function useProseMirror({ initialContent, onChange, editable = true, handleImageUpload }: UseProseMirrorProps) {
    // Store onChange in a ref so that the latest version is always called inside
    // the dispatchTransaction closure (which only runs once at mount with [] deps).
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const plugins = [...corePlugins];
    if (handleImageUpload) {
        plugins.push(createDropImagePlugin(handleImageUpload));
    }

    const defaultState = EditorState.create({
        doc: typeof initialContent === "string"
            ? parser.parse(initialContent)
            : initialContent
                ? schema.nodeFromJSON(initialContent)
                : schema.node("doc", null, [schema.node("paragraph")]),
        schema,
        plugins
    });

    const [state, setState] = useState<EditorState>(defaultState);
    const [view, setView] = useState<EditorView | null>(null);

    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    useLayoutEffect(() => {
        if (!editorRef.current) return;

        const editorView = new EditorView(editorRef.current, {
            state: defaultState,
            editable: () => editable,
            dispatchTransaction: (tr: Transaction) => {
                const newState = editorView.state.apply(tr);
                editorView.updateState(newState);
                setState(newState);
                onChangeRef.current?.(newState, editorView);
            },
            nodeViews: nodeViews,
            transformPastedHTML(html: string) {
                // Strip inline styles and classes from pasted HTML so we don't
                // get textStyle marks (color, font-size, etc.) that have no
                // markdown representation. This makes paste look consistent.
                const div = document.createElement("div");
                div.innerHTML = html;
                div.querySelectorAll("*").forEach((el) => {
                    el.removeAttribute("style");
                    el.removeAttribute("class");
                    el.removeAttribute("color");
                    el.removeAttribute("bgcolor");
                    el.removeAttribute("face");
                });
                return div.innerHTML;
            },
        });

        // Patch posAtCoords to allow dropping/interacting anywhere horizontally natively
        const originalPosAtCoords = editorView.posAtCoords.bind(editorView);
        editorView.posAtCoords = (coords: { left: number, top: number }) => {
            let res = originalPosAtCoords(coords);
            if (!res) {
                const editorRect = editorView.dom.getBoundingClientRect();
                // If it's literally anywhere to the left of the actual ProseMirror content block
                if (coords.left <= editorRect.left) {
                    const probeX = editorRect.left + Math.min(60, editorRect.width / 4);
                    return originalPosAtCoords({ left: probeX, top: coords.top });
                }
                // Or if it's anywhere to the right
                if (coords.left >= editorRect.right) {
                    const probeX = editorRect.right - Math.min(60, editorRect.width / 4);
                    return originalPosAtCoords({ left: probeX, top: coords.top });
                }
            }
            return res;
        };

        viewRef.current = editorView;
        setView(editorView);

        return () => {
            editorView.destroy();
            viewRef.current = null;
        };
    }, []);

    // Effect to update editable status without re-mounting
    useEffect(() => {
        if (viewRef.current) {
            viewRef.current.setProps({ editable: () => editable });
        }
    }, [editable]);

    return {
        state,
        view,
        editorRef
    };
}
