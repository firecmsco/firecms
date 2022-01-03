export declare type ItemId = string | number;
export interface TreeData {
    rootId: ItemId;
    items: Record<ItemId, TreeItem>;
}
export declare type TreeItemData = any;
export declare type TreeItem = {
    id: ItemId;
    children: ItemId[];
    hasChildren?: boolean;
    isExpanded?: boolean;
    isChildrenLoading?: boolean;
    data?: TreeItemData;
};
export declare type FlattenedTree = FlattenedItem[];
export declare type Path = number[];
export declare type FlattenedItem = {
    item: TreeItem;
    path: Path;
};
export declare type TreeSourcePosition = {
    parentId: ItemId;
    index: number;
};
export declare type TreeDestinationPosition = {
    parentId: ItemId;
    index?: number;
};
