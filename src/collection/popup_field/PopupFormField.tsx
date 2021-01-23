import React, { useEffect, useLayoutEffect, useState } from "react";

import { Box, IconButton, Portal } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import deepEqual from "deep-equal";

import {
    Entity,
    EntitySchema,
    EntityStatus,
    Property
} from "../../models";
import { Formik, useFormikContext } from "formik";
import { Draggable } from "./Draggable";
import { getYupObjectSchema } from "../../form/validation";
import { OutsideAlerter } from "../../util/OutsideAlerter";
import { useWindowSize } from "../../util/useWindowSize";
import { FormFieldBuilder } from "../../form";
import { saveEntity } from "../../models";

const AutoSubmitToken = ({ name, onSubmit }: { name: string, onSubmit: (values: any) => void }) => {
    const { values, errors, submitForm } = useFormikContext();

    React.useEffect(() => {
        const fieldError = errors[name];
        const shouldSave = !fieldError || (Array.isArray(fieldError) && !fieldError.filter((e: any) => !!e).length);
        if (shouldSave) {
            onSubmit(values);
            submitForm();
        }
    }, [values, submitForm, errors]);
    return null;
};

interface PopupFormFieldProps<S extends EntitySchema> {
    entity?: Entity<S>,
    schema: S,
    tableKey: string,
    createFormField: FormFieldBuilder,
    cellRect?: DOMRect;
    formPopupOpen: boolean;
    setFormPopupOpen: (value:boolean) => void;
    rowIndex?: number;
    name?: string;
    property?: Property;
    setPreventOutsideClick: (value: any) => void;
}

function PopupFormField<S extends EntitySchema>({
                                                    tableKey,
                                                    entity,
                                                    name,
                                                    property,
                                                    schema,
                                                    cellRect,
                                                    createFormField,
                                                    setPreventOutsideClick,
                                                    formPopupOpen,
                                                    setFormPopupOpen,
                                                    rowIndex
                                                }: PopupFormFieldProps<S>) {

    const [internalValue, setInternalValue] = useState<any>(entity?.values);
    const [popupLocation, setPopupLocation] = useState<{ x: number, y: number }>();
    const [draggableBoundingRect, setDraggableBoundingRect] = useState<DOMRect>();

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
            const handler = setTimeout(() => {
                if (internalValue && !deepEqual(entity?.values, internalValue)) {
                    saveValue(internalValue);
                }
            }, 300);

            return () => {
                clearTimeout(handler);
            };
        },
        [internalValue]
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

    const validationSchema = getYupObjectSchema(schema.properties);

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
        (values: object) => entity && saveEntity({
                collectionPath: entity.reference.parent.path,
                id: entity?.id,
                values: values,
                schema,
                status: EntityStatus.existing
            }
        ).then();


    if (!entity)
        return <></>;

    const form = entity && (
        <div
            key={`popup_form_${tableKey}_${entity.id}_${rowIndex}`}
            style={{
                width: 470,
                maxWidth: "100vw",
                maxHeight: "85vh",
                overflow: "auto"
            }}>
            <Formik
                initialValues={entity.values}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    setInternalValue(values);
                }}
            >
                {({ handleChange, values, touched, dirty, setFieldValue, setFieldTouched, handleSubmit, isSubmitting }) => {
                    return <OutsideAlerter
                        enabled={true}
                        onOutsideClick={onOutsideClick}>

                        {name && property && createFormField({
                            name: name as string,
                            property: property,
                            includeDescription: false,
                            underlyingValueHasChanged: false,
                            entitySchema: schema,
                            tableMode: true,
                            partOfArray: false,
                            autoFocus: formPopupOpen
                        })}

                        {name && <AutoSubmitToken
                            name={name}
                            onSubmit={(values) => {
                                setInternalValue(values);
                            }}/>}

                    </OutsideAlerter>;
                }}
            </Formik>
        </div>
    );

    return (
        <Portal container={document.body}>
            <Draggable
                key={`draggable_${name}_${rowIndex}`}
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

export default PopupFormField;
