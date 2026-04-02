import { keymap } from "prosemirror-keymap";
import { TextSelection } from "prosemirror-state";

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
          dispatch(tr.setSelection(TextSelection.create(state.doc, startNodePos, endNodePos)));
        }
        return true;
      }
      return false;
    },
  });
};
