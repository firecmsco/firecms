import { getTreePosition } from '../../utils/tree';
import { getDestinationPath, getSourcePath } from '../../utils/flat-tree';

/*
    Translates a drag&drop movement from an index based position to a relative (parent, index) position
*/
export const calculateFinalDropPositions = (tree, flattenedTree, dragState) => {
  const {
    source,
    destination,
    combine,
    horizontalLevel
  } = dragState;
  const sourcePath = getSourcePath(flattenedTree, source.index);
  const sourcePosition = getTreePosition(tree, sourcePath);

  if (combine) {
    return {
      sourcePosition,
      destinationPosition: {
        parentId: combine.draggableId
      }
    };
  }

  if (!destination) {
    return {
      sourcePosition,
      destinationPosition: undefined
    };
  }

  const destinationPath = getDestinationPath(flattenedTree, source.index, destination.index, horizontalLevel);
  const destinationPosition = { ...getTreePosition(tree, destinationPath)
  };
  return {
    sourcePosition,
    destinationPosition
  };
};