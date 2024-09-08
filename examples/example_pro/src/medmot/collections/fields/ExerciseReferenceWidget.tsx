import React, { useCallback, useMemo } from "react";
import ExerciseTitle from "./ExerciseTitlePreview";

import {
    Button,
    ClearIcon,
    cls,
    ErrorIcon,
    fieldBackgroundHoverMixin,
    fieldBackgroundMixin,
    IconButton,
    KeyboardTabIcon,
    LinkIcon,
    Tooltip,
    Typography
} from "@firecms/ui";

import {
    Entity,
    EntityCollection,
    EntityReference,
    ErrorBoundary,
    ErrorView,
    FieldCaption,
    FilterValues,
    getReferenceFrom,
    LabelWithIcon,
    PropertyPreview,
    ResolvedProperty,
    SkeletonPropertyComponent,
    useEntityFetch,
    useFireCMSContext,
    useNavigationController,
    useReferenceDialog,
    useSideEntityController
} from "@firecms/core";
import { Exercise } from "../exercises";


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
export function ExerciseReferenceWidget<M extends Record<string, any>>({
                                                                           name,
                                                                           path,
                                                                           disabled,
                                                                           value,
                                                                           property,
                                                                           setValue,
                                                                           previewProperties,
                                                                           forceFilter
                                                                       }: {
    name?: string,
    value?: EntityReference,
    setValue: (value: EntityReference | null) => void,
    path: string,
    property: ResolvedProperty<any>,
    disabled?: boolean,
    previewProperties?: string[];
    /**
     * Allow selection of entities that pass the given filter only.
     */
    forceFilter?: FilterValues<string>;
}) {


    const fireCMSContext = useFireCMSContext();
    const navigationContext = useNavigationController();
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
            fireCMSContext.analyticsController?.onAnalyticsEvent?.("entity_click_from_reference", {
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
                    <div
                        className={"flex items-center p-1 flex-grow"}>
                        <ErrorIcon size={"small"} color={"error"}/>
                        <div className={"ml-1"}>Missing
                            reference {entity && entity.id}</div>
                    </div>
                </Tooltip>
            );
        } else {
            if (validValue) {

                const listProperties = ['image'];

                body = (
                    <div className="flex flex-col flex-grow ml-1 mr-1">

                        {listProperties && listProperties.map((key) => {
                            const property = collection.properties[key as string];
                            if (!property) return null;
                            return (
                                <div
                                    key={`reference_previews_${key as string}`}
                                    className={"mt-[0.25rem] mb-[0.25rem]"}>

                                    <ErrorBoundary>{
                                        entity
                                            ? <PropertyPreview
                                                propertyKey={key as string}
                                                value={(entity.values)[key]}
                                                property={property as ResolvedProperty}
                                                size={"smallest"}/>
                                            : <SkeletonPropertyComponent
                                                property={property as ResolvedProperty}
                                                size={"smallest"}/>}
                                    </ErrorBoundary>
                                    <ExerciseTitle entity={{ path: value.path, id: value.id } as Entity<Exercise>}/>
                                </div>
                            );
                        })}
                    </div>
                );
            } else {
                body = <div className="flex justify-center p-1"
                            onClick={disabled ? undefined : handleClickOpen}>
                    <Typography variant={"label"} className={"flex-grow text-center"}>
                        No value set
                    </Typography>
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

                    <div className="flex flex-row flex-grow">
                        <LabelWithIcon
                            className={"m-1 text-text-secondary flex-grow"}
                            icon={<LinkIcon color={"secondary"}/>}
                            title={name}
                        />

                        {entity &&
                            <div className="self-center m-1">
                                <Tooltip title={value && value.path}>
                                    <Typography variant={"caption"}
                                                className={"mono"}>
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
                        </div>}

                    </div>

                    {body}

                </div>

            </div>
        );
    };

    return <>
        <Typography variant={"label"}
                    className={cls("w-full p-1 relative transition-bg duration-200 ease-[cubic-bezier(0.0,0,0.2,1)] rounded font-medium", fieldBackgroundHoverMixin, fieldBackgroundMixin)}
        >

            {collection && buildEntityView(collection)}

        </Typography>
        <FieldCaption>
            {property.description}
        </FieldCaption>
    </>;
}

