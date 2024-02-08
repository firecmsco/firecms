import { Field, getIn, useFormex } from "../../../form";
import { DebouncedTextField } from "@firecms/ui";
import { PropertyWithId } from "../PropertyEditView";
import React from "react";
import { FieldHelperView } from "./FieldHelperView";
import { toSnakeCase, unslugify } from "@firecms/core";

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
                        onChange={(e: any) => {
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
                        error={Boolean(nameError)}/>

                    <FieldHelperView error={Boolean(nameError)}>
                        {nameError}
                    </FieldHelperView>
                </div>

                <div>
                    <Field
                        name={id}
                        as={DebouncedTextField}
                        label={"ID"}
                        value={values[id]}
                        onChange={(e: any) => {
                            const newIdValue = e.target.value;
                            const nameTouched = getIn(touched, name);
                            if (!nameTouched && autoUpdateId) {
                                setFieldValue(name, newIdValue ? unslugify(newIdValue) : "")
                            }
                            setFieldValue(id, newIdValue, true);
                            setFieldTouched(id, true);
                        }}
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
