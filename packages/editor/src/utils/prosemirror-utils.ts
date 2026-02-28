import { EditorState } from "prosemirror-state";

export function isMarkActive(state: EditorState, type: any) {
    if (!state || !type) return false;
    const { from, $from, to, empty } = state.selection;
    if (empty) return !!type.isInSet(state.storedMarks || $from.marks());
    return state.doc.rangeHasMark(from, to, type);
}

export function isNodeActive(state: EditorState, type: any, attrs: any = {}) {
    if (!state || !type) return false;
    const { $from, to, node } = state.selection as any;
    if (node) {
        return node.type === type && (!attrs || Object.keys(attrs).every((key) => node.attrs[key] === attrs[key]));
    }
    return to <= $from.end() && $from.parent.type === type && (!attrs || Object.keys(attrs).every((key) => $from.parent.attrs[key] === attrs[key]));
}

export function getMarkAttributes(state: EditorState, type: any) {
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

export function setMark(type: any, attrs?: any) {
    return (state: EditorState, dispatch?: (tr: any) => void) => {
        const { empty, $cursor, ranges } = state.selection as any;
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

export function unsetMark(type: any) {
    return (state: EditorState, dispatch?: (tr: any) => void) => {
        const { empty, $cursor, ranges } = state.selection as any;
        if ((empty && !$cursor) || !type) return false;
        if (dispatch) {
            if ($cursor) {
                dispatch(state.tr.removeStoredMark(type));
            } else {
                let tr = state.tr;
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
