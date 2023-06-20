import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
import { Button, Tooltip, useTheme } from "@mui/material";

import LinkIcon from "@mui/icons-material/Link";
import ErrorIcon from "@mui/icons-material/Error";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";

import { Entity, EntityCollection, EntityReference, FilterValues, ResolvedProperty } from "../../types";
import { ErrorBoundary, ErrorView, getReferenceFrom, getReferencePreviewKeys } from "../../core";
import { PropertyPreview, SkeletonPropertyComponent } from "../../preview";
import { LabelWithIcon } from "../components";
import {
    useEntityFetch,
    useFireCMSContext,
    useNavigationContext,
    useReferenceDialog,
    useSideEntityController
} from "../../hooks";
import Typography from "../../components/Typography";
import { IconButton } from "../../components";

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

    const theme = useTheme();

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
                    <div className="flex items-center p-4 flex-grow">
                        <ErrorIcon fontSize={"small"} color={"error"}/>
                        <div className="ml-4">Missing
                            reference {entity && entity.id}</div>
                    </div>
                </Tooltip>
            );
        } else {
            if (validValue) {

                const listProperties = getReferencePreviewKeys(collection, fireCMSContext.fields, previewProperties, 3);

                body = (
                    <div className="flex flex-col flex-grow ml-4 mr-4">

                        {listProperties && listProperties.map((key) => {
                            const property = collection.properties[key as string];
                            if (!property) return null;
                            return (
                                <div
                                    key={`reference_previews_${key as string}`}
                                    className="mt-1 mb-1">
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
                                </div>
                            );
                        })}
                    </div>
                );
            } else {
                body = <div className="p-4 flex justify-center"
                            onClick={disabled ? undefined : handleClickOpen}>
                    <Typography variant={"label"}
                                className="flex-grow text-center">No value
                        set</Typography>
                    {!disabled && <Button variant="outlined"
                                          color="primary">
                        Set
                    </Button>}
                </div>;
            }
        }

        return (
            <div
                onClick={disabled ? undefined : handleClickOpen}
                className="flex">

                <div className="flex flex-col flex-grow">

                    <div className="flex flex-col flex-grow">
                        <LabelWithIcon icon={<LinkIcon color={"inherit"}
                                                       fontSize={"inherit"}/>}
                                       className=" flex-grow text-text-secondary dark:text-text-secondary-dark ml-1"
                                       title={name}
                        />

                        {entity &&
                            <div className="self-center m-4">
                                <Tooltip title={value && value.path}>
                                    <Typography variant={"caption"}
                                                className={"font-mono"}>
                                        {entity.id}
                                    </Typography>
                                </Tooltip>
                            </div>}

                        {!missingEntity && entity && value && <div>
                            <Tooltip title={`See details for ${entity.id}`}>
                                <span>
                                <IconButton
                                    onClick={seeEntityDetails}
                                    size="large">
                                    <KeyboardTabIcon/>
                                </IconButton>
                                    </span>
                            </Tooltip>
                        </div>}

                        {value && <div>
                            <Tooltip title=" Clear">
                                <span>
                                <IconButton
                                    disabled={disabled}
                                    onClick={disabled ? undefined : clearValue}
                                    size="large">
                                    <ClearIcon/>
                                </IconButton>
                                </span>
                            </Tooltip>
                        </div>}

                    </div>

                    {body}

                </div>
            </div>
        );
    };

    return <Typography variant={"label"}
                       className={clsx("relative w-full transition-colors duration-200 ease-in border rounded font-medium",
                     disabled ? "bg-opacity-50" : "hover:bg-opacity-75",
                     "text-opacity-50 dark:text-white dark:text-opacity-50")}
    >

        {collection && buildEntityView(collection)}

    </Typography>;
}
