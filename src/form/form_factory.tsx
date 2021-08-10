import React, { ElementType, ReactElement, useEffect, useState } from "react";

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

import {
    ErrorMessage,
    FastField,
    Field,
    FieldProps as FormikFieldProps,
    getIn
} from "formik";

import {
    ArrayProperty,
    CMSFormFieldProps,
    CMSType,
    Entity,
    EntitySchema,
    EntityStatus,
    FieldProps,
    NumberProperty,
    StringProperty
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
import ArrayOneOfField from "./fields/ArrayOneOfField";
import ReadOnlyField from "./fields/ReadOnlyField";
import MarkdownField from "./fields/MarkdownField";

import ArrayOfReferencesField from "./fields/ArrayOfReferencesField";
import { useCMSAppContext, useSnackbarController } from "../contexts";
import { isReadOnly } from "../models/utils";
import { CMSAppContext } from "../contexts/CMSAppContext";
import deepEqual from "deep-equal";


/**
 * This factory method renders a form field creating the corresponding configuration
 * from a property. For example if bound to a string property, it will generate
 * a text field.
 *
 * You can use it when you are creating a custom field, and need to
 * render additional fields mapped to properties. This is useful if you
 * need to build a complex property mapping, like an array where each index
 * is a different property.
 *
 * @param name You can use nested names such as `address.street` or `friends[2]`
 * @param property
 * @param context
 * @param includeDescription
 * @param underlyingValueHasChanged
 * @param disabled
 * @param tableMode
 * @param partOfArray
 * @param autoFocus
 * @param dependsOnOtherProperties
 * @category Form custom fields
 */
export function buildPropertyField<T extends CMSType, S extends EntitySchema<Key>, Key extends string = Extract<keyof S["properties"], string>>
({
     name,
     property,
     context,
     includeDescription,
     underlyingValueHasChanged,
     disabled,
     tableMode,
     partOfArray,
     autoFocus,
     dependsOnOtherProperties
 }: CMSFormFieldProps<T, S, Key>): ReactElement<CMSFormFieldProps<T, S, Key>> {

    let component: ElementType<FieldProps<T>> | undefined;
    if (isReadOnly(property)) {
        component = ReadOnlyField;
    } else if (property.config?.field) {
        component = property.config?.field as ElementType<FieldProps<T>>;
    } else if (property.dataType === "array") {
        const of = (property as ArrayProperty).of;
        if (of) {
            if ((of.dataType === "string" || of.dataType === "number") && of.config?.enumValues) {
                component = ArrayEnumSelect as ElementType<FieldProps<T>>;
            } else if (of.dataType === "string" && of.config?.storageMeta) {
                component = StorageUploadField as ElementType<FieldProps<T>>;
            } else if (of.dataType === "reference") {
                component = ArrayOfReferencesField as ElementType<FieldProps<T>>;
            } else {
                component = ArrayDefaultField as ElementType<FieldProps<T>>;
            }
        }
        const oneOf = (property as ArrayProperty).oneOf;
        if (oneOf) {
            component = ArrayOneOfField as ElementType<FieldProps<T>>;
        }
        if (!of && !oneOf) {
            throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${name}`);
        }
    } else if (property.dataType === "map") {
        component = MapField as ElementType<FieldProps<T>>;
    } else if (property.dataType === "reference") {
        component = ReferenceField as ElementType<FieldProps<T>>;
    } else if (property.dataType === "timestamp") {
        component = DateTimeField as ElementType<FieldProps<T>>;
    } else if (property.dataType === "boolean") {
        component = SwitchField as ElementType<FieldProps<T>>;
    } else if (property.dataType === "number") {
        if ((property as NumberProperty).config?.enumValues) {
            component = Select as ElementType<FieldProps<T>>;
        } else {
            component = TextField as ElementType<FieldProps<T>>;
        }
    } else if (property.dataType === "string") {
        if ((property as StringProperty).config?.storageMeta) {
            component = StorageUploadField as ElementType<FieldProps<T>>;
        } else if ((property as StringProperty).config?.markdown) {
            component = MarkdownField as ElementType<FieldProps<T>>;
        } else if ((property as StringProperty).config?.enumValues) {
            component = Select as ElementType<FieldProps<T>>;
        } else {
            component = TextField as ElementType<FieldProps<T>>;
        }
    }

    if (component) {

        const componentProps = {
            name,
            property,
            includeDescription,
            underlyingValueHasChanged,
            context,
            disabled,
            tableMode,
            partOfArray,
            autoFocus,
            dependsOnOtherProperties
        };

        // we use the standard Field for user defined fields, since it rebuilds
        // when there are changes in other values, in contrast to FastField
        const FieldComponent = dependsOnOtherProperties || property.config?.field ? Field : FastField;

        return (
            <FieldComponent
                key={`form_field_${name}`}
                required={property.validation?.required}
                name={`${name}`}
            >
                {(fieldProps: FormikFieldProps<T>) => {
                    return <FieldInternal
                        component={component as ElementType<FieldProps<T>>}
                        componentProps={componentProps}
                        fieldProps={fieldProps}/>;
                }}
            </FieldComponent>
        );

    }

    return (
        <div>{`Currently the field ${property.dataType} is not supported`}</div>
    );
}


function FieldInternal<T extends CMSType, S extends EntitySchema<Key> = EntitySchema<any>, Key extends string = string>
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
         disabled,
         dependsOnOtherProperties
     },
     fieldProps

 }:
     {
         component: ElementType<FieldProps<T>>,
         componentProps: CMSFormFieldProps<T, S, Key>,
         fieldProps: FormikFieldProps<T>
     }) {

    const customFieldProps: any = property.config?.customProps;
    const value = fieldProps.field.value;
    const initialValue = fieldProps.meta.initialValue;
    const error = getIn(fieldProps.form.errors, name);
    const touched = getIn(fieldProps.form.touched, name);

    const showError: boolean = error
        && (fieldProps.form.submitCount > 0 || property.validation?.unique)
        && (!Array.isArray(error) || !!error.filter((e: any) => !!e).length);

    const isSubmitting = fieldProps.form.isSubmitting;

    const disabledTooltip: string | undefined = typeof property.disabled === "object" ? property.disabled.disabledMessage : undefined;

    const [internalValue, setInternalValue] = useState<T | null>(value);
    useEffect(
        () => {
            const handler = setTimeout(() => {
                fieldProps.form.setFieldValue(name, internalValue);
            }, 50);

            return () => {
                clearTimeout(handler);
            };
        },
        [internalValue]
    );

    useEffect(
        () => {
            if (!deepEqual(value, internalValue)) {
                setInternalValue(value);
            }
        },
        [value]
    );

    const cmsFieldProps: FieldProps<T> = {
        name,
        value: internalValue as T,
        initialValue,
        setValue: (value: T | null) => {
            fieldProps.form.setFieldTouched(name, true, false);
            setInternalValue(value);
        },
        error,
        touched,
        showError,
        isSubmitting,
        includeDescription: includeDescription ?? true,
        property: property,
        disabled: disabled ?? false,
        underlyingValueHasChanged: underlyingValueHasChanged ?? false,
        tableMode: tableMode ?? false,
        partOfArray: partOfArray ?? false,
        autoFocus: autoFocus ?? false,
        customProps: customFieldProps,
        context,
        dependsOnOtherProperties: dependsOnOtherProperties ?? true
    };

    return (
        <>

            {React.createElement(component, cmsFieldProps)}

            {underlyingValueHasChanged && !isSubmitting &&
            <FormHelperText>
                This value has been updated in Firestore
            </FormHelperText>}

            {disabledTooltip &&
            <FormHelperText>
                {disabledTooltip}
            </FormHelperText>}

        </>);

}


export function createCustomIdField<S extends EntitySchema<Key>, Key extends string = Extract<keyof S["properties"], string>>
(schema: S,
 entityStatus: EntityStatus,
 onChange: Function,
 error: boolean,
 entity: Entity<S, Key> | undefined) {

    const disabled = entityStatus === "existing" || !schema.customId;
    const idSetAutomatically = entityStatus !== "existing" && !schema.customId;

    const hasEnumValues = typeof schema.customId === "object";

    const snackbarContext = useSnackbarController();
    const { ref, copy, cut } = useClipboard({
        onSuccess: (text) => snackbarContext.open({
            type: "success",
            message: `Copied ${text}`
        })
    });

    const appConfig: CMSAppContext | undefined = useCMSAppContext();
    const inputProps = entity ? {
            endAdornment: (
                <InputAdornment position="end">

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
                    <a href={`https://console.firebase.google.com/project/${(appConfig.firebaseConfig as any)["projectId"]}/firestore/data/${entity.reference.path}`}
                       rel="noopener noreferrer"
                       target="_blank">
                        <IconButton
                            aria-label="go-to-firestore">
                            <Tooltip title={"Open in Firestore console"}>
                                <OpenInNewIcon fontSize={"small"}/>
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
        value: entity && entityStatus === "existing" ? entity.id : undefined,
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
                          onChange={(event) => {
                              let value = event.target.value;
                              if (value) value = value.trim();
                              return onChange(value);
                          }}/>}

            <ErrorMessage name={"id"}
                          component="div">
                {(_) => "You need to specify an ID"}
            </ErrorMessage>

        </FormControl>
    );
}


function FieldInternalInternal<T extends CMSType, S extends EntitySchema<Key> = EntitySchema<any>, Key extends string = string>
(fieldProps: FormikFieldProps<T>) {

}
