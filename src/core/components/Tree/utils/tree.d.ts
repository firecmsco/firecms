import { FlattenedItem, Path, TreeData, TreeItemData, ItemId, TreeItem, TreeSourcePosition, TreeDestinationPosition } from '../types';
export declare type TreeItemMutation = {
    id?: ItemId;
    children?: ItemId[];
    hasChildren?: boolean;
    isExpanded?: boolean;
    isChildrenLoading?: boolean;
    data?: TreeItemData;
};
export declare const flattenTree: (tree: TreeData, path?: Path) => FlattenedItem[];
export declare const mutateTree: (tree: TreeData, itemId: ItemId, mutation: TreeItemMutation) => TreeData;
export declare const getItem: (tree: TreeData, path: Path) => TreeItem;
export declare const getParent: (tree: TreeData, path: Path) => TreeItem;
export declare const getTreePosition: (tree: TreeData, path: Path) => TreeSourcePosition;
export declare const moveItemOnTree: (tree: TreeData, from: TreeSourcePosition, to: TreeDestinationPosition) => TreeData;
