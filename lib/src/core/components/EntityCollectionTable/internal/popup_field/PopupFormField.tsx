import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState
} from "react";
import equal from "react-fast-compare"

import { Box, Button, IconButton, Typography } from "@mui/material";
import { Portal } from "@mui/base";

import ClearIcon from "@mui/icons-material/Clear";

import {
    Entity,
    EntityCollection,
    EntityValues,
    FormContext,
    PropertyFieldBindingProps,
    ResolvedEntityCollection,
    ResolvedProperties,
    ResolvedProperty
} from "../../../../../models";
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

interface PopupFormFieldProps<M extends { [Key: string]: CMSType }> {
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

export function PopupFormField<M extends { [Key: string]: CMSType }>({
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

    const [savingError, setSavingError] = React.useState<any>();
    const [popupLocation, setPopupLocation] = useState<{ x: number, y: number }>();
    const [internalValue, setInternalValue] = useState<EntityValues<M> | undefined>(entity?.values);

    const collection: ResolvedEntityCollection<M> | undefined = inputCollection
        ? resolveCollection<M>({
            collection: inputCollection,
            path,
            values: internalValue,
            entityId: entity?.id
        })
        : undefined;

    const windowSize = useWindowSize();

    const containerRef = React.useRef<HTMLDivElement>(null);

    const initialPositionSet = React.useRef<boolean>(false);

    useDraggable({
        containerRef,
        x: popupLocation?.x,
        y: popupLocation?.y,
        onMove: (x, y) => onMove({ x, y })
    });

    useEffect(
        () => {
            initialPositionSet.current = false;
        },
        [propertyKey, entity]
    );

    // useEffect(
    //     () => {
    //         setInternalValue(entity?.values);
    //     },
    //     [entity?.values]
    // );

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

    const updatePopupLocation = useCallback((position?: { x: number, y: number }) => {

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
        if (entity && onCellValueChange && propertyKey) {
            return onCellValueChange({
                value: values[propertyKey as string],
                propertyKey: propertyKey as string,
                entity,
                setError: setSavingError,
                setSaved: () => {
                }
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

                    const context: FormContext<M> = {
                        collection,
                        entityId: entity.id,
                        values,
                        path
                    };

                    const property: ResolvedProperty<any> | undefined = collection.properties[propertyKey];

                    const fieldProps: PropertyFieldBindingProps | undefined = propertyKey && property
                        ? {
                            propertyKey: propertyKey as string,
                            disabled: isSubmitting || isReadOnly(property) || !!property.disabled,
                            property,
                            includeDescription: false,
                            underlyingValueHasChanged: false,
                            context,
                            tableMode: true,
                            partOfArray: false,
                            autoFocus: open,
                            shouldAlwaysRerender: true
                        }
                        : undefined;

                    return (
                        <Box
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
                                    {fieldProps &&
                                        <PropertyFieldBinding {...fieldProps}/>}
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

                        </Box>);
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
