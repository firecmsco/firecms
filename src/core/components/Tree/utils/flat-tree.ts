import { Path, FlattenedTree, ItemId, FlattenedItem } from '../types';

import {
  isTopOfSubtree,
  hasSameParent,
  getPathOnLevel,
  moveAfterPath,
} from './path';

import { between } from './handy';

export const getFlatItemPath = (
  flattenedTree: FlattenedTree,
  sourceIndex: number,
): Path => flattenedTree[sourceIndex].path;

/*
  Calculates the source path after drag&drop ends
 */
export const getSourcePath = getFlatItemPath;

/*
    Calculates the destination path after drag&drop ends

    During dragging the items are displaced based on the location of the dragged item.
    Displacement depends on which direction the item is coming from.

    index
          -----------        -----------
    0     | item 0           | item 1 (displaced)
          -----------        -----------
    1     | item 1           | item 2 (displaced)
          -----------  --->  -----------      -----------
    2     | item 2                            | item 0 (dragged)
          -----------        -----------      -----------
    3     | item 3           | item 3
          -----------        -----------

   */
export const getDestinationPath = (
  flattenedTree: FlattenedTree,
  sourceIndex: number,
  destinationIndex: number,
  // level on the tree, starting from 1.
  level?: number,
): Path => {
  // Moving down
  const down: boolean = destinationIndex > sourceIndex;
  // Path of the source location
  const sourcePath: Path = getSourcePath(flattenedTree, sourceIndex);
  // Stayed at the same place
  const sameIndex: boolean = destinationIndex === sourceIndex;
  // Path of the upper item where the item was dropped
  const upperPath: Path = down
    ? flattenedTree[destinationIndex].path
    : flattenedTree[destinationIndex - 1] &&
      flattenedTree[destinationIndex - 1].path;
  // Path of the lower item where the item was dropped
  const lowerPath: Path =
    down || sameIndex
      ? flattenedTree[destinationIndex + 1] &&
        flattenedTree[destinationIndex + 1].path
      : flattenedTree[destinationIndex].path;

  /*
    We are going to differentiate 4 cases:
      - item didn't change position, only moved horizontally
      - item moved to the top of a list
      - item moved between two items on the same level
      - item moved to the end of list. This is an ambiguous case.
  */

  // Stayed in place, might moved horizontally
  if (sameIndex) {
    if (typeof level !== 'number') {
      return sourcePath;
    }
    if (!upperPath) {
      // Not possible to move
      return sourcePath;
    }
    const minLevel = lowerPath ? lowerPath.length : 1;
    const maxLevel = Math.max(sourcePath.length, upperPath.length);
    const finalLevel = between(minLevel, maxLevel, level);
    const sameLevel: boolean = finalLevel === sourcePath.length;
    if (sameLevel) {
      // Didn't change level
      return sourcePath;
    }
    const previousPathOnTheFinalLevel: Path = getPathOnLevel(
      upperPath,
      finalLevel,
    );
    return moveAfterPath(previousPathOnTheFinalLevel, sourcePath);
  }

  // Moved to top of the list
  if (lowerPath && isTopOfSubtree(lowerPath, upperPath)) {
    return lowerPath;
  }

  // Moved between two items on the same level
  if (upperPath && lowerPath && hasSameParent(upperPath, lowerPath)) {
    if (down && hasSameParent(upperPath, sourcePath)) {
      // if item was moved down within the list, it will replace the displaced item
      return upperPath;
    }
    return lowerPath;
  }

  // Moved to end of list
  if (upperPath) {
    // this means that the upper item is deeper in the tree.
    const finalLevel = calculateFinalLevel(
      sourcePath,
      upperPath,
      lowerPath,
      level,
    );
    // Insert to higher levels
    const previousPathOnTheFinalLevel: Path = getPathOnLevel(
      upperPath,
      finalLevel,
    );
    return moveAfterPath(previousPathOnTheFinalLevel, sourcePath);
  }

  // In case of any other impossible case
  return sourcePath;
};

const calculateFinalLevel = (
  sourcePath: Path,
  upperPath: Path,
  lowerPath?: Path,
  level?: number,
): number => {
  const upperLevel: number = upperPath.length;
  const lowerLevel: number = lowerPath ? lowerPath.length : 1;
  const sourceLevel: number = sourcePath.length;
  if (typeof level === 'number') {
    // Explicit disambiguation based on level
    // Final level has to be between the levels of bounding items, inclusive
    return between(lowerLevel, upperLevel, level);
  }
  // Automatic disambiguation based on the initial level
  return sourceLevel <= lowerLevel ? lowerLevel : upperLevel;
};

export const getItemById = (
  flattenedTree: FlattenedTree,
  id: ItemId,
): FlattenedItem | undefined =>
  flattenedTree.find((item) => item.item.id === id);

export const getIndexById = (
  flattenedTree: FlattenedTree,
  id: ItemId,
): number => flattenedTree.findIndex((item) => item.item.id === id);
