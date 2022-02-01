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
import { AnyProperty, EntityReference } from "../../models";

import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { PreviewComponent, PreviewComponentProps } from "../internal";

import { SkeletonComponent } from "./SkeletonComponent";
import { ErrorView } from "../../core";
import {
    useEntityFetch,
    useNavigation,
    useSideEntityController
} from "../../hooks";

export type ReferencePreviewProps =
    PreviewComponentProps<EntityReference>
    & { onHover?: boolean };


/**
 * @category Preview components
 */
export const ReferencePreview = React.memo<ReferencePreviewProps>(ReferencePreviewComponent, areEqual) as React.FunctionComponent<ReferencePreviewProps>;

function areEqual(prevProps: ReferencePreviewProps, nextProps: ReferencePreviewProps) {
    return prevProps.name === nextProps.name &&
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

    if (typeof property.path !== "string") {
        throw Error("Picked the wrong component ReferencePreviewComponent");
    }

    const reference: EntityReference = value;
    const previewProperties = property.previewProperties;

    const navigationContext = useNavigation();
    const sideEntityController = useSideEntityController();

    const collectionResolver = navigationContext.getCollectionResolver<M>(property.path);
    if (!collectionResolver) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${property.path}`);
    }

    const schema = collectionResolver.schema;

    const {
        entity,
        dataLoading,
        dataLoadingError
    } = useEntityFetch({
        path: reference.path,
        entityId: reference.id,
        schema: collectionResolver.schemaResolver,
        useCache: true
    });

    const listProperties = useMemo(() => {
        let res = previewProperties;
        if (!res || !res.length) {
            res = Object.keys(schema.properties);
        }

        if (size === "small" || size === "regular")
            res = res.slice(0, 3);
        else if (size === "tiny")
            res = res.slice(0, 1);
        return res;
    }, [previewProperties, schema.properties, size]);

    let body: JSX.Element;

    function buildError(error: string, tooltip?: string) {
        return <ErrorView error={error} tooltip={tooltip}/>;
    }

    if (!value) {
        body = buildError("Reference not set");
    }
    // currently not happening since this gets filtered out in PreviewComponent
    else if (!(value instanceof EntityReference)) {
        body = buildError("Unexpected value", JSON.stringify(value));
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
                        value
                            ? <Box sx={{
                                display: size !== "regular" ? "block" : undefined,
                                whiteSpace: size !== "regular" ? "nowrap" : undefined,
                                overflow: size !== "regular" ? "hidden" : undefined,
                                textOverflow: size !== "regular" ? "ellipsis" : undefined
                            }}>
                                <Typography variant={"caption"}
                                            className={"mono"}>
                                    {value.id}
                                </Typography>
                            </Box>
                            : <Skeleton variant="text"/>)}


                    {listProperties && listProperties.map((key) => {
                        const childProperty = schema.properties[key as string];
                        if (!childProperty) return null;

                        return (
                            <div key={"ref_prev_" + (key as string)}>
                                {entity
                                    ? <PreviewComponent name={key as string}
                                                        value={entity.values[key as string]}
                                                        property={childProperty as AnyProperty}
                                                        size={"tiny"}/>
                                    : <SkeletonComponent
                                        property={childProperty as AnyProperty}
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
                                        overrideSchemaRegistry: false
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
        <Paper elevation={0} sx={(theme) => {
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

            {body}

        </Paper>
    );

}
