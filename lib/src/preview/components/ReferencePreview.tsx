import * as React from "react";
import { MouseEventHandler, useMemo } from "react";

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
import {
    PreviewComponent,
    PreviewComponentProps,
    PreviewSize
} from "../internal";

import { SkeletonComponent } from "./SkeletonComponent";
import { ErrorView } from "../../core";
import {
    useEntityFetch,
    useNavigation,
    useSideEntityController
} from "../../hooks";
import { useSchemaRegistry } from "../../hooks/useSchemaRegistry";

export type ReferencePreviewProps =
    PreviewComponentProps<EntityReference>
    & { onHover?: boolean };

/**
 * @category Preview components
 */
export const ReferencePreview = React.memo<ReferencePreviewProps>(ReferencePreviewComponent, areEqual) as React.FunctionComponent<ReferencePreviewProps>;

function areEqual(prevProps: ReferencePreviewProps, nextProps: ReferencePreviewProps) {
    return prevProps.propertyKey === nextProps.propertyKey &&
        prevProps.size === nextProps.size &&
        prevProps.height === nextProps.height &&
        prevProps.width === nextProps.width &&
        prevProps.onHover === nextProps.onHover &&
        prevProps.value?.id === nextProps.value?.id &&
        prevProps.value?.path === nextProps.value?.path
        ;
}

function ReferencePreviewComponent<M extends { [Key: string]: any }>(
    {
        value,
        property,
        onClick,
        size,
        onHover
    }: ReferencePreviewProps) {

    const reference: EntityReference = value;
    const previewProperties = property.previewProperties;

    if (!property.path) {
        return <ReferencePreviewWrap onClick={onClick}
                                     onHover={onHover}
                                     size={size}>
            Disabled
        </ReferencePreviewWrap>
    }

    return <ReferencePreviewInternal path={property.path}
                                     reference={reference}
                                     size={size}
                                     onHover={onHover}
                                     onClick={onClick}
                                     previewProperties={previewProperties}/>


}

function ReferencePreviewInternal<M>({ path, reference, previewProperties, size, onHover, onClick }: {
    path: string
    reference: EntityReference,
    previewProperties?: string[];
    size: PreviewSize;
    onClick?: MouseEventHandler<any>;
    onHover?: boolean;
}) {

    const navigationContext = useNavigation();
    const schemaRegistry = useSchemaRegistry();
    const sideEntityController = useSideEntityController();

    const collection = navigationContext.getCollection<M>(path);
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }

    const {
        entity,
        dataLoading,
        dataLoadingError
    } = useEntityFetch({
        path: reference.path,
        entityId: reference.id,
        schema: collection.schemaId,
        useCache: true
    });

    const schema = useMemo(() => schemaRegistry.getResolvedSchema({
        schema: collection.schemaId,
        path: path,
        values: entity?.values
    }), [collection]);


    const listProperties = useMemo(() => {
        if (!schema) return [];
        let res = previewProperties;
        if (!res || !res.length) {
            res = Object.keys(schema.properties);
        }

        if (size === "small" || size === "regular")
            res = res.slice(0, 3);
        else if (size === "tiny")
            res = res.slice(0, 1);
        return res;
    }, [previewProperties, schema?.properties, size]);

    let body: JSX.Element;

    function buildError(error: string, tooltip?: string) {
        return <ErrorView error={error} tooltip={tooltip}/>;
    }

    if (!schema) {
        return <ErrorView
            error={"Could not find schema with id " + collection.schemaId}/>
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
                        const childProperty = schema.properties[key as string];
                        if (!childProperty) return null;

                        return (
                            <div key={"ref_prev_" + (key as string)}>
                                {entity
                                    ? <PreviewComponent propertyKey={key as string}
                                                        value={entity.values[key as string]}
                                                        property={childProperty as ResolvedProperty}
                                                        size={"tiny"}/>
                                    : <SkeletonComponent
                                        property={childProperty as ResolvedProperty}
                                        size={"tiny"}/>
                                }
                            </div>
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
                                        schema: schema,
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
    onClick?: MouseEventHandler<any>;
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
                  onClick={onClick}>

        {children}

    </Paper>
}
