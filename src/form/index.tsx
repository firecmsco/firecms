import React from "react";
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


export function createFormField(name: string,
                                property: Property,
                                value: any,
                                includeDescription: boolean,
                                errors: any,
                                touched: any): JSX.Element {

    const fieldProps = {
        name,
        value,
        errors,
        touched,
        includeDescription,
        createFormField
    };

    if (property.disabled) {
        return <DisabledField {...fieldProps}
                              property={property}/>;
    }

    if (property.dataType === "array") {
        return createArrayField(name, property, value, includeDescription, errors, touched);
    } else if (property.dataType === "map") {
        return <MapField {...fieldProps}
                         property={property}/>;
    } else if (property.dataType === "reference") {
        return <ReferenceField {...fieldProps}
                               property={property}/>;
    } else if (property.dataType === "timestamp") {
        return <DateTimeField {...fieldProps}
                              property={property}/>;
    } else if (property.dataType === "boolean") {
        return <SwitchField {...fieldProps}
                            property={property}/>;
    } else if (property.dataType === "number") {
        if (property.enumValues) {
            return <Select {...fieldProps}
                           property={property}/>;
        } else {
            return <TextField {...fieldProps}
                              property={property}/>;
        }
    } else if (property.dataType === "string") {
        if (property.storageMeta) {
            return <StorageUploadField {...fieldProps}
                                       property={property}/>;
        } else if (property.enumValues) {
            return <Select {...fieldProps}
                           property={property}/>;
        } else {
            return <TextField {...fieldProps}
                              property={property}/>;
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
                                property={arrayProperty}
                                includeDescription={includeDescription}
                                createFormField={createFormField}
                                errors={errors}
                                touched={touched}
                                value={values}/>;
    } else if (arrayProperty.of.dataType === "map") {
        return <ArrayMapField name={key}
                              property={arrayProperty}
                              includeDescription={includeDescription}
                              createFormField={createFormField}
                              errors={errors}
                              touched={touched}
                              value={values}/>;
    } else {
        return <ArrayDefaultField name={key}
                                  property={arrayProperty}
                                  includeDescription={includeDescription}
                                  createFormField={createFormField}
                                  errors={errors}
                                  touched={touched}
                                  value={values}/>;
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
