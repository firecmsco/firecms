import { CSSProperties } from "react";
import { DraggableProvided } from "@hello-pangea/dnd";

export interface Item<T extends object = object> {
  id: string;
  content: T;
}

export interface ItemMap<T extends object = object> {
  [key: string]: Item<T>[];
}

export interface ItemViewProps<T extends object> {
    item: Item<T>;
    isDragging: boolean;
    provided: DraggableProvided;
    isClone?: boolean;
    isGroupedOver?: boolean;
    style?: CSSProperties;
    index?: number;
}
