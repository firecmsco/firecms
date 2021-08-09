import React, { useEffect, useLayoutEffect, useState } from "react";

import {
    Box,
    Button,
    createStyles,
    IconButton,
    makeStyles,
    Portal,
    Typography
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";

import {
    Entity,
    EntitySchema,
    EntityValues,
    FormContext,
    Property
} from "../../../models";
import { Form, Formik, FormikProps } from "formik";
import { useDraggable } from "./useDraggable";
import {
    CustomFieldValidator,
    getYupEntitySchema
} from "../../../form/validation";
import OutsideAlerter from "../../../core/internal/OutsideAlerter";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { isReadOnly } from "../../../models/utils";
import { OnCellValueChangeParams } from "../../components/CollectionTableProps";
import { buildPropertyField } from "../../../form/form_factory";
import clsx from "clsx";
import ElementResizeListener from "./ElementResizeListener";

export const useStyles = makeStyles(theme => createStyles({
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
        boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
        borderRadius: "4px",
        backgroundColor: theme.palette.background.paper,
        transition: "transform 250ms ease-out",
        transform: "scale(1.0)"
    },
    popupInner: {
        padding: theme.spacing(2),
        overflow: "auto",
        cursor: "inherit"
    },
    hidden: {
        visibility: "hidden",
        transform: "scale(0.7)",
        zIndex: -1
    }
}));


interface PopupFormFieldProps<S extends EntitySchema<Key>, Key extends string> {
    entity?: Entity<S, Key>;
    customFieldValidator?: CustomFieldValidator;
    schema: S;
    collectionPath: string;
    tableKey: string;
    name?: string;
    property?: Property;
    cellRect?: DOMRect;
    formPopupOpen: boolean;
    setFormPopupOpen: (value: boolean) => void;
    columnIndex?: number;
    setPreventOutsideClick: (value: any) => void;
    usedPropertyBuilder: boolean;

    /**
     * Callback when the value of a cell has been edited
     * @param params
     */
    onCellValueChange?: (params: OnCellValueChangeParams<any, S, Key>) => Promise<void>;
}

function PopupFormField<S extends EntitySchema<Key>, Key extends string>({
                                                                             tableKey,
                                                                             entity,
                                                                             customFieldValidator,
                                                                             name,
                                                                             property,
                                                                             schema,
                                                                             collectionPath,
                                                                             cellRect,
                                                                             setPreventOutsideClick,
                                                                             formPopupOpen,
                                                                             setFormPopupOpen,
                                                                             columnIndex,
                                                                             usedPropertyBuilder,
                                                                             onCellValueChange
                                                                         }: PopupFormFieldProps<S, Key>) {
    const [savingError, setSavingError] = React.useState<any>();
    const [popupLocation, setPopupLocation] = useState<{ x: number, y: number }>();
    // const [draggableBoundingRect, setDraggableBoundingRect] = useState<DOMRect>();

    const classes = useStyles();
    const windowSize = useWindowSize();

    const ref = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

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
            if (!cellRect) return;
            updatePopupLocation(getInitialLocation());
        },
        [property]
    );

    useLayoutEffect(
        () => {
            updatePopupLocation(popupLocation);
        },
        [windowSize, cellRect]
    );

    useEffect(
        () => {
            setPreventOutsideClick(formPopupOpen);
        },
        [formPopupOpen]
    );

    const onOutsideClick = () => {
        // selectedCell.closePopup();
    };

    const validationSchema = getYupEntitySchema(
        schema.properties,
        entity?.values ?? {},
        collectionPath,
        customFieldValidator,
        entity?.id);

    function getInitialLocation() {
        if (!cellRect) throw Error("getInitialLocation error");

        return {
            x: cellRect.left < windowSize.width - cellRect.right
                ? cellRect.x + cellRect.width / 2
                : cellRect.x - cellRect.width / 2,
            y: cellRect.top < windowSize.height - cellRect.bottom
                ? cellRect.y + cellRect.height / 2
                : cellRect.y - cellRect.height / 2
        };
    }

    const updatePopupLocation = (position?: { x: number, y: number }) => {
        if (!cellRect || !draggableBoundingRect) return;

        const newPosition = normalizePosition(position ?? getInitialLocation());
        if (!popupLocation || newPosition.x !== popupLocation.x || newPosition.y !== popupLocation.y)
            setPopupLocation(newPosition);
    };

    function normalizePosition({
                                   x,
                                   y
                               }: { x: number, y: number }) {
        if (!ref.current?.getBoundingClientRect())
            throw Error("normalizePosition called before draggableBoundingRect is set");

        return {
            x: Math.max(0, Math.min(x, windowSize.width - ref.current?.getBoundingClientRect().width)),
            y: Math.max(0, Math.min(y, windowSize.height - ref.current?.getBoundingClientRect().height))
        };
    }

    const adaptResize = () => {
        if (!draggableBoundingRect) return;
        return updatePopupLocation(popupLocation);
    };

    const onMove = (position: { x: number, y: number }) => {
        if (!draggableBoundingRect) return;
        return updatePopupLocation(position);
    };

    const saveValue = async (values: object) => {
        setSavingError(null);
        if (entity && onCellValueChange && name) {
            return onCellValueChange({
                value: values[name],
                name: name,
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

    const renderForm = ({
                            handleChange,
                            values,
                            errors,
                            touched,
                            dirty,
                            setFieldValue,
                            setFieldTouched,
                            handleSubmit,
                            isSubmitting
                        }: FormikProps<EntityValues<S, Key>>) => {

        const disabled = isSubmitting;

        const context: FormContext<S, Key> = {
            entitySchema: schema,
            entityId: entity.id,
            values
        };

        return <OutsideAlerter
            enabled={true}
            onOutsideClick={onOutsideClick}>

            <Form
                className={classes.form}
                onSubmit={handleSubmit}
                noValidate>

                {name && property && buildPropertyField({
                    name: name as string,
                    disabled: isSubmitting || isReadOnly(property) || !!property.disabled,
                    property,
                    includeDescription: false,
                    underlyingValueHasChanged: false,
                    context,
                    tableMode: true,
                    partOfArray: false,
                    autoFocus: formPopupOpen,
                    dependsOnOtherProperties: usedPropertyBuilder
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

            </Form>
        </OutsideAlerter>;
    };

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
                        .then(() => setFormPopupOpen(false))
                        .finally(() => actions.setSubmitting(false));
                }}
            >
                {renderForm}
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
                { [classes.hidden]: !formPopupOpen }
            )}
            ref={containerRef}>

            <ElementResizeListener onResize={adaptResize}/>

            <div className={classes.popupInner}
                 ref={ref}>

                {form}

                <Box position={"absolute"}
                     top={-14}
                     right={-14}>
                    <IconButton
                        size={"small"}
                        style={{ backgroundColor: "#666" }}
                        onClick={(event) => {
                            event.stopPropagation();
                            setFormPopupOpen(false);
                        }}>
                        <ClearIcon style={{ color: "white" }}
                                   fontSize={"small"}/>
                    </IconButton>
                </Box>
            </div>

        </div>
    );

    return (
        <Portal container={document.body}>
            {draggable}
        </Portal>
    );

}

export default PopupFormField;
