import React, { useEffect, useLayoutEffect, useState } from "react";

import { Box, IconButton, Portal, Typography } from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import deepEqual from "deep-equal";

import {
    CMSFormFieldProps,
    Entity,
    EntitySchema,
    EntityStatus,
    EntityValues,
    Property,
    saveEntity
} from "../../models";
import { Formik, FormikProps, useFormikContext } from "formik";
import { Draggable } from "./Draggable";
import { getYupEntitySchema } from "../../form/validation";
import { OutsideAlerter } from "../../util/OutsideAlerter";
import { useWindowSize } from "../../util/useWindowSize";
import { FormContext } from "../../models/fields";
import { isReadOnly } from "../../models/utils";


interface PopupFormFieldProps<S extends EntitySchema<Key>, Key extends string> {
    entity?: Entity<S, Key>;
    collectionPath: string;
    schema: S;
    tableKey: string;
    name?: string;
    property?: Property;
    CMSFormField: React.FunctionComponent<CMSFormFieldProps<S, Key>>;
    cellRect?: DOMRect;
    formPopupOpen: boolean;
    setFormPopupOpen: (value: boolean) => void;
    columnIndex?: number;
    setPreventOutsideClick: (value: any) => void;
    usedPropertyBuilder: boolean;
}

function PopupFormField<S extends EntitySchema<Key>, Key extends string>({
                                                                             tableKey,
                                                                             entity,
                                                                             collectionPath,
                                                                             name,
                                                                             property,
                                                                             schema,
                                                                             cellRect,
                                                                             CMSFormField,
                                                                             setPreventOutsideClick,
                                                                             formPopupOpen,
                                                                             setFormPopupOpen,
                                                                             columnIndex,
                                                                             usedPropertyBuilder
                                                                         }: PopupFormFieldProps<S, Key>) {


    const [savingError, setSavingError] = React.useState<any>();
    const [internalValue, setInternalValue] = useState<EntityValues<S, Key> | undefined>(entity?.values);
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
            const saveIfChanged = () => {
                if (!deepEqual(entity?.values, internalValue)) {
                    saveValue(internalValue ?? {});
                }
            };
            const handler = setTimeout(saveIfChanged, 200);
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

    const validationSchema = getYupEntitySchema(
        schema.properties,
        internalValue as Partial<EntityValues<S, Key>> ?? {},
        collectionPath,
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

    const onSaveFailure = (e: Error) => {
        setSavingError(e);
    };

    const saveValue =
        (values: object) => {
            setSavingError(null);
            return entity && saveEntity({
                    collectionPath: entity.reference.parent.path,
                    id: entity?.id,
                    values: values,
                    schema,
                    status: EntityStatus.existing,
                    onSaveFailure
                }
            ).then();
        };


    if (!entity)
        return <></>;

    const renderForm = ({
                            handleChange,
                            values,
                            touched,
                            dirty,
                            setFieldValue,
                            setFieldTouched,
                            handleSubmit,
                            isSubmitting
                        }: FormikProps<EntityValues<S, Key>>) => {

        const context: FormContext<S, Key> = {
            entitySchema: schema,
            entityId: entity.id,
            values
        };

        return <OutsideAlerter
            enabled={true}
            onOutsideClick={onOutsideClick}>

            {name && property && <CMSFormField
                name={name as string}
                property={property}
                includeDescription={false}
                underlyingValueHasChanged={false}
                disabled={isSubmitting || isReadOnly(property) || !!property.disabled}
                context={context}
                tableMode={true}
                partOfArray={false}
                autoFocus={formPopupOpen}
                dependsOnOtherProperties={usedPropertyBuilder}
            />}

            {name && <AutoSubmitToken
                name={name}
                onSubmit={(values) => {
                    setInternalValue(values);
                }}/>}

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
                onSubmit={async (values) => {
                    return Promise.resolve();
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
        const fieldError = (errors as any)[name];
        const shouldSave = !fieldError || (Array.isArray(fieldError) && !fieldError.filter((e: any) => !!e).length);
        if (shouldSave) {
            onSubmit(values);
        }
    }, [values, errors]);
    return null;
};

export default PopupFormField;
