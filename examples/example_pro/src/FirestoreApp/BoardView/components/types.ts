import { CSSProperties } from "react";

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
    provided?: any; // Now optional and type-agnostic
    isClone?: boolean;
    isGroupedOver?: boolean;
    style?: CSSProperties;
    index?: number;
}
