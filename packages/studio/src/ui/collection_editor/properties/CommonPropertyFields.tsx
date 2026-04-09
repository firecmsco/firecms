import { FieldCaption } from "@rebasepro/cms";
import { Field, getIn, useFormex } from "@rebasepro/formex";
import { DebouncedTextField } from "@rebasepro/ui";
import { PropertyWithId } from "../PropertyEditView";
import React from "react";
;
import { prettifyIdentifier, toSnakeCase } from "@rebasepro/utils";

type CommonPropertyFieldsProps = {
    showErrors: boolean,
    disabledId: boolean,
    disabled: boolean;
    isNewProperty: boolean;
    autoUpdateId: boolean;
};

export const CommonPropertyFields = React.forwardRef<HTMLDivElement, CommonPropertyFieldsProps>(
    function CommonPropertyFields({
        showErrors,
        disabledId,
        disabled,
        autoUpdateId,
        isNewProperty
    }, ref) {

        const {
            errors,
            values,
            setFieldValue,
            setFieldTouched,
            touched,
            validate
        } = useFormex<PropertyWithId>();

        const name = "name";
        const nameError = showErrors && getIn(errors, name);

        const id = "id";
        const idError = showErrors && getIn(errors, id);

        const description = "description";
        const descriptionError = showErrors && getIn(errors, description);

        return (
            <div className={"flex flex-col gap-2 col-span-12"}>

                <div>
                    <Field
                        name={name}
                        inputRef={ref}
                        as={DebouncedTextField}
                        value={values[name]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                            const newNameValue = e.target.value;
                            const idTouched = getIn(touched, id);
                            if (!idTouched && autoUpdateId) {
                                setFieldValue(id, newNameValue ? toSnakeCase(newNameValue) : "", false)
                            }
                            setFieldValue(name, newNameValue, true);
                            setFieldTouched(name, true);
                        }}
                        style={{ fontSize: 20 }}
                        placeholder={"Field name"}
                        required
                        disabled={disabled}
                        error={Boolean(nameError)} />

                    <FieldCaption error={Boolean(nameError)}>
                        {nameError}
                    </FieldCaption>
                </div>

                <div>
                    <DebouncedTextField
                        name={id}
                        label={"ID"}
                        value={values[id]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                            const newIdValue = e.target.value;
                            const nameTouched = getIn(touched, name);
                            if (!nameTouched && autoUpdateId) {
                                setFieldValue(name, newIdValue ? prettifyIdentifier(newIdValue) : "")
                            }
                            setFieldValue(id, newIdValue, true);
                            setFieldTouched(id, true);
                        }}
                        disabled={disabledId || disabled}
                        required
                        size="small"
                        error={Boolean(idError)} />
                    <FieldCaption error={Boolean(idError)}>
                        {idError}
                    </FieldCaption>
                </div>

                <div>
                    <Field name={description}
                        as={DebouncedTextField}
                        label={"Description"}
                        disabled={disabled}
                        error={Boolean(descriptionError)} />
                    <FieldCaption error={Boolean(descriptionError)}>
                        {descriptionError}
                    </FieldCaption>
                </div>

            </div>
        );

    }
);
