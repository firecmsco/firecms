import React, { CSSProperties, ReactElement } from "react";
import type {
    DraggableProvided,
    DraggableStateSnapshot,
    DroppableProvided,
    DroppableStateSnapshot
} from "@hello-pangea/dnd";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { cls } from "@firecms/ui";
import { ColumnTitle } from "./ColumnTitle";
import type { Item, ItemViewProps } from "./types";

const getBackgroundColor = (isDraggingOver: boolean, isDraggingFrom: boolean): string => {
    if (isDraggingOver) return "bg-slate-200 dark:bg-gray-800";
    if (isDraggingFrom) return "bg-slate-100 dark:bg-gray-900";
    return "bg-gray-50 dark:bg-gray-950";
};

interface SortableListProps {
    listId?: string;
    listType?: string;
    items: Item[];
    title?: string;
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    isDragging?: boolean;
    className?: string;
    style?: CSSProperties;
    useClone?: boolean;
    ItemComponent: React.ComponentType<ItemViewProps<object>>;
}

export interface ItemListProps<T extends object> {
    items: Item<T>[];
    ItemComponent: React.ComponentType<ItemViewProps<T>>;
}

function InnerItemList<T extends object>(props: ItemListProps<T>): ReactElement {
    return (
        <>
            {props.items.map((item: Item<T>, index: number) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(
                        dragProvided: DraggableProvided,
                        dragSnapshot: DraggableStateSnapshot
                    ) => (
                        <props.ItemComponent
                            key={item.id}
                            item={item}
                            isDragging={dragSnapshot.isDragging}
                            isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
                            provided={dragProvided}
                        />
                    )}
                </Draggable>
            ))}
        </>
    );
}

const InnerItemListMemo = React.memo(InnerItemList) as typeof InnerItemList;

interface InnerListProps<T extends object> {
    dropProvided: DroppableProvided;
    items: Item<T>[];
    title: string | undefined | null;
    ItemComponent: React.ComponentType<ItemViewProps<T>>;
}

function InnerList<T extends object>(props: InnerListProps<T>) {
    const {
        items,
        dropProvided,
        ItemComponent
    } = props;
    const title = props.title ? <ColumnTitle>{props.title}</ColumnTitle> : null;

    return (
        <div className={"h-full"}>
            {title}

            <div ref={dropProvided.innerRef}
                 className={cls("min-h-full pb-4",)}>
                <InnerItemListMemo items={items}
                                   ItemComponent={ItemComponent}
                />
                {dropProvided.placeholder}
            </div>
        </div>
    );
}

export default function SortableList(props: SortableListProps): ReactElement {
    const {
        isDropDisabled,
        isCombineEnabled,
        isDragging,
        listId = "LIST",
        listType,
        style,
        className,
        items,
        title,
        useClone,
        ItemComponent
    } = props;

    return (
        <Droppable
            droppableId={listId}
            type={listType}
            isDropDisabled={isDropDisabled}
            isCombineEnabled={isCombineEnabled}
            renderClone={
                useClone
                    ? (provided, snapshot, descriptor) => (
                        <ItemComponent
                            item={items[descriptor.source.index]}
                            provided={provided}
                            isDragging={snapshot.isDragging}
                            isClone
                        />
                    )
                    : undefined
            }
        >
            {(
                dropProvided: DroppableProvided,
                dropSnapshot: DroppableStateSnapshot
            ) => (
                <div

                    style={style}
                    // isDropDisabled={Boolean(isDropDisabled)}
                    {...dropProvided.droppableProps}
                    className={cls("flex flex-col p-4 transition-opacity duration-100 transition-bg ease-linear w-64",
                        "h-full w-full overflow-y-auto flex-1",
                        "rounded-md",
                        isDropDisabled ? "opacity-50" : "opacity-100",
                        className,
                        getBackgroundColor(
                            dropSnapshot.isDraggingOver,
                            Boolean(dropSnapshot.draggingFromThisWith)
                        )
                    )}>
                    <InnerList
                        items={items}
                        title={title}
                        dropProvided={dropProvided}
                        ItemComponent={ItemComponent}
                    />

                </div>
            )
            }
        </Droppable>
    );
}
