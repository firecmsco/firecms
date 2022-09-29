import React, { useCallback, useMemo } from "react";

import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";

import ErrorIcon from "@mui/icons-material/Error";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";

import {
    CMSType,
    Entity,
    EntityCollection,
    EntityReference,
    FieldProps,
    ResolvedProperty, ResolvedReferenceProperty
} from "../../models";
import { FieldDescription } from "../index";
import {
    ErrorBoundary,
    ErrorView,
    getReferenceFrom, getReferencePreviewKeys,
    isReferenceProperty
} from "../../core";
import { PropertyPreview, SkeletonPropertyComponent } from "../../preview";
import { LabelWithIcon } from "../components";
import {
    useClearRestoreValue,
    useEntityFetch,
    useNavigationContext,
    useSideEntityController,
    useReferenceDialog
} from "../../hooks";

/**
 * Field that opens a reference selection dialog.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ReferenceFieldBinding<M extends Record<string, any>>({
                                                                     propertyKey,
                                                                     value,
                                                                     setValue,
                                                                     error,
                                                                     showError,
                                                                     disabled,
                                                                     touched,
                                                                     autoFocus,
                                                                     property,
                                                                     includeDescription,
                                                                     context,
                                                                     shouldAlwaysRerender
                                                                 }: FieldProps<EntityReference>) {

    if (typeof property.path !== "string") {
        throw Error("Picked the wrong component ReferenceField");
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const sideEntityController = useSideEntityController();

    const navigationContext = useNavigationContext();
    const collection: EntityCollection<M> | undefined = useMemo(() => {
        return navigationContext.getCollection(property.path as string);
    }, [property.path, navigationContext]);

    if (!collection) {
        throw Error(`Couldn't find the corresponding collection for the path: ${property.path}`);
    }

    const path = property.path;

    const validValue = value && value instanceof EntityReference;

    const {
        entity,
        dataLoading,
        dataLoadingError
    } = useEntityFetch({
        path: validValue ? value.path : property.path,
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
            forceFilter: property.forceFilter
        }
    );

    const handleClickOpen = useCallback(() => {
        referenceDialogController.open();
    }, [referenceDialogController]);

    const clearValue = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setValue(null);
        referenceDialogController.close();
    }, [referenceDialogController, setValue]);

    const seeEntityDetails = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (entity)
            sideEntityController.open({
                entityId: entity.id,
                path,
                updateUrl: true
            });
    }, [entity, path, sideEntityController]);

    const buildEntityView = useCallback((collection?: EntityCollection<any>) => {

        const missingEntity = entity && !entity.values;

        let body: JSX.Element;
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

                const listProperties = getReferencePreviewKeys(collection, property.previewProperties, 3);

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
                                    mt={0.5}
                                    mb={0.5}>
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

                        <Box flexGrow={1}>
                            <LabelWithIcon property={property} small={true}/>
                        </Box>

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
    }, [clearValue, disabled, entity, handleClickOpen, property, seeEntityDetails, validValue, value]);

    return (
        <FormControl error={showError} fullWidth>

            <Typography variant={"label"} sx={(theme) => ({
                elevation: 0,
                width: "100%",
                padding: theme.spacing(1),
                position: "relative",
                transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
                borderTopLeftRadius: `${theme.shape.borderRadius}px`,
                borderTopRightRadius: `${theme.shape.borderRadius}px`,
                backgroundColor: disabled ? "rgba(0, 0, 0, 0.12)" : (theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.09)"),
                // borderBottom: `1px solid ${darken(theme.palette.background.default, 0.1)}`,
                "&::before": {
                    borderBottom: disabled
                        ? theme.palette.mode === "light" ? "1px dotted rgba(0, 0, 0, 0.42)" : "1px dotted rgba(255, 255, 255, 0.7)"
                        : theme.palette.mode === "light" ? "1px solid rgba(0, 0, 0, 0.42)" : "1px solid rgba(255, 255, 255, 0.7)",
                    left: 0,
                    bottom: 0,
                    content: "\"\\00a0\"",
                    position: "absolute",
                    right: 0,
                    transition: "border-bottom-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    pointerEvents: "none"
                },
                "&::after": {
                    content: "\"\"",
                    transition: "transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
                    left: 0,
                    bottom: 0,
                    position: "absolute",
                    right: 0,
                    transform: "scaleX(0)",
                    borderBottom: disabled ? `2px dotted ${theme.palette.primary.main}` : `2px solid ${theme.palette.primary.main}`
                },
                "&:hover": {
                    cursor: disabled ? undefined : "pointer",
                    backgroundColor: disabled ? "rgba(0, 0, 0, 0.12)" : theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.09)" : "rgba(255, 255, 255, 0.13)"
                },
                color: disabled ? (theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.38)" : "rgba(255, 255, 255, 0.38)") : undefined,
                fontWeight: theme.typography.fontWeightMedium
            })}>

                {collection && buildEntityView(collection)}

            </Typography>

            {includeDescription &&
                <FieldDescription property={property}/>}

            {showError && <FormHelperText>{error}</FormHelperText>}

        </FormControl>
    );
}
