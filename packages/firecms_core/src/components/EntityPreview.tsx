import * as React from "react";
import { useEffect, useMemo } from "react";

import { Entity, EntityCollection, PreviewSize, Property } from "@firecms/types";

import { getEntityImagePreviewPropertyKey, getValueInPath } from "@firecms/common";
import { cls, defaultBorderMixin, IconButton, KeyboardTabIcon, Skeleton, Tooltip, Typography } from "@firecms/ui";
import { PropertyPreview, SkeletonPropertyComponent } from "../preview";
import {
    useAuthController,
    useCustomizationController,
    useDataSource,
    useNavigationController,
    useSideEntityController
} from "../hooks";
import { useAnalyticsController } from "../hooks/useAnalyticsController";
import { getPropertyInPath, IconForView } from "../util";
import { getEntityPreviewKeys, getEntityTitlePropertyKey } from "../util/references";

export type EntityPreviewProps = {
    size?: PreviewSize,
    actions?: React.ReactNode,
    collection?: EntityCollection,
    hover?: boolean;
    previewKeys?: string[],
    disabled?: boolean,
    entity: Entity<any>,
    includeId?: boolean,
    includeTitle?: boolean,
    includeEntityLink?: boolean,
    includeImage?: boolean,
    onClick?: (e: React.SyntheticEvent) => void;
    onSideEntityClick?: (entity: Entity) => void,
};

export type EntityPreviewDataProps = {
    size?: "smallest" | "small" | "medium" | "large",
    actions?: React.ReactNode,
    collection?: EntityCollection,
    previewKeys?: string[],
    entity: Entity<any>,
    onSideEntityClick?: (entity: Entity) => void,
    includeId?: boolean,
    includeTitle?: boolean,
    includeEntityLink?: boolean,
    includeImage?: boolean,
};

/**
 * This component contains the main logic and content for displaying an entity preview,
 * without any container wrapper. Used internally by EntityPreview.
 */
export function EntityPreviewData({
                                      actions,
                                      collection: collectionProp,
                                      previewKeys,
                                      size = "medium",
                                      includeId = true,
                                      onSideEntityClick,
                                      includeTitle = true,
                                      includeEntityLink = true,
                                      includeImage = true,
                                      entity
                                  }: EntityPreviewDataProps) {

    const authController = useAuthController();
    const analyticsController = useAnalyticsController();
    const sideEntityController = useSideEntityController();
    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();

    const collection = collectionProp ?? navigationController.getCollection(entity.path);

    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${entity.path}`);
    }

    const listProperties = useMemo(() => previewKeys ?? getEntityPreviewKeys(authController, collection, customizationController.propertyConfigs, previewKeys, size === "medium" || size === "large" ? 3 : 2),
        [previewKeys, collection, size]);

    const titleProperty = includeTitle ? getEntityTitlePropertyKey(collection, customizationController.propertyConfigs) : undefined;
    const imagePropertyKey = includeImage ? getEntityImagePreviewPropertyKey(collection) : undefined;
    const imageProperty = imagePropertyKey ? collection.properties[imagePropertyKey] : undefined;
    const usedImageProperty = imageProperty && "of" in imageProperty ? imageProperty.of : imageProperty;
    const restProperties = listProperties.filter(p => p !== titleProperty && p !== imagePropertyKey);

    const imageValue = imagePropertyKey ? getValueInPath(entity.values, imagePropertyKey) : undefined;
    const usedImageValue = imageProperty !== undefined ? ("of" in imageProperty
            ? ((imageValue ?? []).length > 0
                ? imageValue[0] : undefined)
            : imageValue)
        : undefined;

    return (
        <>
            <div className={cls("flex  shrink-0", {
                "w-6 h-6 ml-0 mr-0 my-0.5": size === "small" || size === "smallest",
                "w-8 h-8 ml-1 mr-2 m-2 self-start": size === "medium",
                "w-10 h-10 ml-2 mr-2 m-2 self-start": size === "large"
            })}>
                {usedImageProperty && usedImageValue && <PropertyPreview property={usedImageProperty}
                                                                         propertyKey={imagePropertyKey as string}
                                                                         size={"small"}
                                                                         value={usedImageValue}/>}
                {(!usedImageProperty || !usedImageValue) && <IconForView collectionOrView={collection}
                                                                         color={"primary"}
                                                                         size={size}
                                                                         className={"m-auto p-1"}/>}
            </div>

            <div
                className={"flex flex-col grow w-full m-1 shrink min-w-0 text-text-primary dark:text-text-primary-dark flex-1 mr-2"}>

                {includeId && (
                    entity
                        ? <div className={"block whitespace-nowrap overflow-hidden truncate"}>
                            <Typography variant={"caption"}
                                        color={"disabled"}
                                        className={"font-mono"}>
                                {entity.id}
                            </Typography>
                        </div>
                        : <Skeleton/>)}

                {titleProperty && (
                    <div
                        className={"truncate my-0.5 text-sm font-medium text-text-primary dark:text-text-primary-dark"}>
                        {
                            entity
                                ? <PropertyPreview
                                    propertyKey={titleProperty as string}
                                    value={getValueInPath(entity.values, titleProperty)}
                                    property={collection.properties[titleProperty as string] as Property}
                                    size={"large"}/>
                                : <SkeletonPropertyComponent
                                    property={collection.properties[titleProperty as string] as Property}
                                    size={"large"}/>
                        }
                    </div>
                )}

                {restProperties && restProperties.map((key) => {
                    const childProperty = getPropertyInPath(collection.properties, key);
                    if (!childProperty) return null;

                    const valueInPath = getValueInPath(entity.values, key);
                    return (
                        <div key={"ref_prev_" + key}
                             className={cls("truncate", restProperties.length > 1 ? "my-0.5" : "my-0")}>
                            {
                                entity
                                    ? <PropertyPreview
                                        propertyKey={key as string}
                                        value={valueInPath}
                                        property={childProperty as Property}
                                        size={"small"}/>
                                    : <SkeletonPropertyComponent
                                        property={childProperty as Property}
                                        size={"small"}/>
                            }
                        </div>
                    );
                })}

            </div>

            {entity && includeEntityLink &&
                <div className="flex-shrink-0">
                    <Tooltip title={`See details for ${entity.id}`} className={"shrink-0"}>
                        <IconButton
                            color={"inherit"}
                            size={"small"}
                            className={size !== "small" ? "self-start" : ""}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onSideEntityClick?.(entity);
                                analyticsController.onAnalyticsEvent?.("entity_click_from_reference", {
                                    path: entity.path,
                                    entityId: entity.id
                                });
                                sideEntityController.open({
                                    entityId: entity.id,
                                    path: entity.path,
                                    collection,
                                    updateUrl: true
                                });
                            }}>
                            <KeyboardTabIcon size={"small"}/>
                        </IconButton>
                    </Tooltip>
                </div>}

            {actions && <div className="flex-shrink-0">{actions}</div>}
        </>
    );
}

export function EntityPreviewWithId({
                                        entityId,
                                        path,
                                        ...props
                                    }: Omit<EntityPreviewProps, "entity"> & {
    entityId: string | number;
    path: string;
    databaseId?: string;
}) {

    const [entity, setEntity] = React.useState<Entity | undefined>();
    const [dataLoading, setDataLoading] = React.useState(false);
    const dataSource = useDataSource();

    useEffect(() => {
        let isMounted = true;
        if (!entityId || !path) {
            setEntity(undefined);
            return;
        }
        const fetchEntity = async () => {
            setDataLoading(true);
            try {
                const fetchedEntity = await dataSource.fetchEntity({
                    path,
                    entityId,
                    databaseId: props.databaseId
                });
                if (isMounted) {
                    setEntity(fetchedEntity);
                }
            } catch (error) {
                console.error("Error fetching entity:", error);
                if (isMounted) {
                    setEntity(undefined);
                }
            } finally {
                if (isMounted) {
                    setDataLoading(false);
                }
            }
        }

        fetchEntity();

        return () => {
            isMounted = false;
        }
    }, [entityId, path]);

    if (dataLoading && !entity) {
        return (
            <EntityPreviewContainer
                hover={props.hover}
                size={props.size}>
                <Skeleton/>
            </EntityPreviewContainer>
        );
    }

    if (!entity) {
        return (
            <EntityPreviewContainer
                hover={props.hover}
                size={props.size}>
                <div className={"text-text-secondary dark:text-text-secondary-dark"}>
                    Entity not found
                </div>
            </EntityPreviewContainer>
        );
    }

    return <EntityPreviewData
        {...props}
        entity={entity}/>;
}

/**
 * This view is used to display a preview of an entity.
 * It is used by default in reference fields and whenever a reference is displayed.
 */
export function EntityPreview({
                                  actions,
                                  disabled,
                                  hover,
                                  collection,
                                  previewKeys,
                                  onClick,
                                  size = "medium",
                                  includeId = true,
                                  includeTitle = true,
                                  includeEntityLink = true,
                                  includeImage = true,
                                  onSideEntityClick,
                                  entity
                              }: EntityPreviewProps) {

    return (
        <EntityPreviewContainer
            onClick={disabled ? undefined : onClick}
            hover={disabled ? undefined : hover}
            size={size}>
            <EntityPreviewData
                actions={actions}
                collection={collection}
                previewKeys={previewKeys}
                size={size}
                includeId={includeId}
                includeTitle={includeTitle}
                includeEntityLink={includeEntityLink}
                includeImage={includeImage}
                onSideEntityClick={onSideEntityClick}
                entity={entity}
            />
        </EntityPreviewContainer>
    );
}

export type EntityPreviewContainerProps = {
    children: React.ReactNode;
    hover?: boolean;
    fullwidth?: boolean;
    size?: PreviewSize;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.SyntheticEvent) => void;
};

export const EntityPreviewContainer = React.forwardRef<HTMLDivElement, EntityPreviewContainerProps>(({
                                                                                                         children,
                                                                                                         hover,
                                                                                                         onClick,
                                                                                                         size = "medium",
                                                                                                         style,
                                                                                                         className,
                                                                                                         fullwidth = true,
                                                                                                         ...props
                                                                                                     }, ref) => {
    return <div
        ref={ref}
        style={{
            ...style,
            // @ts-ignore
            tabindex: 0
        }}
        className={cls(
            "bg-white dark:bg-surface-900",
            "min-h-[42px]",
            fullwidth ? "w-full" : "",
            "items-center",
            hover ? "hover:bg-surface-accent-50 dark:hover:bg-surface-800 group-hover:bg-surface-accent-50 dark:group-hover:bg-surface-800" : "",
            size === "small" ? "p-1" : "px-2 py-1",
            "flex border rounded-lg",
            onClick ? "cursor-pointer" : "",
            defaultBorderMixin,
            className)}
        onClick={(event) => {
            if (onClick) {
                event.preventDefault();
                onClick(event);
            }
        }}
        {...props}>
        {children}
    </div>;
});

EntityPreviewContainer.displayName = "EntityPreviewContainer";
