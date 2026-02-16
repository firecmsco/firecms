import React, { memo, useCallback, useMemo } from "react";
import { Entity, EntityCollection, ResolvedProperty } from "../../types";
import {
    getEntityImagePreviewPropertyKey,
    getEntityTitlePropertyKey,
    getValueInPath,
    IconForView,
    resolveCollection
} from "../../util";
import { Checkbox, cls, defaultBorderMixin } from "@firecms/ui";
import { PropertyPreview } from "../../preview";
import { useAuthController, useCustomizationController } from "../../hooks";
import { BoardItemViewProps } from "./board_types";

export type EntityBoardCardProps<M extends Record<string, any> = any> = BoardItemViewProps<M> & {
    collection: EntityCollection<M>;
    onClick?: (entity: Entity<M>) => void;
    selected?: boolean;
    onSelectionChange?: (entity: Entity<M>, selected: boolean) => void;
    selectionEnabled?: boolean;
};

/**
 * Compact card component for displaying an entity in a Kanban board.
 * Shows thumbnail, title, and optional selection checkbox.
 */
function EntityBoardCardInner<M extends Record<string, any> = any>({
                                                                       item,
                                                                       isDragging,
                                                                       isGroupedOver,
                                                                       style,
                                                                       collection,
                                                                       onClick,
                                                                       selected,
                                                                       onSelectionChange,
                                                                       selectionEnabled = false
                                                                   }: EntityBoardCardProps<M>) {
    const entity = item.entity;
    const authController = useAuthController();
    const customizationController = useCustomizationController();

    const resolvedCollection = useMemo(() => resolveCollection({
        collection,
        path: entity.path,
        values: entity.values,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [collection, entity.path, entity.values, customizationController.propertyConfigs, authController]);

    const titlePropertyKey = useMemo(
        () => getEntityTitlePropertyKey(resolvedCollection, customizationController.propertyConfigs),
        [resolvedCollection, customizationController.propertyConfigs]
    );

    const imagePropertyKey = useMemo(
        () => getEntityImagePreviewPropertyKey(resolvedCollection),
        [resolvedCollection]
    );

    const imageProperty = imagePropertyKey ? resolvedCollection.properties[imagePropertyKey] : undefined;
    const usedImageProperty = imageProperty && "of" in imageProperty ? imageProperty.of : imageProperty;

    const imageValue = imagePropertyKey ? getValueInPath(entity.values, imagePropertyKey) : undefined;
    const usedImageValue = imageProperty !== undefined
        ? ("of" in imageProperty
            ? ((imageValue ?? []).length > 0 ? imageValue[0] : undefined)
            : imageValue)
        : undefined;

    const titleValue = titlePropertyKey ? getValueInPath(entity.values, titlePropertyKey) : undefined;
    const titleProperty = titlePropertyKey ? resolvedCollection.properties[titlePropertyKey] as ResolvedProperty : undefined;

    const handleClick = useCallback((e: React.MouseEvent) => {
        // Cmd+click (Mac) or Ctrl+click (Windows) toggles selection
        if ((e.metaKey || e.ctrlKey) && selectionEnabled) {
            e.preventDefault();
            e.stopPropagation();
            onSelectionChange?.(entity, !selected);
            return;
        }
        if (onClick) {
            e.stopPropagation();
            onClick(entity);
        }
    }, [entity, onClick, onSelectionChange, selected, selectionEnabled]);

    const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const handleSelectionChange = useCallback((checked: boolean) => {
        onSelectionChange?.(entity, checked);
    }, [entity, onSelectionChange]);

    // Memoize className computations
    const backgroundColor = useMemo((): string => {
        if (isDragging) {
            return "bg-surface-100 dark:bg-surface-800";
        }
        if (isGroupedOver) {
            return "bg-surface-200";
        }
        return "bg-white dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-800";
    }, [isDragging, isGroupedOver]);

    const borderColor = useMemo((): string =>
        isDragging ? "ring-2 ring-primary" : "", [isDragging]);

    // Memoize the card className
    const cardClassName = useMemo(() => cls(
        "p-2 flex items-start border rounded-lg cursor-pointer transition-colors",
        defaultBorderMixin,
        borderColor,
        backgroundColor,
        selected && "ring-2 ring-primary"
    ), [borderColor, backgroundColor, selected]);

    return (
        <div
            style={style}
            className="py-1"
            data-is-dragging={isDragging}
            data-testid={item.id}
            onClick={handleClick}
        >
            <div className={cardClassName}>
                {/* Thumbnail */}
                {usedImageProperty && usedImageValue ? (
                    <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 mr-2">
                        <PropertyPreview
                            property={usedImageProperty}
                            propertyKey={imagePropertyKey as string}
                            size="small"
                            value={usedImageValue}
                            fill={true}
                        />
                    </div>
                ) : (
                    <div
                        className="w-10 h-10 rounded-md bg-surface-100 dark:bg-surface-800 shrink-0 mr-2 flex items-center justify-center">
                        <IconForView
                            collectionOrView={collection}
                            color="disabled"
                            size="small"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="line-clamp-2 text-sm font-medium">
                        {titleProperty && titleValue ? (
                            <PropertyPreview
                                propertyKey={titlePropertyKey as string}
                                value={titleValue}
                                property={titleProperty}
                                size="small"
                            />
                        ) : (
                            <span className="text-surface-500">{entity.id}</span>
                        )}
                    </div>
                    {/* ID */}
                    <div className="text-xs text-surface-500 font-mono truncate">
                        {entity.id}
                    </div>
                </div>

                {/* Selection checkbox */}
                {selectionEnabled && (
                    <div className="ml-2 shrink-0" onClick={handleCheckboxClick}>
                        <Checkbox
                            checked={selected ?? false}
                            onCheckedChange={handleSelectionChange}
                            size="smallest"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Memoized to prevent unnecessary re-renders when other cards in the board change
export const EntityBoardCard = memo(EntityBoardCardInner) as typeof EntityBoardCardInner;

/**
 * Wrapper component that adapts EntityBoardCard to BoardItemViewProps interface
 */
export function createEntityBoardCardComponent<M extends Record<string, any>>(
    collection: EntityCollection<M>,
    options: {
        onClick?: (entity: Entity<M>) => void;
        isEntitySelected?: (entity: Entity<M>) => boolean;
        onSelectionChange?: (entity: Entity<M>, selected: boolean) => void;
        selectionEnabled?: boolean;
    }
): React.ComponentType<BoardItemViewProps<M>> {
    return function EntityBoardCardWrapper(props: BoardItemViewProps<M>) {
        return (
            <EntityBoardCard
                {...props}
                collection={collection}
                onClick={options.onClick}
                selected={options.isEntitySelected?.(props.item.entity)}
                onSelectionChange={options.onSelectionChange}
                selectionEnabled={options.selectionEnabled}
            />
        );
    };
}
