import React, { useCallback, useMemo } from "react";

import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";

import LinkIcon from "@mui/icons-material/Link";
import ErrorIcon from "@mui/icons-material/Error";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";

import {
    Entity,
    EntityCollection,
    EntityReference,
    FilterValues,
    ResolvedProperty
} from "../../types";
import {
    ErrorBoundary,
    ErrorView,
    getReferenceFrom,
    getReferencePreviewKeys
} from "../../core";
import { PropertyPreview, SkeletonPropertyComponent } from "../../preview";
import { LabelWithIcon } from "../components";
import {
    useEntityFetch,
    useFireCMSContext,
    useNavigationContext,
    useReferenceDialog,
    useSideEntityController
} from "../../hooks";

/**
 * This field allows selecting reference/s.
 * @param name
 * @param path
 * @param disabled
 * @param value
 * @param setValue
 * @param previewProperties
 * @param forceFilter
 * @constructor
 */
export function ReferenceWidget<M extends Record<string, any>>({
                                                                   name,
                                                                   path,
                                                                   disabled,
                                                                   value,
                                                                   setValue,
                                                                   previewProperties,
                                                                   forceFilter
                                                               }: {
    name?: string,
    value?: EntityReference,
    setValue: (value: EntityReference | null) => void,
    path: string,
    disabled?: boolean,
    previewProperties?: string[];
    /**
     * Allow selection of entities that pass the given filter only.
     */
    forceFilter?: FilterValues<string>;
}) {

    const fireCMSContext = useFireCMSContext();
    const navigationContext = useNavigationContext();
    const sideEntityController = useSideEntityController();

    const collection: EntityCollection | undefined = useMemo(() => {
        return navigationContext.getCollection(path);
    }, [path, navigationContext]);

    if (!collection) {
        throw Error(`Couldn't find the corresponding collection for the path: ${path}`);
    }

    const validValue = value && value instanceof EntityReference;

    const {
        entity,
        dataLoading,
        dataLoadingError
    } = useEntityFetch({
        path,
        entityId: validValue ? value.id : undefined,
        collection,
        useCache: true
    });

    const onSingleEntitySelected = useCallback((entity: Entity<M>) => {
        if (disabled)
            return;
        setValue(entity ? getReferenceFrom(entity) : null);
    }, [disabled, setValue]);

    const referenceDialogController = useReferenceDialog({
            multiselect: false,
            path,
            collection,
            onSingleEntitySelected,
            forceFilter
        }
    );

    const handleClickOpen = useCallback(() => {
        referenceDialogController.open();
    }, [referenceDialogController]);

    const clearValue = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setValue(null);
    }, [setValue]);

    const seeEntityDetails = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (entity) {
            fireCMSContext.onAnalyticsEvent?.("entity_click_from_reference", {
                path: entity.path,
                entityId: entity.id
            });
            sideEntityController.open({
                entityId: entity.id,
                path,
                updateUrl: true
            });
        }
    }, [entity, path, sideEntityController]);

    const buildEntityView = (collection?: EntityCollection<any>) => {

        const missingEntity = entity && !entity.values;

        let body: React.ReactNode;
        if (!collection) {
            body = (
                <ErrorView
                    error={"The specified collection does not exist. Check console"}/>
            );
        } else if (missingEntity) {
            body = (
                <Tooltip title={value && value.path}>
                    <Box
                        display={"flex"}
                        alignItems={"center"}
                        p={1}
                        flexGrow={1}>
                        <ErrorIcon fontSize={"small"} color={"error"}/>
                        <Box marginLeft={1}>Missing
                            reference {entity && entity.id}</Box>
                    </Box>
                </Tooltip>
            );
        } else {
            if (validValue) {

                const listProperties = getReferencePreviewKeys(collection, fireCMSContext.fields, previewProperties, 3);

                body = (
                    <Box display={"flex"}
                         flexDirection={"column"}
                         flexGrow={1}
                         ml={1}
                         mr={1}>

                        {listProperties && listProperties.map((key) => {
                            const property = collection.properties[key as string];
                            if (!property) return null;
                            return (
                                <Box
                                    key={`reference_previews_${key as string}`}
                                    mt={0.25}
                                    mb={0.25}>
                                    <ErrorBoundary>{
                                        entity
                                            ? <PropertyPreview
                                                propertyKey={key as string}
                                                value={(entity.values)[key]}
                                                property={property as ResolvedProperty}
                                                entity={entity}
                                                size={"tiny"}/>
                                            : <SkeletonPropertyComponent
                                                property={property as ResolvedProperty}
                                                size={"tiny"}/>}
                                    </ErrorBoundary>
                                </Box>
                            );
                        })}
                    </Box>
                );
            } else {
                body = <Box p={1}
                            onClick={disabled ? undefined : handleClickOpen}
                            justifyContent="center"
                            display="flex">
                    <Typography variant={"label"} sx={(theme) => ({
                        flexGrow: 1,
                        textAlign: "center"
                    })}>No value set</Typography>
                    {!disabled && <Button variant="outlined"
                                          color="primary">
                        Set
                    </Button>}
                </Box>;
            }
        }

        return (
            <Box
                onClick={disabled ? undefined : handleClickOpen}
                display="flex">

                <Box display={"flex"}
                     flexDirection={"column"}
                     flexGrow={1}>

                    <Box display={"flex"}
                         flexDirection={"row"}
                         flexGrow={1}>
                        <LabelWithIcon icon={<LinkIcon color={"inherit"}
                                                       fontSize={"inherit"}/>}
                                       sx={{
                                           flexGrow: 1,
                                           color: "text.secondary",
                                           ml: 1
                                       }}
                                       title={name}
                        />

                        {entity &&
                            <Box
                                alignSelf={"center"}
                                m={1}>
                                <Tooltip title={value && value.path}>
                                    <Typography variant={"caption"}
                                                className={"mono"}>
                                        {entity.id}
                                    </Typography>
                                </Tooltip>
                            </Box>}

                        {!missingEntity && entity && value && <Box>
                            <Tooltip title={`See details for ${entity.id}`}>
                                <span>
                                <IconButton
                                    onClick={seeEntityDetails}
                                    size="large">
                                    <KeyboardTabIcon/>
                                </IconButton>
                                    </span>
                            </Tooltip>
                        </Box>}

                        {value && <Box>
                            <Tooltip title="Clear">
                                <span>
                                <IconButton
                                    disabled={disabled}
                                    onClick={disabled ? undefined : clearValue}
                                    size="large">
                                    <ClearIcon/>
                                </IconButton>
                                </span>
                            </Tooltip>
                        </Box>}

                    </Box>

                    {body}

                </Box>
            </Box>
        );
    };

    return <Typography variant={"label"} sx={(theme) => ({
        elevation: 0,
        width: "100%",
        padding: theme.spacing(1),
        position: "relative",
        transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
        borderRadius: `${theme.shape.borderRadius}px`,
        backgroundColor: disabled ? "rgba(0, 0, 0, 0.12)" : (theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.09)"),
        "&:hover": {
            cursor: disabled ? undefined : "pointer",
            backgroundColor: disabled ? "rgba(0, 0, 0, 0.12)" : theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.09)" : "rgba(255, 255, 255, 0.13)"
        },
        color: disabled ? (theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.38)" : "rgba(255, 255, 255, 0.38)") : undefined,
        fontWeight: theme.typography.fontWeightMedium
    })}>

        {collection && buildEntityView(collection)}

    </Typography>;
}
