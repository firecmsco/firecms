import { DragState } from './Tree-types';
import { TreeSourcePosition, TreeDestinationPosition, TreeData, FlattenedTree } from '../../types';
export declare const calculateFinalDropPositions: (tree: TreeData, flattenedTree: FlattenedTree, dragState: DragState) => {
    sourcePosition: TreeSourcePosition;
    destinationPosition?: TreeDestinationPosition | undefined;
};
