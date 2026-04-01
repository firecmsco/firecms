import { keymap } from "prosemirror-keymap";

export const customKeymapPlugin = () => {
  return keymap({
    "Mod-a": (state, dispatch) => {
      const { tr } = state;
      const startSelectionPos = tr.selection.from;
      const endSelectionPos = tr.selection.to;
      const startNodePos = tr.selection.$from.start();
      const endNodePos = tr.selection.$to.end();

      const isCurrentTextSelectionNotExtendedToNodeBoundaries =
        startSelectionPos > startNodePos || endSelectionPos < endNodePos;

      if (isCurrentTextSelectionNotExtendedToNodeBoundaries) {
        if (dispatch) {
          dispatch(tr.setSelection((state.selection.constructor as any).create(state.doc, startNodePos, endNodePos)));
        }
        return true;
      }
      return false;
    },
  });
};
