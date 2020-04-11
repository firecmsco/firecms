import React, { ReactNode } from "react";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    TextField as MuiTextField
} from "@material-ui/core";
import { ArrayProperty, EntitySchema, EntityStatus, Property } from "../models";

import { ErrorMessage } from "formik";

import Select from "./fields/Select";
import ArrayEnumSelect from "./fields/ArrayEnumSelect";
import StorageUploadField from "./fields/StorageUploadField";
import TextField from "./fields/TextField";
import SwitchField from "./fields/SwitchField";
import DateTimeField from "./fields/DateTimeField";
import ReferenceField from "./fields/ReferenceField";
import MapField from "./fields/MapField";
import ArrayDefaultField from "./fields/ArrayDefaultField";
import ArrayMapField from "./fields/ArrayMapField";
import DisabledField from "./fields/DisabledField";


export function createFormField(key: string, property: Property, value: any, includeDescription: boolean, error: any, touched: any): ReactNode {

    if (property.disabled) {
        return <DisabledField name={key}
                              property={property}
                              value={value}
                              includeDescription={includeDescription}/>;
    }

    if (property.dataType === "array") {
        return createArrayField(key, property, value, includeDescription, error, touched);
    } else if (property.dataType === "map") {
        return <MapField name={key}
                         property={property}
                         value={value}
                         createFormField={createFormField}
                         errors={error}
                         touched={touched}
                         includeDescription={includeDescription}/>;
    } else if (property.dataType === "reference") {
        return <ReferenceField name={key}
                               property={property}
                               includeDescription={includeDescription}/>;
    } else if (property.dataType === "timestamp") {
        return <DateTimeField name={key}
                              property={property}
                              includeDescription={includeDescription}/>;
    } else if (property.dataType === "boolean") {
        return <SwitchField name={key}
                            property={property}
                            includeDescription={includeDescription}/>;
    } else if (property.dataType === "number") {
        if (property.enumValues) {
            return <Select name={key}
                           property={property}
                           includeDescription={includeDescription}/>;
        } else {
            return <TextField name={key}
                              property={property}
                              includeDescription={includeDescription}/>;
        }
    } else if (property.dataType === "string") {
        if (property.storageMeta) {
            return <StorageUploadField value={value as string}
                                       name={key}
                                       property={property}
                                       includeDescription={includeDescription}/>;
        } else if (property.enumValues) {
            return <Select name={key}
                           property={property}
                           includeDescription={includeDescription}/>;
        } else {
            return <TextField name={key}
                              property={property}
                              includeDescription={includeDescription}/>;
        }
    }

    return (
        <div>{`Currently the field ${property.dataType} is not supported`}</div>
    );
}


function createArrayField(key: string,
                          arrayProperty: ArrayProperty<any>,
                          values: any[],
                          includeDescription: boolean,
                          errors: any[],
                          touched: any[]) {


    if (values && !Array.isArray(values)) {
        console.error("Field misconfiguration: array field expected array value", arrayProperty, values);
        values = [];
    }

    if ((arrayProperty.of.dataType === "string" || arrayProperty.of.dataType === "number") && arrayProperty.of.enumValues) {
        return <ArrayEnumSelect name={key}
                                arrayProperty={arrayProperty}
                                includeDescription={includeDescription}
                                createFormField={createFormField}
                                errors={errors}
                                touched={touched}
                                values={values}/>;
    } else if (arrayProperty.of.dataType === "map") {
        return <ArrayMapField name={key}
                              arrayProperty={arrayProperty}
                              includeDescription={includeDescription}
                              createFormField={createFormField}
                              errors={errors}
                              touched={touched}
                              values={values}/>;
    } else {
        return <ArrayDefaultField name={key}
                                  arrayProperty={arrayProperty}
                                  includeDescription={includeDescription}
                                  createFormField={createFormField}
                                  errors={errors}
                                  touched={touched}
                                  values={values}/>;
    }

}

export function createCustomIdField(schema: EntitySchema, formType: EntityStatus, onChange: Function, error: boolean, id: string | undefined) {

    const disabled = formType !== EntityStatus.new || !schema.customId;

    const hasEnumValues = typeof schema.customId === "object";

    const fieldProps: any = {
        label: (formType === EntityStatus.new && disabled) ? "Id is set automatically" : "Id",
        disabled: disabled,
        name: "id",
        type: null,
        value: id,
        variant: "outlined"
    };

    return (
        <FormControl fullWidth error={error} {...fieldProps}>

            {hasEnumValues && schema.customId &&
            <React.Fragment>
                <InputLabel id={`id-label`}>{fieldProps.label}</InputLabel>
                <MuiSelect
                    labelId={`id-label`}
                    error={error}
                    {...fieldProps}
                    onChange={(event: any) => onChange(event.target.value)}>
                    {Object.entries(schema.customId).map(([key, label]) =>
                        <MenuItem value={key}>{`${key} - ${label}`}</MenuItem>)}
                </MuiSelect>
            </React.Fragment>}

            {!hasEnumValues &&
            <MuiTextField {...fieldProps}
                          error={error}
                          onChange={(event) => onChange(event.target.value)}/>}

            <ErrorMessage name={"id"}
                          component="div">{(s) => "You need to specify an ID"}</ErrorMessage>

        </FormControl>
    );
}
