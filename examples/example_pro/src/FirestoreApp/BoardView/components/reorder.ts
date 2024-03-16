import type { DraggableLocation } from "@hello-pangea/dnd";
import type { Item, ItemMap } from "./types";

// a little function to help us with reordering the result
function reorder<TItem>(
    list: TItem[],
    startIndex: number,
    endIndex: number,
): TItem[] {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
}

export default reorder;

interface ReorderItemMapArgs<T extends object> {
    itemMap: ItemMap<T>;
    source: DraggableLocation;
    destination: DraggableLocation;
}

export interface ReorderItemMapResult<T extends object> {
    itemMap: ItemMap<T>;
}

export const reorderItemMap = <T extends object>({
                                                     itemMap,
                                                     source,
                                                     destination,
                                                 }: ReorderItemMapArgs<T>): ReorderItemMapResult<T> => {
    const current: Item<T>[] = [...itemMap[source.droppableId]];
    const next: Item<T>[] = [...itemMap[destination.droppableId]];
    const target: Item<T> = current[source.index];

    // moving to same list
    if (source.droppableId === destination.droppableId) {
        const reordered: Item<T>[] = reorder<Item<T>>(
            current,
            source.index,
            destination.index
        );
        const result: ItemMap<T> = {
            ...itemMap,
            [source.droppableId]: reordered,
        };
        return {
            itemMap: result
        };
    }

    // moving to different list

    // remove from original
    current.splice(source.index, 1);
    // insert into next
    next.splice(destination.index, 0, target);

    const result: ItemMap<T> = {
        ...itemMap,
        [source.droppableId]: current,
        [destination.droppableId]: next,
    };

    return {
        itemMap: result,
    };
};

interface List<T> {
    id: string;
    values: T[];
}

interface MoveBetweenArgs<T> {
    list1: List<T>;
    list2: List<T>;
    source: DraggableLocation;
    destination: DraggableLocation;
}

interface MoveBetweenResult<T> {
    list1: List<T>;
    list2: List<T>;
}

export function moveBetween<T>({
                                   list1,
                                   list2,
                                   source,
                                   destination,
                               }: MoveBetweenArgs<T>): MoveBetweenResult<T> {
    const newFirst = [...list1.values];
    const newSecond = [...list2.values];

    const moveFrom = source.droppableId === list1.id ? newFirst : newSecond;
    const moveTo = moveFrom === newFirst ? newSecond : newFirst;

    const [moved] = moveFrom.splice(source.index, 1);
    moveTo.splice(destination.index, 0, moved);

    return {
        list1: {
            ...list1,
            values: newFirst,
        },
        list2: {
            ...list2,
            values: newSecond,
        },
    };
}
