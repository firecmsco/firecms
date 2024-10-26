import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

import * as Portal from "@radix-ui/react-portal";

import {
    Entity,
    EntityCollection,
    EntityValues,
    FireCMSPlugin,
    FormContext,
    PropertyFieldBindingProps,
    ResolvedEntityCollection,
    ResolvedProperties,
    ResolvedProperty
} from "../../../../types";
import { Formex, useCreateFormex } from "@firecms/formex";
import { useDraggable } from "./useDraggable";
import { CustomFieldValidator, getYupEntitySchema } from "../../../../form/validation";
import { useWindowSize } from "./useWindowSize";
import { ElementResizeListener } from "./ElementResizeListener";
import { getPropertyInPath, isReadOnly, resolveCollection } from "../../../../util";
import { Button, ClearIcon, DialogActions, IconButton, Typography } from "@firecms/ui";
import { PropertyFieldBinding } from "../../../../form";
import { useCustomizationController, useDataSource, useFireCMSContext } from "../../../../hooks";
import { OnCellValueChangeParams } from "../../../common";

interface PopupFormFieldProps<M extends Record<string, any>> {
    customFieldValidator?: CustomFieldValidator;
    path: string;
    entityId: string;
    tableKey: string;
    propertyKey?: Extract<keyof M, string>;
    collection?: EntityCollection<any>;
    cellRect?: DOMRect;
    open: boolean;
    onClose: () => void;
    container: HTMLElement | null;
    /**
     * Callback when the value of a cell has been edited
     * @param params
     */
    onCellValueChange?: (params: OnCellValueChangeParams<any, any>) => Promise<void> | void;
}

export function PopupFormField<M extends Record<string, any>>(props: PopupFormFieldProps<M>) {
    if (!props.open) return null;
    return <PopupFormFieldLoading {...props} />;

}

export function PopupFormFieldLoading<M extends Record<string, any>>({
                                                                         tableKey,
                                                                         entityId,
                                                                         customFieldValidator,
                                                                         propertyKey,
                                                                         collection: inputCollection,
                                                                         path,
                                                                         cellRect,
                                                                         open,
                                                                         onClose,
                                                                         onCellValueChange,
                                                                         container
                                                                     }: PopupFormFieldProps<M>) {
    const dataSource = useDataSource();
    const [entity, setEntity] = useState<Entity<M> | undefined>(undefined);
    useEffect(() => {
        if (entityId && inputCollection) {
            dataSource.fetchEntity({
                path,
                entityId,
                collection: inputCollection
            }).then(setEntity);
        }
    }, [entityId, inputCollection]);

    if (!entity) return null;
    return <PopupFormFieldInternal {...{
        tableKey,
        entityId,
        customFieldValidator,
        propertyKey,
        collection: inputCollection,
        path,
        cellRect,
        open,
        onClose,
        onCellValueChange,
        container
    }} entity={entity}/>;
}

export function PopupFormFieldInternal<M extends Record<string, any>>({
                                                                          tableKey,
                                                                          entityId,
                                                                          customFieldValidator,
                                                                          propertyKey,
                                                                          collection: inputCollection,
                                                                          path,
                                                                          cellRect,
                                                                          open,
                                                                          onClose,
                                                                          onCellValueChange,
                                                                          container,
                                                                          entity
                                                                      }: PopupFormFieldProps<M> & {
    entity?: Entity<M>
}) {

    console.log("values", entity?.values);

    const fireCMSContext = useFireCMSContext();
    const customizationController = useCustomizationController();

    const [savingError, setSavingError] = React.useState<any>();
    const [popupLocation, setPopupLocation] = useState<{
        x: number,
        y: number
    }>();

    const collection: ResolvedEntityCollection<M> | undefined = inputCollection
        ? resolveCollection<M>({
            collection: inputCollection,
            path,
            values: entity?.values,
            entityId,
            propertyConfigs: customizationController.propertyConfigs
        })
        : undefined;

    const windowSize = useWindowSize();

    const draggableRef = React.useRef<HTMLDivElement>(null);
    const innerRef = React.useRef<HTMLDivElement>(null);

    const initialPositionSet = React.useRef<boolean>(false);

    const getInitialLocation = useCallback(() => {
        if (!cellRect) throw Error("getInitialLocation error");

        return {
            x: cellRect.left < windowSize.width - cellRect.right
                ? cellRect.x + cellRect.width / 2
                : cellRect.x - cellRect.width / 2,
            y: cellRect.top < windowSize.height - cellRect.bottom
                ? cellRect.y + cellRect.height / 2
                : cellRect.y - cellRect.height / 2
        };
    }, [cellRect, windowSize.height, windowSize.width]);

    const normalizePosition = useCallback(({
                                               x,
                                               y
                                           }: { x: number, y: number }) => {

        const draggableBoundingRect = draggableRef.current?.getBoundingClientRect();
        if (!draggableBoundingRect)
            throw Error("normalizePosition called before draggableBoundingRect is set");

        return {
            x: Math.max(0, Math.min(x, windowSize.width - draggableBoundingRect.width)),
            y: Math.max(0, Math.min(y, windowSize.height - draggableBoundingRect.height))
        };
    }, [windowSize]);

    const updatePopupLocation = useCallback((position?: {
        x: number,
        y: number
    }) => {

        const draggableBoundingRect = draggableRef.current?.getBoundingClientRect();
        if (!cellRect || !draggableBoundingRect) return;
        // const newPosition = normalizePosition(position ?? getInitialLocation());
        const newPosition = position ?? normalizePosition(getInitialLocation());
        if (!popupLocation || newPosition.x !== popupLocation.x || newPosition.y !== popupLocation.y)
            setPopupLocation(newPosition);
    }, [cellRect, getInitialLocation, normalizePosition, popupLocation]);

    useDraggable({
        containerRef: draggableRef,
        innerRef,
        x: popupLocation?.x,
        y: popupLocation?.y,
        onMove: updatePopupLocation
    });

    useEffect(
        () => {
            initialPositionSet.current = false;
        },
        [propertyKey, entity]
    );

    useLayoutEffect(
        () => {
            const draggableBoundingRect = draggableRef.current?.getBoundingClientRect();
            if (!cellRect || !draggableBoundingRect || initialPositionSet.current) return;
            updatePopupLocation();
            initialPositionSet.current = true;
        },
        [cellRect, updatePopupLocation, initialPositionSet.current]
    );

    useLayoutEffect(
        () => {
            updatePopupLocation(popupLocation);
        },
        [windowSize, cellRect]
    );

    const validationSchema = useMemo(() => {
        if (!collection || !entityId) return;
        return getYupEntitySchema(
            entityId,
            propertyKey && collection.properties[propertyKey as string]
                ? { [propertyKey]: collection.properties[propertyKey as string] } as ResolvedProperties<any>
                : {} as ResolvedProperties<any>,
            customFieldValidator);
    }, [collection, entityId, propertyKey, customFieldValidator]);

    const adaptResize = useCallback(() => {
        return updatePopupLocation(popupLocation);
    }, [popupLocation, updatePopupLocation]);

    const saveValue = async (values: M) => {
        setSavingError(null);
        if (inputCollection && entity && onCellValueChange && propertyKey) {
            return onCellValueChange({
                value: values[propertyKey as string],
                propertyKey: propertyKey as string,
                data: entity,
                setError: setSavingError,
                onValueUpdated: () => {
                },
            });
        }
        return Promise.resolve();
    };

    const formex = useCreateFormex<M>({
        initialValues: (entity?.values ?? {}) as EntityValues<M>,
        validation: (values) => {
            return validationSchema?.validate(values, { abortEarly: false })
                .then(() => ({}))
                .catch((e) => {
                    const errors: Record<string, string> = {};
                    e.inner.forEach((error: any) => {
                        errors[error.path] = error.message;
                    });
                    return errors;
                });
        },
        validateOnInitialRender: true,
        onSubmit: (values, actions) => {
            saveValue(values)
                .then(() => {
                    formex.resetForm({
                        values: values
                    })
                    onClose();
                })
                .finally(() => actions.setSubmitting(false));
        }
    });

    const {
        values,
        isSubmitting,
        setFieldValue,
        handleSubmit
    } = formex;

    const disabled = isSubmitting;

    const formContext: FormContext<M> = {
        collection,
        entityId,
        values,
        path,
        setFieldValue,
        save: saveValue,
        formex
    };

    const property: ResolvedProperty<any> | undefined = propertyKey && getPropertyInPath(collection?.properties ?? {} as ResolvedProperties, propertyKey as string);
    const fieldProps: PropertyFieldBindingProps<any, M> | undefined = propertyKey && property
        ? {
            propertyKey: propertyKey as string,
            disabled: isSubmitting || isReadOnly(property) || !!property.disabled,
            property,
            includeDescription: false,
            underlyingValueHasChanged: false,
            context: formContext,
            partOfArray: false,
            minimalistView: false,
            autoFocus: open
        }
        : undefined;

    let internalForm = <>
        <div
            key={`popup_form_${tableKey}_${entityId}_${propertyKey}`}
            className="w-[700px] max-w-full max-h-[85vh]">
            <form
                onSubmit={handleSubmit}
                noValidate>

                <div
                    className="mb-1 p-4 flex flex-col relative">
                    <div
                        ref={innerRef}
                        className="cursor-auto"
                        style={{ cursor: "auto !important" }}>
                        {fieldProps &&
                            <PropertyFieldBinding {...fieldProps}/>}
                    </div>
                </div>

                <DialogActions>
                    <Button
                        variant="filled"
                        color="primary"
                        type="submit"
                        disabled={disabled}
                    >
                        Save
                    </Button>
                </DialogActions>

            </form>

        </div>

    </>;

    const plugins = customizationController.plugins;
    if (plugins) {
        plugins.forEach((plugin: FireCMSPlugin) => {
            if (plugin.form?.provider) {
                internalForm = (
                    <plugin.form.provider.Component
                        status={"existing"}
                        path={path}
                        collection={collection}
                        entity={entity}
                        context={fireCMSContext}
                        currentEntityId={entityId}
                        formContext={formContext}
                        {...plugin.form.provider.props}>
                        {internalForm}
                    </plugin.form.provider.Component>
                );
            }
        });
    }
    const form = <div
        className={`text-gray-900 dark:text-white overflow-auto rounded rounded-md bg-white dark:bg-gray-950 ${!open ? "hidden" : ""} cursor-grab max-w-[100vw]`}>

        {internalForm}

        {savingError &&
            <Typography color={"error"}>
                {savingError.message}
            </Typography>
        }
    </div>;

    const draggable = (
        <div
            key={`draggable_${propertyKey as string}_${entityId}_${open}`}
            style={{
                boxShadow: "0 0 0 2px rgba(128,128,128,0.2)",
            }}
            className={`inline-block fixed z-20 shadow-outline rounded-md bg-white dark:bg-gray-950 ${
                !open ? "invisible" : "visible"
            } cursor-grab overflow-visible`}
            ref={draggableRef}>

            <ElementResizeListener onResize={adaptResize}/>

            <div
                className="overflow-hidden">

                {form}

                <div
                    className="absolute -top-3.5 -right-3.5 bg-gray-500 rounded-full"
                    style={{
                        width: "32px",
                        height: "32px"
                    }}>
                    <IconButton
                        size={"small"}
                        onClick={(event) => {
                            event.stopPropagation();
                            onClose();
                        }}>
                        <ClearIcon className="text-white"
                                   size={"small"}/>
                    </IconButton>
                </div>
            </div>

        </div>
    );

    return (
        <Portal.Root asChild
                     container={container}>
            <Formex value={formex}>
                {draggable}
            </Formex>
        </Portal.Root>
    );

}
