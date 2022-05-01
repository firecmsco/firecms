import React, { useMemo } from "react";

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
    Entity,
    EntityCollection,
    EntityReference,
    FieldProps,
    ResolvedProperty
} from "../../models";
import { FieldDescription } from "../index";
import { ErrorView, ReferenceDialog } from "../../core";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { PropertyPreview, SkeletonComponent } from "../../preview";
import { LabelWithIcon } from "../components";
import {
    useClearRestoreValue,
    useEntityFetch,
    useNavigationContext,
    useSideEntityController
} from "../../hooks";
import { getReferenceFrom } from "../../core/util/entities";


/**
 * Field that opens a reference selection dialog.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ReferenceFieldBinding<M extends { [Key: string]: any }>({
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

    const [open, setOpen] = React.useState(autoFocus);
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
        collection: collection,
        useCache: true
    });

    const handleEntityClick = (entity: Entity<M>) => {
        if (disabled)
            return;
        setValue(entity ? getReferenceFrom(entity) : null);
        setOpen(false);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const clearValue = (e: React.MouseEvent) => {
        e.stopPropagation();
        setValue(null);
        setOpen(false);
    };

    const seeEntityDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (entity)
            sideEntityController.open({
                entityId: entity.id,
                path,
                updateUrl: true
            });
    };

    const onClose = () => {
        setOpen(false);
    };

    function buildEntityView(collection?: EntityCollection<any>) {

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

                const allProperties = Object.keys(collection.properties);
                let listProperties = property.previewProperties?.filter(p => allProperties.includes(p as string));
                if (!listProperties || !listProperties.length) {
                    listProperties = allProperties;
                }
                listProperties = listProperties.slice(0, 3);

                body = (
                    <Box display={"flex"}
                         flexDirection={"column"}
                         flexGrow={1}
                         ml={1}
                         mr={1}>

                        {listProperties && listProperties.map((key, index) => {
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
                                                value={(entity.values as any)[key]}
                                                property={property as ResolvedProperty}
                                                entity={entity}
                                                size={"tiny"}/>
                                            : <SkeletonComponent
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
                    <Typography variant={"body2"} sx={(theme) => ({
                        flexGrow: 1,
                        textAlign: "center",
                        color: "#838383",
                        fontWeight: theme.typography.fontWeightMedium
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
    }

    return (
        <FormControl error={showError} fullWidth>

            <Box sx={(theme) => ({

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
                color: disabled ? (theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.38)" : "rgba(255, 255, 255, 0.38)") : "#838383",
                fontWeight: theme.typography.fontWeightMedium

            })}>

                {collection && buildEntityView(collection)}

                {collection && <ReferenceDialog open={open}
                                                collection={collection}
                                                multiselect={false}
                                                path={path}
                                                onClose={onClose}
                                                onSingleEntitySelected={handleEntityClick}
                />}

            </Box>

            {includeDescription &&
                <FieldDescription property={property}/>}

            {showError && <FormHelperText>{error}</FormHelperText>}

        </FormControl>
    );
}
