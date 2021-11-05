import React, { ComponentType, ReactElement, useEffect, useState } from "react";
import { FormHelperText } from "@mui/material";

import {
    FastField,
    Field,
    FieldProps as FormikFieldProps,
    getIn
} from "formik";

import {
    ArrayProperty,
    CMSFormFieldProps,
    CMSType,
    FieldProps,
    Property
} from "../models";

import { Select } from "./fields/Select";
import { ArrayEnumSelect } from "./fields/ArrayEnumSelect";
import { StorageUploadField } from "./fields/StorageUploadField";
import { TextField } from "./fields/TextField";
import { SwitchField } from "./fields/SwitchField";
import { DateTimeField } from "./fields/DateTimeField";
import { ReferenceField } from "./fields/ReferenceField";
import { MapField } from "./fields/MapField";
import { ArrayDefaultField } from "./fields/ArrayDefaultField";
import { ArrayOneOfField } from "./fields/ArrayOneOfField";
import { ReadOnlyField } from "./fields/ReadOnlyField";
import { MarkdownField } from "./fields/MarkdownField";

import { ArrayOfReferencesField } from "./fields/ArrayOfReferencesField";
import { isReadOnly } from "../core/utils";
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
 * Please note that if you build a custom field in a component, the
 * **validation** passed in the property will have no effect. You need to set
 * the validation in the `EntitySchema` definition.
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
export function buildPropertyField<T extends CMSType = any, M = any>
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
 }: CMSFormFieldProps<M>): ReactElement<CMSFormFieldProps<M>> {

    let component: ComponentType<FieldProps<T, any, M>> | undefined;
    if (isReadOnly(property)) {
        component = ReadOnlyField;
    } else if (property.config?.Field) {
        component = property.config?.Field as ComponentType<FieldProps<T>>;
    } else if (property.dataType === "array") {
        const of = (property as ArrayProperty).of;
        if (of) {
            if ((of.dataType === "string" || of.dataType === "number") && of.config?.enumValues) {
                component = ArrayEnumSelect as ComponentType<FieldProps<T>>;
            } else if (of.dataType === "string" && of.config?.storageMeta) {
                component = StorageUploadField as ComponentType<FieldProps<T>>;
            } else if (of.dataType === "reference") {
                component = ArrayOfReferencesField as ComponentType<FieldProps<T>>;
            } else {
                component = ArrayDefaultField as ComponentType<FieldProps<T>>;
            }
        }
        const oneOf = (property as ArrayProperty).oneOf;
        if (oneOf) {
            component = ArrayOneOfField as ComponentType<FieldProps<T>>;
        }
        if (!of && !oneOf) {
            throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${name}`);
        }
    } else if (property.dataType === "map") {
        component = MapField as ComponentType<FieldProps<T>>;
    } else if (property.dataType === "reference") {
        component = ReferenceField as ComponentType<FieldProps<T>>;
    } else if (property.dataType === "timestamp") {
        component = DateTimeField as ComponentType<FieldProps<T>>;
    } else if (property.dataType === "boolean") {
        component = SwitchField as ComponentType<FieldProps<T>>;
    } else if (property.dataType === "number") {
        if (property.config?.enumValues) {
            component = Select as ComponentType<FieldProps<T>>;
        } else {
            component = TextField as ComponentType<FieldProps<T>>;
        }
    } else if (property.dataType === "string") {
        if (property.config?.storageMeta) {
            component = StorageUploadField as ComponentType<FieldProps<T>>;
        } else if (property.config?.markdown) {
            component = MarkdownField as ComponentType<FieldProps<T>>;
        } else if (property.config?.enumValues) {
            component = Select as ComponentType<FieldProps<T>>;
        } else {
            component = TextField as ComponentType<FieldProps<T>>;
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
        const FieldComponent = dependsOnOtherProperties || property.config?.Field ? Field : FastField;

        return (
            <FieldComponent
                key={`form_field_${name}`}
                required={property.validation?.required}
                name={`${name}`}
            >
                {(fieldProps: FormikFieldProps<T>) => {
                    return <FieldInternal
                        component={component as ComponentType<FieldProps<T>>}
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


function FieldInternal<T extends CMSType, M extends { [Key: string]: any }>
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
         component: ComponentType<FieldProps<T>>,
         componentProps: CMSFormFieldProps<M>,
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
        property: property as Property<T>,
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
                This value has been updated elsewhere
            </FormHelperText>}

        </>);

}

