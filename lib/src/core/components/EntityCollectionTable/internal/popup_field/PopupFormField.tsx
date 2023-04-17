import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState
} from "react";
import equal from "react-fast-compare"

import { Box, Button, IconButton, Portal, Typography } from "@mui/material";

import ClearIcon from "@mui/icons-material/Clear";

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
} from "../../../../../types";
import { Form, Formik, FormikProps } from "formik";
import { useDraggable } from "./useDraggable";
import {
    CustomFieldValidator,
    getYupEntitySchema
} from "../../../../../form/validation";
import { useWindowSize } from "./useWindowSize";
import { ElementResizeListener } from "./ElementResizeListener";
import { OnCellValueChangeParams } from "../../types";
import { ErrorView } from "../../../ErrorView";
import { isReadOnly, resolveCollection } from "../../../../util";
import { CustomDialogActions } from "../../../CustomDialogActions";
import { PropertyFieldBinding } from "../../../../../form";
import { useDataSource, useFireCMSContext } from "../../../../../hooks";

interface PopupFormFieldProps<M extends Record<string, any>> {
    entity?: Entity<M>;
    customFieldValidator?: CustomFieldValidator;
    path: string;
    tableKey: string;
    propertyKey?: keyof M;
    collection?: EntityCollection<M>;
    cellRect?: DOMRect;
    open: boolean;
    onClose: () => void;
    columnIndex?: number;

    /**
     * Callback when the value of a cell has been edited
     * @param params
     */
    onCellValueChange?: (params: OnCellValueChangeParams<any, M>) => Promise<void>;
}

export function PopupFormField<M extends Record<string, any>>(props: PopupFormFieldProps<M>) {
    if (!props.open) return null;
    return <PopupFormFieldInternal {...props} />;

}

export function PopupFormFieldInternal<M extends Record<string, any>>({
                                                                          tableKey,
                                                                          entity,
                                                                          customFieldValidator,
                                                                          propertyKey,
                                                                          collection: inputCollection,
                                                                          path,
                                                                          cellRect,
                                                                          open,
                                                                          onClose,
                                                                          columnIndex,
                                                                          onCellValueChange
                                                                      }: PopupFormFieldProps<M>) {

    const dataSource = useDataSource();
    const fireCMSContext = useFireCMSContext();

    const [savingError, setSavingError] = React.useState<any>();
    const [popupLocation, setPopupLocation] = useState<{
        x: number,
        y: number
    }>();
    const [internalValue, setInternalValue] = useState<EntityValues<M> | undefined>(entity?.values);

    const collection: ResolvedEntityCollection<M> | undefined = inputCollection
        ? resolveCollection<M>({
            collection: inputCollection,
            path,
            values: internalValue,
            entityId: entity?.id,
            fields: fireCMSContext.fields
        })
        : undefined;

    const windowSize = useWindowSize();

    const containerRef = React.useRef<HTMLDivElement>(null);
    const innerRef = React.useRef<HTMLDivElement>(null);

    const initialPositionSet = React.useRef<boolean>(false);

    useDraggable({
        containerRef,
        innerRef,
        x: popupLocation?.x,
        y: popupLocation?.y,
        onMove: (x, y) => onMove({
            x,
            y
        })
    });

    useEffect(
        () => {
            initialPositionSet.current = false;
        },
        [propertyKey, entity]
    );

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

        const draggableBoundingRect = containerRef.current?.getBoundingClientRect();
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

        const draggableBoundingRect = containerRef.current?.getBoundingClientRect();
        if (!cellRect || !draggableBoundingRect) return;
        const newPosition = normalizePosition(position ?? getInitialLocation());
        if (!popupLocation || newPosition.x !== popupLocation.x || newPosition.y !== popupLocation.y)
            setPopupLocation(newPosition);
    }, [cellRect, getInitialLocation, normalizePosition, popupLocation]);

    useEffect(
        () => {
            initialPositionSet.current = false;
        },
        [propertyKey]
    );

    useLayoutEffect(
        () => {
            const draggableBoundingRect = containerRef.current?.getBoundingClientRect();
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
        if (!collection || !entity) return;
        return getYupEntitySchema(
            entity.id,
            propertyKey && collection.properties[propertyKey as string]
                ? { [propertyKey]: collection.properties[propertyKey as string] } as ResolvedProperties<any>
                : {} as ResolvedProperties<any>,
            customFieldValidator);
    }, [path, propertyKey, collection, entity]);

    const adaptResize = useCallback(() => {
        return updatePopupLocation(popupLocation);
    }, [popupLocation, updatePopupLocation]);

    const onMove = useCallback((position: { x: number, y: number }) => {
        return updatePopupLocation(position);
    }, [updatePopupLocation]);

    const saveValue = async (values: M) => {
        setSavingError(null);
        if (inputCollection && entity && onCellValueChange && propertyKey) {
            return onCellValueChange({
                value: values[propertyKey as string],
                propertyKey: propertyKey as string,
                entity,
                setError: setSavingError,
                onValueUpdated: () => {
                },
                fullPath: path,
                collection: inputCollection,
                dataSource,
                context: fireCMSContext
            });
        }
        return Promise.resolve();
    };

    if (!entity)
        return <></>;

    const form = entity && (
        <Box sx={theme => ({
            overflow: "auto",
            borderRadius: `${theme.shape.borderRadius}px`,
            backgroundColor: theme.palette.background.paper,
            visibility: !open ? "hidden" : undefined,
            cursor: "grab"
        })}>
            <Formik
                initialValues={(entity?.values ?? {}) as EntityValues<M>}
                validationSchema={validationSchema}
                validateOnMount={true}
                validate={(values) => console.debug("Validating", values)}
                onSubmit={(values, actions) => {
                    saveValue(values)
                        .then(() => onClose())
                        .finally(() => actions.setSubmitting(false));
                }}
            >
                {({
                      handleChange,
                      values,
                      errors,
                      touched,
                      dirty,
                      setFieldValue,
                      setFieldTouched,
                      handleSubmit,
                      isSubmitting
                  }: FormikProps<EntityValues<M>>) => {

                    if (!equal(values, internalValue)) {
                        setInternalValue(values);
                    }

                    if (!entity)
                        return <ErrorView
                            error={"PopupFormField misconfiguration"}/>;

                    if (!collection)
                        return <></>;

                    const disabled = isSubmitting;

                    const formContext: FormContext<M> = {
                        collection,
                        entityId: entity.id,
                        values,
                        path,
                        setFieldValue
                    };

                    const property: ResolvedProperty<any> | undefined = propertyKey && collection.properties[propertyKey];

                    const fieldProps: PropertyFieldBindingProps<any, M> | undefined = propertyKey && property
                        ? {
                            propertyKey: propertyKey as string,
                            disabled: isSubmitting || isReadOnly(property) || !!property.disabled,
                            property,
                            includeDescription: false,
                            underlyingValueHasChanged: false,
                            context: formContext,
                            tableMode: true,
                            partOfArray: false,
                            autoFocus: open
                        }
                        : undefined;

                    let internalForm = <><Box
                        key={`popup_form_${tableKey}_${entity.id}_${columnIndex}`}
                        sx={{
                            width: 520,
                            maxWidth: "100vw",
                            maxHeight: "85vh"
                        }}>
                        <Form
                            onSubmit={handleSubmit}
                            noValidate>

                            <Box
                                sx={{
                                    mb: 1,
                                    padding: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative"
                                }}>
                                <Box
                                    ref={innerRef}
                                    sx={{
                                        cursor: "auto !important"
                                    }}>
                                    {fieldProps &&
                                        <PropertyFieldBinding {...fieldProps}/>}
                                </Box>
                            </Box>

                            <CustomDialogActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={disabled}
                                >
                                    Save
                                </Button>
                            </CustomDialogActions>

                        </Form>

                    </Box></>;

                    const plugins = fireCMSContext.plugins;
                    if (plugins) {
                        // const formController: FormContext<M> = {
                        //     values,
                        //     setFieldValue
                        // }
                        plugins.forEach((plugin: FireCMSPlugin) => {
                            if (plugin.form?.provider) {
                                internalForm = (
                                    <plugin.form.provider.Component
                                        status={"existing"}
                                        path={path}
                                        collection={collection}
                                        entity={entity}
                                        context={fireCMSContext}
                                        currentEntityId={entity.id}
                                        formContext={formContext}
                                        {...plugin.form.provider.props}>
                                        {internalForm}
                                    </plugin.form.provider.Component>
                                );
                            }
                        });
                    }
                    return internalForm;
                }}
            </Formik>

            {savingError &&
                <Typography color={"error"}>
                    {savingError.message}
                </Typography>
            }
        </Box>
    );

    const draggable = (
        <Box
            key={`draggable_${propertyKey as string}_${entity.id}_${open}`}
            sx={theme => ({
                display: "inline-block",
                // userSelect: "none",
                position: "fixed",
                zIndex: 1300,
                boxShadow: "0 0 0 2px rgba(128,128,128,0.2)",
                backgroundColor: theme.palette.background.paper,
                borderRadius: `${theme.shape.borderRadius}px`,
                visibility: !open ? "hidden" : undefined,
                cursor: "grab"
            })}
            ref={containerRef}>

            <ElementResizeListener onResize={adaptResize}/>

            <Box
                sx={{
                    overflow: "hidden"
                }}>

                {form}

                <Box sx={{
                    position: "absolute",
                    top: -14,
                    right: -14,
                    backgroundColor: "#888",
                    borderRadius: "32px"
                }}>
                    <IconButton
                        size={"small"}
                        onClick={(event) => {
                            event.stopPropagation();
                            onClose();
                        }}>
                        <ClearIcon sx={{ color: "white" }}
                                   fontSize={"small"}/>
                    </IconButton>
                </Box>
            </Box>

        </Box>
    );

    return (
        <Portal container={document.body}>
            {draggable}
        </Portal>
    );

}
