import { EditorState, TextSelection, Transaction } from "prosemirror-state";
import { MarkType, NodeType, Node as ProseMirrorNode } from "prosemirror-model";

export function isMarkActive(state: EditorState, type: MarkType) {
    if (!state || !type) return false;
    const { from, $from, to, empty } = state.selection;
    if (empty) return !!type.isInSet(state.storedMarks || $from.marks());
    return state.doc.rangeHasMark(from, to, type);
}

export function isNodeActive(state: EditorState, type: NodeType, attrs: Record<string, unknown> = {}) {
    if (!state || !type) return false;
    const selection = state.selection;
    const { $from, to } = selection;
    const node = selection instanceof TextSelection ? undefined : (selection as unknown as { node?: ProseMirrorNode }).node;
    if (node) {
        return node.type === type && (!attrs || Object.keys(attrs).every((key) => node.attrs[key] === attrs[key]));
    }
    return to <= $from.end() && $from.parent.type === type && (!attrs || Object.keys(attrs).every((key) => $from.parent.attrs[key] === attrs[key]));
}

export function getMarkAttributes(state: EditorState, type: MarkType) {
    if (!state || !type) return {};
    const { from, $from, to, empty } = state.selection;
    let mark;
    if (empty) {
        mark = type.isInSet(state.storedMarks || $from.marks());
    } else {
        let found = false;
        state.doc.nodesBetween(from, to, (node) => {
            if (found) return false;
            const m = type.isInSet(node.marks);
            if (m) {
                mark = m;
                found = true;
            }
            return true;
        });
    }
    return mark ? mark.attrs : {};
}

export function setMark(type: MarkType, attrs?: Record<string, unknown>) {
    return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
        const selection = state.selection as TextSelection;
        const { empty, $cursor, ranges } = selection;
        if ((empty && !$cursor) || !type) return false;
        if (dispatch) {
            if ($cursor) {
                dispatch(state.tr.addStoredMark(type.create(attrs)));
            } else {
                let tr = state.tr;
                for (let i = 0; i < ranges.length; i++) {
                    let { $from, $to } = ranges[i];
                    tr.addMark($from.pos, $to.pos, type.create(attrs));
                }
                dispatch(tr.scrollIntoView());
            }
        }
        return true;
    };
}

export function unsetMark(type: MarkType) {
    return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
        const selection = state.selection as TextSelection;
        const { empty, $cursor, ranges } = selection;
        if ((empty && !$cursor) || !type) return false;
        if (dispatch) {
            let tr = state.tr;
            if ($cursor) {
                const parent = $cursor.parent;
                let markStart = -1;
                let markEnd = -1;
                let currentMarkStart = -1;
                
                parent.forEach((child: ProseMirrorNode, offset: number) => {
                    const childStart = $cursor.start() + offset;
                    const childEnd = childStart + child.nodeSize;
                    
                    if (type.isInSet(child.marks)) {
                        if (currentMarkStart === -1) currentMarkStart = childStart;
                        if ($cursor.pos >= childStart && $cursor.pos <= childEnd) {
                            markStart = currentMarkStart;
                        }
                    } else {
                        if (currentMarkStart !== -1) {
                            if (markStart !== -1 && markEnd === -1) markEnd = childStart;
                            currentMarkStart = -1;
                        }
                    }
                });
                
                if (markStart !== -1 && markEnd === -1) {
                    markEnd = $cursor.end();
                }
                
                if (markStart !== -1 && markEnd !== -1) {
                    tr.removeMark(markStart, markEnd, type);
                }
                tr.removeStoredMark(type);
                dispatch(tr.scrollIntoView());
            } else {
                for (let i = 0; i < ranges.length; i++) {
                    let { $from, $to } = ranges[i];
                    tr.removeMark($from.pos, $to.pos, type);
                }
                dispatch(tr.scrollIntoView());
            }
        }
        return true;
    };
}
