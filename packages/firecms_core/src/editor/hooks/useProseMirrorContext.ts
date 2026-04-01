import React, { createContext, useContext } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export interface ProseMirrorContextType {
    state: EditorState | null;
    view: EditorView | null;
}

export const ProseMirrorContext = createContext<ProseMirrorContextType>({
    state: null,
    view: null,
});

export const useProseMirrorContext = () => useContext(ProseMirrorContext);
