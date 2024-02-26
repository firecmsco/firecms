import * as React from "react";
import { useMemo } from "react";

import { Entity, EntityCollection, EntityReference, ResolvedProperty } from "../../types";

import { getReferencePreviewKeys, getValueInPath, resolveCollection } from "../../util";
import {
    useCustomizationController,
    useEntityFetch,
    useNavigationController,
    useSideEntityController
} from "../../hooks";
import { PropertyPreview } from "../PropertyPreview";
import { PreviewSize } from "../PropertyPreviewProps";
import { SkeletonPropertyComponent } from "../property_previews/SkeletonPropertyComponent";
import { cn, IconButton, KeyboardTabIcon, Skeleton, Tooltip, Typography } from "@firecms/ui";
import { ErrorView } from "../../components";
import { useAnalyticsController } from "../../hooks/useAnalyticsController";

export type ReferencePreviewProps = {
    disabled?: boolean;
    reference: EntityReference,
    size: PreviewSize;
    previewProperties?: string[];
    onClick?: (e: React.SyntheticEvent) => void;
    onHover?: boolean;
    allowEntityNavigation?: boolean;
};

/**
 * @group Preview components
 */
export const ReferencePreview = React.memo<ReferencePreviewProps>(function ReferencePreview(props: ReferencePreviewProps) {
    const reference = props.reference;
    if (!(typeof reference === "object" && "isEntityReference" in reference && reference.isEntityReference())) {
        console.warn("Reference preview received value of type", typeof reference);
        return <ReferencePreviewContainer
            onClick={props.onClick}
            size={props.size}>
            <ErrorView error={"Unexpected value. Click to edit"}
                       tooltip={JSON.stringify(reference)}/>
        </ReferencePreviewContainer>;
    }
    return <ReferencePreviewInternal {...props} />;
}, areEqual) as React.FunctionComponent<ReferencePreviewProps>;

function areEqual(prevProps: ReferencePreviewProps, nextProps: ReferencePreviewProps) {
    return prevProps.disabled === nextProps.disabled &&
        prevProps.size === nextProps.size &&
        prevProps.onHover === nextProps.onHover &&
        prevProps.reference?.id === nextProps.reference?.id &&
        prevProps.reference?.path === nextProps.reference?.path &&
        prevProps.allowEntityNavigation === nextProps.allowEntityNavigation
        ;
}

function ReferencePreviewInternal<M extends Record<string, any>>({
                                                                     disabled,
                                                                     reference,
                                                                     previewProperties,
                                                                     size,
                                                                     onHover,
                                                                     onClick,
                                                                     allowEntityNavigation = true
                                                                 }: ReferencePreviewProps) {

    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();

    const collection = navigationController.getCollection<EntityCollection<M>>(reference.path);
    if (!collection) {
        if (customizationController.components?.missingReference) {
            return <customizationController.components.missingReference path={reference.path}/>;
        } else {
            throw Error(`Couldn't find the corresponding collection view for the path: ${reference.path}`);
        }
    }

    return <ReferencePreviewExisting
        reference={reference}
        collection={collection}
        previewProperties={previewProperties}
        size={size}
        disabled={disabled}
        allowEntityNavigation={allowEntityNavigation}
        onClick={onClick}
        onHover={onHover}/>
}

function ReferencePreviewExisting<M extends Record<string, any> = any>({ reference, collection, previewProperties, size, disabled, allowEntityNavigation, onClick, onHover }: ReferencePreviewProps & {
    collection: EntityCollection<M>
}) {

    const customizationController = useCustomizationController();

    const analyticsController = useAnalyticsController();
    const sideEntityController = useSideEntityController();

    const {
        entity,
        dataLoading,
        dataLoadingError
    } = useEntityFetch({
        path: reference.path,
        entityId: reference.id,
        collection,
        useCache: true
    });

    if (entity) {
        referencesCache.set(reference.pathWithId, entity);
    }

    const usedEntity = entity ?? referencesCache.get(reference.pathWithId);

    const resolvedCollection = useMemo(() => resolveCollection({
        collection,
        path: reference.path,
        values: usedEntity?.values,
        fields: customizationController.propertyConfigs
    }), [collection]);

    const listProperties = useMemo(() => getReferencePreviewKeys(resolvedCollection, customizationController.propertyConfigs, previewProperties, size === "small" || size === "medium" ? 3 : 1),
        [previewProperties, resolvedCollection, size]);

    let body: React.ReactNode;

    if (!resolvedCollection) {
        return <ErrorView
            error={"Could not find collection with id " + resolvedCollection}/>
    }

    if (!reference) {
        body = <ErrorView error={"Reference not set"}/>;
    } else if (usedEntity && !usedEntity.values) {
        body = <ErrorView error={"Reference does not exist"}
                          tooltip={reference.path}/>;
    } else {
        body = (
            <>
                <div
                    className="flex flex-col flex-grow w-full max-w-[calc(100%-52px)] m-1">

                    {size !== "tiny" && (
                        reference
                            ? <div className={`${
                                size !== "medium"
                                    ? "block whitespace-nowrap overflow-hidden truncate"
                                    : ""
                            }`}>
                                <Typography variant={"caption"}
                                            className={"font-mono"}>
                                    {reference.id}
                                </Typography>
                            </div>
                            : <Skeleton/>)}

                    {listProperties && listProperties.map((key) => {
                        const childProperty = resolvedCollection.properties[key as string];
                        if (!childProperty) return null;

                        return (
                            <div key={"ref_prev_" + (key as string)}
                                 className={listProperties.length > 1 ? "my-0.5" : "my-0"}>
                                {
                                    usedEntity
                                        ? <PropertyPreview
                                            propertyKey={key as string}
                                            value={getValueInPath(usedEntity.values, key)}
                                            property={childProperty as ResolvedProperty}
                                            // entity={usedEntity}
                                            size={"tiny"}/>
                                        : <SkeletonPropertyComponent
                                            property={childProperty as ResolvedProperty}
                                            size={"tiny"}/>
                                }
                            </div>
                        );
                    })}

                </div>
                <div className={`my-${size === "tiny" ? 2 : 4}`}>
                    {!disabled && usedEntity && allowEntityNavigation &&
                        <Tooltip title={`See details for ${usedEntity.id}`}>
                            <IconButton
                                color={"inherit"}
                                size={"small"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    analyticsController.onAnalyticsEvent?.("entity_click_from_reference", {
                                        path: usedEntity.path,
                                        entityId: usedEntity.id
                                    });
                                    sideEntityController.open({
                                        entityId: usedEntity.id,
                                        path: usedEntity.path,
                                        collection: resolvedCollection,
                                        updateUrl: true
                                    });
                                }}>
                                <KeyboardTabIcon size={"small"}/>
                            </IconButton>
                        </Tooltip>}
                </div>
            </>
        );
    }

    return (
        <ReferencePreviewContainer onClick={disabled ? undefined : onClick}
                                   onHover={disabled ? undefined : onHover}
                                   size={size}>
            {body}
        </ReferencePreviewContainer>
    );
}

export function ReferencePreviewContainer({
                                              children,
                                              onHover,
                                              size,
                                              onClick
                                          }: {
    children: React.ReactNode;
    onHover?: boolean;
    size: PreviewSize;
    onClick?: (e: React.SyntheticEvent) => void;
}) {
    return <Typography variant={"label"}
                       className={cn("bg-opacity-70 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-60",
                           "w-full",
                           "flex",
                           "rounded-md",
                           "overflow-hidden",
                           onHover ? "hover:bg-opacity-90 dark:hover:bg-opacity-90" : "",
                           size === "medium" ? "p-2" : "p-1",
                           size === "tiny" ? "items-center" : "",
                           "transition-colors duration-300 ease-in-out ",
                           // onHover ? "shadow-outline" : "",
                           onClick ? "cursor-pointer" : "")}
                       style={{
                           // @ts-ignore
                           tabindex: 0
                       }}
                       onClick={(event) => {
                           if (onClick) {
                               event.preventDefault();
                               onClick(event);
                           }
                       }}>

        {children}

    </Typography>
}

const referencesCache = new Map<string, Entity<any>>();
