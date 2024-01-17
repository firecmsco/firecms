import { Field, getIn, useFormikContext } from "formik";
import { DebouncedTextField } from "@firecms/ui";
import { PropertyWithId } from "../PropertyEditView";
import React from "react";
import { FieldHelperView } from "./FieldHelperView";
import { toSnakeCase, unslugify } from "@firecms/core";

type CommonPropertyFieldsProps = {
    showErrors: boolean,
    disabledId: boolean,
    existingPropertyKeys?: string[];
    disabled: boolean;
    isNewProperty: boolean;
    autoUpdateId: boolean;
};

export const CommonPropertyFields = React.forwardRef<HTMLDivElement, CommonPropertyFieldsProps>(
    function CommonPropertyFields({
                                      showErrors,
                                      disabledId,
                                      existingPropertyKeys,
                                      disabled,
                                      autoUpdateId,
                                      isNewProperty
                                  }, ref) {

        const {
            errors,
            values,
            setFieldValue,
            setFieldTouched,
            touched
        } = useFormikContext<PropertyWithId>();

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
                        inputRef={ref}
                        as={DebouncedTextField}
                        value={values[name]}
                        onChange={(e: any) => {
                            const newNameValue = e.target.value;
                            setFieldValue(name, newNameValue);
                            setFieldTouched(name, true, true);
                            const idTouched = getIn(touched, id);
                            if (!idTouched && autoUpdateId) {
                                setFieldValue(id, newNameValue ? toSnakeCase(newNameValue) : "")
                            }
                        }}
                        style={{ fontSize: 20 }}
                        validate={validateName}
                        placeholder={"Field name"}
                        required
                        disabled={disabled}
                        error={Boolean(nameError)}/>

                    <FieldHelperView error={Boolean(nameError)}>
                        {nameError}
                    </FieldHelperView>
                </div>

                <div>
                    <Field
                        as={DebouncedTextField}
                        label={"ID"}
                        value={values[id]}
                        onChange={(e: any) => {
                            const newIdValue = e.target.value;
                            setFieldValue(id, newIdValue);
                            setFieldTouched(id, true, true);
                            const nameTouched = getIn(touched, name);
                            if (!nameTouched && autoUpdateId) {
                                setFieldValue(name, newIdValue ? unslugify(newIdValue) : "")
                            }
                        }}
                        validate={() => validateId(values[id], existingPropertyKeys)}
                        disabled={disabledId || disabled}
                        required
                        size="small"
                        error={Boolean(idError)}/>
                    <FieldHelperView error={Boolean(idError)}>
                        {idError}
                    </FieldHelperView>
                </div>

                <div>
                    <Field name={description}
                           as={DebouncedTextField}
                           label={"Description"}
                           disabled={disabled}
                           error={Boolean(descriptionError)}/>
                    <FieldHelperView error={Boolean(descriptionError)}>
                        {descriptionError}
                    </FieldHelperView>
                </div>

            </div>
        );

    }
);

const idRegEx = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function validateId(value?: string, existingPropertyKeys?: string[]) {

    let error;
    if (!value) {
        error = "You must specify an id for the field";
    }
    if (value && !value.match(idRegEx)) {
        error = "The id can only contain letters, numbers and underscores (_), and not start with a number";
    }
    if (value && existingPropertyKeys && existingPropertyKeys.includes(value)) {
        error = "There is another field with this ID already";
    }
    return error;
}

function validateName(value: string) {
    let error;
    if (!value) {
        error = "You must specify a title for the field";
    }
    return error;
}
