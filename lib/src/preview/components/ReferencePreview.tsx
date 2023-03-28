import * as React from "react";
import { useMemo } from "react";

import {
    Box,
    darken,
    IconButton,
    lighten,
    Skeleton,
    Tooltip,
    Typography
} from "@mui/material";
import {
    Entity,
    EntityCollection,
    EntityReference,
    ResolvedProperty
} from "../../types";

import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import {
    PreviewSize,
    PropertyPreview,
    SkeletonPropertyComponent
} from "../index";

import {
    ErrorView,
    getReferencePreviewKeys,
    getValueInPath,
    resolveCollection
} from "../../core";
import {
    useEntityFetch,
    useFireCMSContext,
    useNavigationContext,
    useSideEntityController
} from "../../hooks";

export type ReferencePreviewProps = {
    disabled: boolean;
    reference: EntityReference,
    size: PreviewSize;
    previewProperties?: string[];
    onClick?: () => void;
    onHover?: boolean;
    allowEntityNavigation?: boolean;
};

/**
 * @category Preview components
 */
export const ReferencePreview = React.memo<ReferencePreviewProps>(ReferencePreviewInternal, areEqual) as React.FunctionComponent<ReferencePreviewProps>;

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

    const context = useFireCMSContext();

    const navigationContext = useNavigationContext();
    const sideEntityController = useSideEntityController();

    const collection = navigationContext.getCollection<EntityCollection<M>>(reference.path);
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${reference.path}`);
    }

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
        fields: context.fields
    }), [collection]);

    const listProperties = useMemo(() => getReferencePreviewKeys(resolvedCollection, context.fields, previewProperties, size === "small" || size === "regular" ? 3 : 1),
        [previewProperties, resolvedCollection, size]);

    let body: React.ReactNode;

    if (!resolvedCollection) {
        return <ErrorView
            error={"Could not find collection with id " + resolvedCollection}/>
    }

    if (!reference) {
        body = <ErrorView error={"Reference not set"}/>;
    } else if (!(reference instanceof EntityReference)) {
        console.error("Reference preview received value of type", typeof reference);
        body = <ErrorView error={"Unexpected value"}
                          tooltip={JSON.stringify(reference)}/>;
    } else if (usedEntity && !usedEntity.values) {
        body = <ErrorView error={"Reference does not exist"}
                          tooltip={reference.path}/>;
    } else {
        body = (
            <>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    maxWidth: "calc(100% - 52px)",
                    margin: 1
                }}>

                    {size !== "tiny" && (
                        reference
                            ? <Box sx={{
                                display: size !== "regular" ? "block" : undefined,
                                whiteSpace: size !== "regular" ? "nowrap" : undefined,
                                overflow: size !== "regular" ? "hidden" : undefined,
                                textOverflow: size !== "regular" ? "ellipsis" : undefined
                            }}>
                                <Typography variant={"caption"}
                                            className={"mono"}>
                                    {reference.id}
                                </Typography>
                            </Box>
                            : <Skeleton variant="text"/>)}

                    {listProperties && listProperties.map((key) => {
                        const childProperty = resolvedCollection.properties[key as string];
                        if (!childProperty) return null;

                        return (
                            <Box key={"ref_prev_" + (key as string)}
                                 sx={{
                                     my: listProperties.length > 1 ? 0.5 : 0
                                 }}>
                                {usedEntity
                                    ? <PropertyPreview
                                        propertyKey={key as string}
                                        value={getValueInPath(usedEntity.values, key)}
                                        property={childProperty as ResolvedProperty}
                                        entity={usedEntity}
                                        size={"tiny"}/>
                                    : <SkeletonPropertyComponent
                                        property={childProperty as ResolvedProperty}
                                        size={"tiny"}/>
                                }
                            </Box>
                        );
                    })}

                </Box>
                <Box sx={{
                    my: size === "tiny" ? 0.5 : 1
                }}>
                    {!disabled && usedEntity && allowEntityNavigation &&
                        <Tooltip title={`See details for ${usedEntity.id}`}>
                            <IconButton
                                color={"inherit"}
                                size={"small"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    context.onAnalyticsEvent?.("entity_click_from_reference", {
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
                                <KeyboardTabIcon fontSize={"small"}/>
                            </IconButton>
                        </Tooltip>}
                </Box>
            </>
        );
    }

    return (
        <ReferencePreviewWrap onClick={disabled ? undefined : onClick}
                              onHover={disabled ? undefined : onHover}
                              size={size}>
            {body}
        </ReferencePreviewWrap>
    );
}

function ReferencePreviewWrap({
                                  children,
                                  onHover,
                                  size,
                                  onClick
                              }: {
    children: React.ReactNode;
    onHover?: boolean;
    size: PreviewSize;
    onClick?: () => void;
}) {
    return <Typography variant={"label"} sx={(theme) => {
        const clickableStyles = onClick
            ? {
                tabindex: 0,
                backgroundColor: onHover ? (theme.palette.mode === "dark" ? lighten(theme.palette.background.default, 0.1) : darken(theme.palette.background.default, 0.15)) : darken(theme.palette.background.default, 0.1),
                transition: "background-color 300ms ease, box-shadow 300ms ease",
                boxShadow: onHover ? "0 0 0 2px rgba(128,128,128,0.05)" : undefined,
                cursor: onHover ? "pointer" : undefined
            }
            : {};
        return ({
            width: "100%",
            display: "flex",
            backgroundColor: darken(theme.palette.background.default, 0.1),
            borderRadius: `${theme.shape.borderRadius}px`,
            overflow: "hidden",
            padding: size === "regular" ? 1 : 0,
            itemsAlign: size === "tiny" ? "center" : undefined,
            ...clickableStyles
        });
    }}
                       onClick={(event) => {
                           if (onClick) {
                               event.preventDefault();
                               onClick();
                           }
                       }}>

        {children}

    </Typography>
}

const referencesCache = new Map<string, Entity<any>>();
