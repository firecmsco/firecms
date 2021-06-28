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
import { Form, Formik, FormikProps, getIn, useFormikContext } from "formik";
import { Draggable } from "./Draggable";
import {
    CustomFieldValidator,
    getYupEntitySchema
} from "../../../form/validation";
import OutsideAlerter from "../../../core/internal/OutsideAlerter";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { isReadOnly } from "../../../models/utils";
import { OnCellChangeParams } from "../../components/CollectionTableProps";
import { buildPropertyField } from "../../../form/form_factory";

export const useStyles = makeStyles(theme => createStyles({
    form: {
        display: "flex",
        flexDirection: "column"
    },
    button: {
        marginTop: theme.spacing(1),
        alignSelf: "flex-end"
    }
}));


interface PopupFormFieldProps<S extends EntitySchema<Key>, Key extends string> {
    entity?: Entity<S, Key>;
    customFieldValidator?: CustomFieldValidator;
    schema: S;
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
    onCellValueChange?: (params: OnCellChangeParams<any, S, Key>) => Promise<void>;
}

function PopupFormField<S extends EntitySchema<Key>, Key extends string>({
                                                                             tableKey,
                                                                             entity,
                                                                             customFieldValidator,
                                                                             name,
                                                                             property,
                                                                             schema,
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
    const [draggableBoundingRect, setDraggableBoundingRect] = useState<DOMRect>();

    const classes = useStyles();
    const windowSize = useWindowSize();

    useEffect(
        () => {
            if (cellRect && draggableBoundingRect)
                calculateInitialPopupLocation(cellRect, draggableBoundingRect);
        },
        [cellRect, draggableBoundingRect]
    );

    useEffect(
        () => {
            setPreventOutsideClick(formPopupOpen);
        },
        [formPopupOpen]
    );

    useLayoutEffect(
        () => {
            if (popupLocation)
                setPopupLocation(normalizePosition(popupLocation));
        },
        [windowSize]
    );

    const calculateInitialPopupLocation = (cellRect: DOMRect, popupRect: DOMRect) => {
        const initialLocation = {
            x: cellRect.left < windowSize.width - cellRect.right
                ? cellRect.x + cellRect.width / 2
                : cellRect.x - cellRect.width / 2,
            y: cellRect.top < windowSize.height - cellRect.bottom
                ? cellRect.y + cellRect.height / 2
                : cellRect.y - cellRect.height / 2
        };

        setPopupLocation(normalizePosition(initialLocation));
    };

    const onOutsideClick = () => {
        // selectedCell.closePopup();
    };


    const validationSchema = getYupEntitySchema(
        schema.properties,
        entity?.values ?? {},
        customFieldValidator,
        entity?.id);

    function normalizePosition({ x, y }: { x: number, y: number }) {

        if (!draggableBoundingRect)
            return;

        return {
            x: Math.max(0, Math.min(x, windowSize.width - draggableBoundingRect.width)),
            y: Math.max(0, Math.min(y, windowSize.height - draggableBoundingRect.height))
        };
    }

    const onMove = (position: { x: number, y: number }) => {
        return setPopupLocation(normalizePosition(position));
    };

    const saveValue =
        async (values: object) => {
            setSavingError(null);
            if (entity && onCellValueChange && name) {
                return onCellValueChange({
                    value: values[name],
                    name: name,
                    entity,
                    setError: setSavingError
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
                width: 470,
                maxWidth: "100vw",
                maxHeight: "85vh",
                overflow: "auto"
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

    return (
        <Portal container={document.body}>
            <Draggable
                key={`draggable_${name}_${entity.id}`}
                x={popupLocation?.x}
                y={popupLocation?.y}
                open={formPopupOpen}
                onMove={(x, y) => onMove({ x, y })}
                onMeasure={(rect) => setDraggableBoundingRect(rect)}
            >

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

            </Draggable>
        </Portal>
    );

}

const AutoSubmitToken = ({
                             name,
                             onSubmit
                         }: { name: string, onSubmit: (values: any) => void }) => {
    const { values, errors } = useFormikContext();

    React.useEffect(() => {
        const fieldError = getIn(errors, name);
        const shouldSave = !fieldError || (Array.isArray(fieldError) && !fieldError.filter((e: any) => !!e).length);
        if (shouldSave) {
            onSubmit(values);
        }
    }, [values, errors]);
    return null;
};

export default PopupFormField;
