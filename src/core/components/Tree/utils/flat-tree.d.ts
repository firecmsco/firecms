import { Path, FlattenedTree, ItemId, FlattenedItem } from '../types';
export declare const getFlatItemPath: (flattenedTree: FlattenedTree, sourceIndex: number) => Path;
export declare const getSourcePath: (flattenedTree: FlattenedTree, sourceIndex: number) => Path;
export declare const getDestinationPath: (flattenedTree: FlattenedTree, sourceIndex: number, destinationIndex: number, level?: number | undefined) => Path;
export declare const getItemById: (flattenedTree: FlattenedTree, id: ItemId) => FlattenedItem | undefined;
export declare const getIndexById: (flattenedTree: FlattenedTree, id: ItemId) => number;
