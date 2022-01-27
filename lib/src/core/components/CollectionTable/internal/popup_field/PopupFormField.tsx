import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState
} from "react";

import { Button, IconButton, Portal, Theme, Typography } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import ClearIcon from "@mui/icons-material/Clear";

import isEqual from "react-fast-compare";

import {
    Entity,
    EntitySchemaResolver,
    EntityValues,
    FormContext,
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
import { computeSchema, isReadOnly } from "../../../../utils";
import { buildPropertyField } from "../../../../../form";
import clsx from "clsx";
import { ElementResizeListener } from "./ElementResizeListener";
import { OnCellValueChangeParams } from "../../column_builder";
import { ErrorView } from "../../../ErrorView";

export const useStyles = makeStyles((theme: Theme) => createStyles({
    form: {
        display: "flex",
        flexDirection: "column"
    },
    button: {
        marginTop: theme.spacing(1),
        alignSelf: "flex-end",
        position: "sticky",
        bottom: 0
    },
    popup: {
        display: "inline-block",
        userSelect: "none",
        position: "fixed",
        zIndex: 1300,
        boxShadow: "0 0 0 2px rgba(128,128,128,0.2)",
        borderRadius: "4px",
        backgroundColor: theme.palette.background.paper
        // transition: "transform 250ms ease-out",
        // transform: "scale(1.0)"
    },
    popupInner: {
        padding: theme.spacing(2),
        overflow: "auto",
        cursor: "inherit"
    },
    hidden: {
        visibility: "hidden",
        // transform: "scale(0.7)",
        zIndex: -1
    }
}));


interface PopupFormFieldProps<M extends { [Key: string]: any }> {
    entity?: Entity<M>;
    customFieldValidator?: CustomFieldValidator;
    path: string;
    tableKey: string;
    name?: keyof M;
    schemaResolver?: EntitySchemaResolver<M>;
    cellRect?: DOMRect;
    open: boolean;
    onClose: () => void;
    columnIndex?: number;
    setPreventOutsideClick: (value: any) => void;

    /**
     * Callback when the value of a cell has been edited
     * @param params
     */
    onCellValueChange?: (params: OnCellValueChangeParams<any, M>) => Promise<void>;
}

export function PopupFormField<M extends { [Key: string]: any }>({
                                                                     tableKey,
                                                                     entity,
                                                                     customFieldValidator,
                                                                     name,
                                                                     schemaResolver,
                                                                     path,
                                                                     cellRect,
                                                                     setPreventOutsideClick,
                                                                     open,
                                                                     onClose,
                                                                     columnIndex,
                                                                     onCellValueChange
                                                                 }: PopupFormFieldProps<M>) {

    const [savingError, setSavingError] = React.useState<any>();
    const [popupLocation, setPopupLocation] = useState<{ x: number, y: number }>();
    const [internalValue, setInternalValue] = useState<EntityValues<M> | undefined>(entity?.values);

    const classes = useStyles();
    const windowSize = useWindowSize();

    const ref = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const initialPositionSet = React.useRef<boolean>(false);

    const draggableBoundingRect = ref.current?.getBoundingClientRect();

    useDraggable({
        containerRef,
        ref,
        x: popupLocation?.x,
        y: popupLocation?.y,
        onMove: (x, y) => onMove({ x, y })
    });

    useEffect(
        () => {
            initialPositionSet.current = false;
        },
        [name, entity]
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
        if (!draggableBoundingRect)
            throw Error("normalizePosition called before draggableBoundingRect is set");

        return {
            x: Math.max(0, Math.min(x, windowSize.width - draggableBoundingRect.width)),
            y: Math.max(0, Math.min(y, windowSize.height - draggableBoundingRect.height))
        };
    }, [draggableBoundingRect, windowSize]);

    const updatePopupLocation = useCallback((position?: { x: number, y: number }) => {
        if (!cellRect || !draggableBoundingRect) return;
        const newPosition = normalizePosition(position ?? getInitialLocation());
        if (!popupLocation || newPosition.x !== popupLocation.x || newPosition.y !== popupLocation.y)
            setPopupLocation(newPosition);
    }, [cellRect, draggableBoundingRect, getInitialLocation, normalizePosition, popupLocation]);

    useEffect(
        () => {
            if (!cellRect || !draggableBoundingRect || initialPositionSet.current) return;
            initialPositionSet.current = true;
            updatePopupLocation(getInitialLocation());
        },
        [cellRect, draggableBoundingRect, getInitialLocation, updatePopupLocation]
    );

    useLayoutEffect(
        () => {
            updatePopupLocation(popupLocation);
        },
        [windowSize, cellRect]
    );

    useEffect(
        () => {
            setPreventOutsideClick(open);
        },
        [open]
    );

    const validationSchema = useMemo(() => {
        if (!schemaResolver) return;
        const schema = computeSchema({
            schemaResolver: schemaResolver,
            values: internalValue,
            previousValues: entity?.values,
        });
        return getYupEntitySchema(
            name
                ? { [name]: schema.properties[name] } as ResolvedProperties<any>
                : {} as ResolvedProperties<any>,
            customFieldValidator);
    }, [path, internalValue, name]);

    const adaptResize = () => {
        if (!draggableBoundingRect) return;
        return updatePopupLocation(popupLocation);
    };

    const onMove = (position: { x: number, y: number }) => {
        if (!draggableBoundingRect) return;
        return updatePopupLocation(position);
    };

    const saveValue = async (values: M) => {
        setSavingError(null);
        if (entity && onCellValueChange && name) {
            return onCellValueChange({
                value: values[name as string],
                name: name as string,
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
        <div
            key={`popup_form_${tableKey}_${entity.id}_${columnIndex}`}
            style={{
                width: 520,
                maxWidth: "100vw",
                maxHeight: "85vh"
            }}>
            <Formik
                initialValues={entity.values}
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

                    if (!isEqual(values, internalValue)) {
                        setInternalValue(values);
                    }

                    if (!entity)
                        return <ErrorView
                            error={"PopupFormField misconfiguration"}/>;

                    if (!schemaResolver)
                        return <></>;

                    const disabled = isSubmitting;

                    const schema = computeSchema({
                        schemaResolver: schemaResolver,
                        values,
                        previousValues: entity?.values,
                    });

                    const context: FormContext<M> = {
                        schema,
                        entityId: entity.id,
                        values
                    };

                    const property: ResolvedProperty<any> | undefined = schema.properties[name];

                    return <Form
                        className={classes.form}
                        onSubmit={handleSubmit}
                        noValidate>

                        {name && property && buildPropertyField<any, M>({
                            name: name as string,
                            disabled: isSubmitting || isReadOnly(property) || !!property.disabled,
                            property,
                            includeDescription: false,
                            underlyingValueHasChanged: false,
                            context,
                            tableMode: true,
                            partOfArray: false,
                            autoFocus: open,
                            shouldAlwaysRerender: true
                        })}

                        <Button
                            className={classes.button}
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={disabled}
                        >
                            Save
                        </Button>

                    </Form>;
                }}
            </Formik>

            {savingError &&
            <Typography color={"error"}>
                {savingError.message}
            </Typography>
            }

        </div>
    );

    const draggable = (
        <div
            key={`draggable_${name}_${entity.id}`}
            className={clsx(classes.popup,
                { [classes.hidden]: !open }
            )}
            ref={containerRef}>

            <ElementResizeListener onResize={adaptResize}/>

            <div className={classes.popupInner}
                 ref={ref}>

                {form}

                <IconButton
                    size={"small"}
                    style={{
                        position: "absolute",
                        top: -14,
                        right: -14,
                        backgroundColor: "#666"
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        onClose();
                    }}>
                    <ClearIcon style={{ color: "white" }}
                               fontSize={"small"}/>
                </IconButton>
            </div>

        </div>
    );

    return (
        <Portal container={document.body}>
            {draggable}
        </Portal>
    );

}


