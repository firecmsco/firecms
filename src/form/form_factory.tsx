import React, { ComponentType, useEffect } from "react";

import { useClipboard } from "use-clipboard-hook";
import {
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    TextField as MuiTextField,
    Tooltip
} from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

import { ErrorMessage, FastField, Field, FieldProps, getIn } from "formik";

import {
    CMSFieldProps,
    Entity,
    EntitySchema,
    EntityStatus,
    FormFieldProps,
    Property
} from "../models";
import Select from "./fields/Select";
import ArrayEnumSelect from "./fields/ArrayEnumSelect";
import StorageUploadField from "./fields/StorageUploadField";
import TextField from "./fields/TextField";
import SwitchField from "./fields/SwitchField";
import DateTimeField from "./fields/DateTimeField";
import ReferenceField from "./fields/ReferenceField";
import MapField from "./fields/MapField";
import ArrayDefaultField from "./fields/ArrayDefaultField";
import ReadOnlyField from "./fields/ReadOnlyField";
import MarkDownField from "./fields/MarkdownField";
import { useAppConfigContext, useSnackbarController } from "../contexts";

import { CMSAppProps } from "../CMSAppProps";
import ArrayOfReferencesField from "./fields/ArrayOfReferencesField";

export function createFormField<T, S extends EntitySchema<Key>, Key extends string = Extract<keyof S["properties"], string>>
({
     name,
     property,
     includeDescription,
     underlyingValueHasChanged,
     context,
     tableMode,
     partOfArray,
     autoFocus,
     dependsOnOtherProperties
 }: FormFieldProps<S, Key>): JSX.Element {

    let component: ComponentType<CMSFieldProps<any>> | undefined;
    if (property.readOnly) {
        component = ReadOnlyField;
    } else if (property.config?.field) {
        component = property.config?.field;
    } else if (property.dataType === "array") {
        if ((property.of.dataType === "string" || property.of.dataType === "number") && property.of.config?.enumValues) {
            component = ArrayEnumSelect as ComponentType<CMSFieldProps<any>>;
        } else if (property.of.dataType === "string" && property.of.config?.storageMeta) {
            component = StorageUploadField as ComponentType<CMSFieldProps<any>>;
        } else if (property.of.dataType === "reference") {
            component = ArrayOfReferencesField as ComponentType<CMSFieldProps<any>>;
        } else {
            component = ArrayDefaultField as ComponentType<CMSFieldProps<any>>;
        }
    } else if (property.dataType === "map") {
        component = MapField as ComponentType<CMSFieldProps<any>>;
    } else if (property.dataType === "reference") {
        component = ReferenceField as ComponentType<CMSFieldProps<any>>;
    } else if (property.dataType === "timestamp") {
        component = DateTimeField as ComponentType<CMSFieldProps<any>>;
    } else if (property.dataType === "boolean") {
        component = SwitchField as ComponentType<CMSFieldProps<any>>;
    } else if (property.dataType === "number") {
        if (property.config?.enumValues) {
            component = Select;
        } else {
            component = TextField as ComponentType<CMSFieldProps<any>>;
        }
    } else if (property.dataType === "string") {
        if (property.config?.storageMeta) {
            component = StorageUploadField as ComponentType<CMSFieldProps<any>>;
        } else if (property.config?.markdown) {
            component = MarkDownField as ComponentType<CMSFieldProps<any>>;
        } else if (property.config?.enumValues) {
            component = Select;
        } else {
            component = TextField as ComponentType<CMSFieldProps<any>>;
        }
    }

    if (component) {
        return <FieldInternal
            component={component}
            componentProps={{
                name,
                property,
                includeDescription,
                underlyingValueHasChanged,
                context,
                tableMode,
                partOfArray,
                autoFocus,
                dependsOnOtherProperties
            }}/>;
    }

    return (
        <div>{`Currently the field ${property.dataType} is not supported`}</div>
    );
}

function FieldInternal<P extends Property, T = any, S extends EntitySchema<Key> = EntitySchema, Key extends string = string>
({
     component,
     componentProps: {
         name,
         property,
         includeDescription,
         underlyingValueHasChanged,
         tableMode,
         partOfArray,
         autoFocus,
         context,
         dependsOnOtherProperties
     }
 }:
     {
         component: ComponentType<CMSFieldProps<any>>,
         componentProps: FormFieldProps<S, Key>
     }) {


    const customFieldProps: any = property.config?.fieldProps;

    // we use the standard Field for user defined fields, since it rebuilds
    // when there are changes in other values, in contrast to FastField
    const FieldComponent = dependsOnOtherProperties || property.config?.field ? Field : FastField;

    return (
        <FieldComponent
            key={`form_field_${name}`}
            required={property.validation?.required}
            name={`${name}`}
        >
            {(fieldProps: FieldProps<T>) => {
                const name = fieldProps.field.name;
                const value = fieldProps.field.value;
                const error = getIn(fieldProps.form.errors, name);
                const touched = getIn(fieldProps.form.touched, name);
                const showError: boolean = error
                    && touched
                    && fieldProps.form.submitCount > 0
                    && (!Array.isArray(error) || !!error.filter((e: any) => !!e).length);
                const isSubmitting = fieldProps.form.isSubmitting;

                // useEffect(() => {
                //     if (dependsOnOtherProperties && property.disabled) {
                //         fieldProps.form.setFieldValue(name, null);
                //     }
                // });

                const cmsFieldProps: CMSFieldProps<T> = {
                    name,
                    value,
                    setValue: (value: T | null) => {
                        fieldProps.form.setFieldTouched(name);
                        fieldProps.form.setFieldValue(name, value);
                    },
                    error,
                    touched,
                    showError,
                    isSubmitting,
                    includeDescription,
                    property: property as Property<T>,
                    createFormField,
                    underlyingValueHasChanged,
                    tableMode,
                    partOfArray,
                    autoFocus,
                    customProps: customFieldProps,
                    context
                };

                return (
                    <>

                        {React.createElement(component, cmsFieldProps)}

                        {underlyingValueHasChanged && !fieldProps.form.isSubmitting &&
                        <FormHelperText>
                            This value has been updated in Firestore
                        </FormHelperText>}

                    </>);
            }
            }

        </FieldComponent>);
}


export function createCustomIdField<S extends EntitySchema<Key>, Key extends string = Extract<keyof S["properties"], string>>
(schema: S,
 entityStatus: EntityStatus,
 onChange: Function,
 error: boolean,
 entity: Entity<S, Key> | undefined) {

    const disabled = entityStatus === EntityStatus.existing || !schema.customId;
    const idSetAutomatically = entityStatus !== EntityStatus.existing && !schema.customId;

    const hasEnumValues = typeof schema.customId === "object";

    const snackbarContext = useSnackbarController();
    const { ref, copy, cut } = useClipboard({
        onSuccess: (text) => snackbarContext.open({
            type: "success",
            message: `Copied ${text}`
        })
    });

    const appConfig: CMSAppProps | undefined = useAppConfigContext();
    const inputProps = entity ? {
            endAdornment: (<InputAdornment position="end">
                    <IconButton
                        onClick={(e) => copy(entity.id)}
                        aria-label="copy-id">
                        <Tooltip title={"Copy"}>
                            <svg
                                className={"MuiSvgIcon-root MuiSvgIcon-fontSizeSmall"}
                                width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                        </Tooltip>
                    </IconButton>
                    {appConfig?.firebaseConfig &&
                    <a href={`https://console.firebase.google.com/project/${appConfig.firebaseConfig["projectId"]}/firestore/data/${entity.reference.path}`}
                       rel="noopener noreferrer"
                       target="_blank">
                        <IconButton
                            aria-label="go-to-firestore">
                            <Tooltip title={"Open in Firestore console"}>
                                <OpenInNewIcon
                                    fontSize={"small"}/>
                            </Tooltip>
                        </IconButton>
                    </a>}
                </InputAdornment>
            )
        } :
        undefined;

    const fieldProps: any = {
        label: idSetAutomatically ? "Id is set automatically" : "Id",
        disabled: disabled,
        name: "id",
        type: null,
        value: entity && entityStatus === EntityStatus.existing ? entity.id : undefined,
        variant: "filled"
    };
    return (
        <FormControl fullWidth
                     error={error}
                     {...fieldProps}
                     key={"custom-id-field"}>

            {hasEnumValues && schema.customId &&
            <>
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
            </>}

            {!hasEnumValues &&
            <MuiTextField {...fieldProps}
                          error={error}
                          InputProps={inputProps}
                          onChange={(event) => onChange(event.target.value)}/>}

            <ErrorMessage name={"id"}
                          component="div">
                {(_) => "You need to specify an ID"}
            </ErrorMessage>

        </FormControl>
    );
}
