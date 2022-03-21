import * as React from "react";
import { useMemo } from "react";

import {
    Box,
    darken,
    IconButton,
    lighten,
    Paper,
    Skeleton,
    Tooltip,
    Typography
} from "@mui/material";
import { EntityReference, ResolvedProperty } from "../../models";

import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { PreviewSize, PropertyPreview, SkeletonComponent } from "../internal";

import { ErrorView, getResolvedCollection } from "../../core";
import {
    useEntityFetch,
    useNavigationContext,
    useSideEntityController
} from "../../hooks";

export type ReferencePreviewProps = {
    path: string | false;
    reference: EntityReference,
    size: PreviewSize;
    previewProperties?: string[];
    onClick?: () => void;
    onHover?: boolean;
};

/**
 * @category Preview components
 */
export const ReferencePreview = React.memo<ReferencePreviewProps>(ReferencePreviewInternal, areEqual) as React.FunctionComponent<ReferencePreviewProps>;

function areEqual(prevProps: ReferencePreviewProps, nextProps: ReferencePreviewProps) {
    return prevProps.path === nextProps.path &&
        prevProps.size === nextProps.size &&
        prevProps.onHover === nextProps.onHover &&
        prevProps.reference?.id === nextProps.reference?.id &&
        prevProps.reference?.path === nextProps.reference?.path
        ;
}

function ReferencePreviewInternal<M>({
                                         path,
                                         reference,
                                         previewProperties,
                                         size,
                                         onHover,
                                         onClick
                                     }: ReferencePreviewProps) {

    const navigationContext = useNavigationContext();
    const sideEntityController = useSideEntityController();

    if (!path) {
        return <ReferencePreviewWrap onClick={onClick}
                                     onHover={onHover}
                                     size={size}>
            Disabled
        </ReferencePreviewWrap>
    }

    const collection = navigationContext.getCollection<M>(path);
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }

    const {
        entity,
        dataLoading,
        dataLoadingError
        // eslint-disable-next-line react-hooks/rules-of-hooks
    } = useEntityFetch({
        path: reference.path,
        entityId: reference.id,
        collection,
        useCache: true
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const resolvedCollection = useMemo(() => getResolvedCollection({
        collection,
        path: path,
        values: entity?.values
    }), [collection]);


    // eslint-disable-next-line react-hooks/rules-of-hooks
    const listProperties = useMemo(() => {
        if (!resolvedCollection) return [];
        let res = previewProperties;
        if (!res || !res.length) {
            res = Object.keys(resolvedCollection.properties);
        }

        if (size === "small" || size === "regular")
            res = res.slice(0, 3);
        else if (size === "tiny")
            res = res.slice(0, 1);
        return res;
    }, [previewProperties, resolvedCollection?.properties, size]);

    let body: JSX.Element;

    function buildError(error: string, tooltip?: string) {
        return <ErrorView error={error} tooltip={tooltip}/>;
    }

    if (!resolvedCollection) {
        return <ErrorView
            error={"Could not find collection with id " + resolvedCollection}/>
    }

    if (!reference) {
        body = buildError("Reference not set");
    } else if (!(reference instanceof EntityReference)) {
        body = buildError("Unexpected value", JSON.stringify(reference));
    } else if (entity && !entity.values) {
        body = buildError("Reference does not exist", reference.path);
    } else {
        body = (
            <>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    maxWidth: "calc(100% - 60px)",
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
                                     my: 0.5
                                 }}>
                                {entity
                                    ? <PropertyPreview
                                        propertyKey={key as string}
                                        value={entity.values[key as string]}
                                        property={childProperty as ResolvedProperty}
                                        size={"tiny"}/>
                                    : <SkeletonComponent
                                        property={childProperty as ResolvedProperty}
                                        size={"tiny"}/>
                                }
                            </Box>
                        );
                    })}

                </Box>
                <Box sx={{
                    margin: "auto"
                }}>
                    {entity &&
                        <Tooltip title={`See details for ${entity.id}`}>
                            <IconButton
                                size={size === "tiny" ? "small" : "medium"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sideEntityController.open({
                                        entityId: entity.id,
                                        path: entity.path,
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

    return <ReferencePreviewWrap onClick={onClick}
                                 onHover={onHover}
                                 size={size}>
        {body}
    </ReferencePreviewWrap>
}

function ReferencePreviewWrap({ children, onHover, size, onClick }: {
    children: React.ReactNode;
    onHover?: boolean;
    size: PreviewSize;
    onClick?: () => void;
}) {
    return <Paper elevation={0} sx={(theme) => {
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
            color: "#838383",
            backgroundColor: darken(theme.palette.background.default, 0.1),
            borderRadius: "2px",
            overflow: "hidden",
            padding: size === "regular" ? 1 : 0,
            itemsAlign: size === "tiny" ? "center" : undefined,
            fontWeight: theme.typography.fontWeightMedium,
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

    </Paper>
}
