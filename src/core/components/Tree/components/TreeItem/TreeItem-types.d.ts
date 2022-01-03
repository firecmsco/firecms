import { ReactNode } from 'react';
import { DraggableProvided, DraggableStateSnapshot, DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps, DraggingStyle } from 'react-beautiful-dnd';
import { ItemId, Path, TreeItem } from '../../types';
export declare type TreeDraggingStyle = DraggingStyle & {
    paddingLeft: number;
    transition: 'none' | string;
};
export declare type DragActionType = null | 'mouse' | 'key' | 'touch';
export declare type RenderItemParams = {
    item: TreeItem;
    depth: number;
    onExpand: (itemId: ItemId) => void;
    onCollapse: (itemId: ItemId) => void;
    provided: TreeDraggableProvided;
    snapshot: DraggableStateSnapshot;
};
export declare type TreeDraggableProvided = {
    draggableProps: DraggableProvidedDraggableProps;
    dragHandleProps: DraggableProvidedDragHandleProps | null;
    innerRef: (el: HTMLElement | null) => void;
};
export declare type Props = {
    item: TreeItem;
    path: Path;
    onExpand: (itemId: ItemId, path: Path) => void;
    onCollapse: (itemId: ItemId, path: Path) => void;
    renderItem: (item: RenderItemParams) => ReactNode;
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
    itemRef: (itemId: ItemId, element: HTMLElement | null) => void;
    offsetPerLevel: number;
};
