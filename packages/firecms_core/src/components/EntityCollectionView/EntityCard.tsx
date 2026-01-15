import React, { useMemo } from "react";
import {
    CollectionSize,
    Entity,
    EntityCollection
} from "@firecms/types";
import {
    getEntityImagePreviewPropertyKey,
    getValueInPath,
} from "@firecms/common";
import {
    Card,
    Checkbox,
    cls,
    KeyboardTabIcon,
    IconButton,
    Skeleton,
    Tooltip,
    Typography
} from "@firecms/ui";
import { PropertyPreview, SkeletonPropertyComponent } from "../../preview";
import {
    useAuthController,
    useCustomizationController,
    useNavigationController,
    useSideEntityController
} from "../../hooks";
import { useAnalyticsController } from "../../hooks/useAnalyticsController";
import { getEntityTitlePropertyKey , getEntityPreviewKeys} from "../../util/references";
import { IconForView } from "../../util";

export type EntityCardProps<M extends Record<string, any> = any> = {
    entity: Entity<M>;
    collection: EntityCollection<M>;
    onClick?: (entity: Entity<M>) => void;
    selected?: boolean;
    highlighted?: boolean;
    onSelectionChange?: (entity: Entity<M>, selected: boolean) => void;
    selectionEnabled?: boolean;
    /**
     * Size of the card - affects checkbox styling
     */
    size?: CollectionSize;
};

/**
 * Card component for displaying an entity in a grid view.
 * Shows thumbnail, title, and preview properties.
 */
export function EntityCard<M extends Record<string, any> = any>({
    entity,
    collection,
    onClick,
    selected,
    highlighted,
    onSelectionChange,
    selectionEnabled,
    size = "m"
}: EntityCardProps<M>) {
    const authController = useAuthController();
    const analyticsController = useAnalyticsController();
    const sideEntityController = useSideEntityController();
    const customizationController = useCustomizationController();
    const navigationController = useNavigationController();

    const resolvedCollection = collection;

    const titlePropertyKey = useMemo(
        () => getEntityTitlePropertyKey(resolvedCollection, customizationController.propertyConfigs),
        [resolvedCollection, customizationController.propertyConfigs]
    );

    const imagePropertyKey = useMemo(
        () => getEntityImagePreviewPropertyKey(resolvedCollection),
        [resolvedCollection]
    );

    const previewKeys = useMemo(
        () => getEntityPreviewKeys(authController, resolvedCollection, customizationController.propertyConfigs, undefined, 2)
            .filter(key => key !== titlePropertyKey && key !== imagePropertyKey),
        [authController, resolvedCollection, customizationController.propertyConfigs, titlePropertyKey, imagePropertyKey]
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
    const titleProperty = titlePropertyKey ? resolvedCollection.properties[titlePropertyKey] : undefined;

    const handleClick = (e?: React.MouseEvent) => {
        // Cmd+click (Mac) or Ctrl+click (Windows) toggles selection
        if (e && (e.metaKey || e.ctrlKey) && selectionEnabled) {
            e.preventDefault();
            onSelectionChange?.(entity, !selected);
            return;
        }
        if (onClick) {
            onClick(entity);
        }
    };

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleSelectionChange = (checked: boolean) => {
        onSelectionChange?.(entity, checked);
    };


    return (
        <Card
            className={cls(
                "cursor-pointer overflow-hidden group relative",
                "transition-all duration-200",
                "hover:shadow-lg hover:-translate-y-0.5",
                selected && "ring-2 ring-primary",
                highlighted && !selected && "ring-2 ring-primary ring-opacity-50"
            )}
            onClick={handleClick}
        >
            {/* Thumbnail area */}
            <div className="aspect-[4/3] relative overflow-hidden bg-surface-100 dark:bg-surface-800">
                {usedImageProperty && usedImageValue ? (
                    <div className="w-full h-full">
                        <PropertyPreview
                            property={usedImageProperty}
                            propertyKey={imagePropertyKey as string}
                            size="medium"
                            value={usedImageValue}
                            fill={true}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <IconForView
                            collectionOrView={collection}
                            color="disabled"
                            size="large"
                        />
                    </div>
                )}

                {/* Hover overlay */}
                <div className={cls(
                    "absolute inset-0 bg-black/0 group-hover:bg-black/10",
                    "transition-colors duration-200"
                )} />

                {/* Selection checkbox */}
                {selectionEnabled && (
                    <div
                        className={cls(
                            "absolute",
                            size === "xs" || size === "s" ? "top-1 left-1" : "top-2 left-2"
                        )}
                        onClick={handleCheckboxClick}
                    >
                        <Checkbox
                            checked={selected ?? false}
                            onCheckedChange={handleSelectionChange}
                            size={size === "xs" ? "smallest" : "small"}
                        />
                    </div>
                )}

            </div>

            {/* Content area */}
            <div className="p-3">
                {/* Entity ID */}
                <Typography
                    variant="caption"
                    color="disabled"
                    className="font-mono truncate block"
                >
                    {entity.id}
                </Typography>

                {/* Title */}
                <div className="truncate my-1 text-sm font-medium min-h-[20px]">
                    {titleProperty && titleValue ? (
                        <PropertyPreview
                            propertyKey={titlePropertyKey as string}
                            value={titleValue}
                            property={titleProperty}
                            size="small"
                        />
                    ) : (
                        <Typography variant="body2" className="text-surface-500">
                            {entity.id}
                        </Typography>
                    )}
                </div>

                {/* Preview properties */}
                {previewKeys.slice(0, 2).map((key) => {
                    const property = resolvedCollection.properties[key];
                    if (!property) return null;
                    const value = getValueInPath(entity.values, key);
                    return (
                        <div key={key} className="truncate text-xs text-surface-600 dark:text-surface-400">
                            <PropertyPreview
                                propertyKey={key}
                                value={value}
                                property={property}
                                size="small"
                            />
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
