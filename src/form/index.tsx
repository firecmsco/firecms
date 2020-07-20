import React from "react";
import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    TextField as MuiTextField
} from "@material-ui/core";
import { EntitySchema, EntityStatus, Property } from "../models";

import { ErrorMessage, Field, FieldProps } from "formik";

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
import { CMSFieldProps } from "./form_props";

function buildField<P extends Property<T>, T = any>(name: string,
                                                    property: P,
                                                    includeDescription: boolean,
                                                    component: React.ComponentType<CMSFieldProps<T>>,
                                                    underlyingValueHasChanged: boolean
) {

    const additionalFieldProps: any = property.config?.fieldProps;

    return <React.Fragment>

        <Field
            required={property.validation?.required}
            name={`${name}`}
        >
            {(fieldProps: FieldProps<T>) =>
                React.createElement(component, {
                    ...fieldProps,
                    ...additionalFieldProps,
                    includeDescription,
                    property,
                    createFormField
                })}

        </Field>

        {underlyingValueHasChanged &&
        <FormHelperText>
            This value has been updated in Firestore
        </FormHelperText>}

    </React.Fragment>;
}

export function createFormField(name: string,
                                property: Property,
                                includeDescription: boolean,
                                underlyingValueHasChanged: boolean): JSX.Element {

    if (property.disabled) {
        return buildField(name, property, includeDescription, DisabledField, underlyingValueHasChanged);
    }

    let component: React.ComponentType<CMSFieldProps<any>> | undefined;

    if (property.config?.field) {
        component = property.config?.field;
    } else if (property.dataType === "array") {
        if ((property.of.dataType === "string" || property.of.dataType === "number") && property.of.config?.enumValues) {
            component = ArrayEnumSelect;
        } else if (property.of.dataType === "string" && property.of.config?.storageMeta) {
            component = StorageUploadField;
        } else if (property.of.dataType === "map") {
            component = ArrayMapField;
        } else {
            component = ArrayDefaultField;
        }
    } else if (property.dataType === "map") {
        component = MapField;
    } else if (property.dataType === "reference") {
        component = ReferenceField;
    } else if (property.dataType === "timestamp") {
        component = DateTimeField;
    } else if (property.dataType === "boolean") {
        component = SwitchField;
    } else if (property.dataType === "number") {
        if (property.config?.enumValues) {
            component = Select;
        } else {
            component = TextField;
        }
    } else if (property.dataType === "string") {
        if (property.config?.storageMeta) {
            component = StorageUploadField;
        } else if (property.config?.enumValues) {
            component = Select;
        } else {
            component = TextField;
        }
    }
    if (component)
        return buildField(name, property, includeDescription, component, underlyingValueHasChanged);

    return (
        <div>{`Currently the field ${property.dataType} is not supported`}</div>
    );
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
        <FormControl fullWidth error={error} {...fieldProps}
                     key={"custom-id-field"}>

            {hasEnumValues && schema.customId &&
            <React.Fragment>
                <InputLabel id={`id-label`}>{fieldProps.label}</InputLabel>
                <MuiSelect
                    labelId={`id-label`}
                    error={error}
                    {...fieldProps}
                    onChange={(event: any) => onChange(event.target.value)}>
                    {Object.entries(schema.customId).map(([key, label]) =>
                        <MenuItem
                            key={`custom-id-item-${key}`}
                            value={key}>
                            {`${key} - ${label}`}
                        </MenuItem>)}
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

export {
    ArrayDefaultField,
    ArrayEnumSelect,
    ArrayMapField,
    DateTimeField,
    DisabledField,
    MapField,
    ReferenceField,
    Select,
    StorageUploadField,
    SwitchField,
    TextField
};
