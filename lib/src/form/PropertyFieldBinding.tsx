import React, { ComponentType, ReactElement } from "react";
import { FormHelperText } from "@mui/material";

import {
    FastField,
    Field,
    FieldProps as FormikFieldProps,
    getIn
} from "formik";

import {
    CMSType,
    FieldProps,
    PropertyFieldBindingProps,
    ResolvedProperty
} from "../types";
import { ReadOnlyFieldBinding } from "./field_bindings/ReadOnlyFieldBinding";

import {
    ErrorBoundary,
    getFieldConfig,
    isReadOnly,
    resolveProperty
} from "../core";
import { useFireCMSContext } from "../hooks";

/**
 * This component renders a form field creating the corresponding configuration
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
 * the validation in the `EntityCollection` definition.
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
 * @param shouldAlwaysRerender
 * @category Form custom fields
 */
export function PropertyFieldBinding<T extends CMSType = CMSType, CustomProps = any, M extends Record<string, any> = Record<string, any>>
({
     propertyKey,
     property,
     context,
     includeDescription,
     underlyingValueHasChanged,
     disabled,
     tableMode,
     partOfArray,
     autoFocus,
     shouldAlwaysRerender
 }: PropertyFieldBindingProps<any, M>): ReactElement<PropertyFieldBindingProps<any, M>> {

    const fireCMSContext = useFireCMSContext();

    let component: ComponentType<FieldProps> | undefined;
    const resolvedProperty: ResolvedProperty<T> | null = resolveProperty({
        propertyOrBuilder: property,
        values: context.values,
        path: context.path,
        entityId: context.entityId,
        fields: fireCMSContext.fields
    });
    if (resolvedProperty === null) {
        return <></>;
    } else if (isReadOnly(resolvedProperty)) {
        component = ReadOnlyFieldBinding;
    } else if (resolvedProperty.Field) {
        if (typeof resolvedProperty.Field === "function") {
            component = resolvedProperty.Field as ComponentType<FieldProps>;
        }
    } else {
        const fieldConfig = getFieldConfig(resolvedProperty);
        if (!fieldConfig) {
            throw new Error(`INTERNAL: Could not find field config for property ${propertyKey}`);
        }
        component = fieldConfig.Field as ComponentType<FieldProps>;
    }

    if (component) {

        const componentProps: PropertyFieldBindingProps<T, M> = {
            propertyKey,
            property: resolvedProperty as ResolvedProperty<T>,
            includeDescription,
            underlyingValueHasChanged,
            context,
            disabled,
            tableMode,
            partOfArray,
            autoFocus,
            shouldAlwaysRerender
        };

        // we use the standard Field for user defined fields, since it rebuilds
        // when there are changes in other values, in contrast to FastField
        const FieldComponent = shouldAlwaysRerender || resolvedProperty.Field ? Field : FastField;

        return (
            <FieldComponent
                required={resolvedProperty.validation?.required}
                name={`${propertyKey}`}
            >
                {(fieldProps: FormikFieldProps<T>) => {
                    return <FieldInternal
                        Component={component as ComponentType<FieldProps>}
                        componentProps={componentProps}
                        fieldProps={fieldProps}/>;
                }}
            </FieldComponent>
        );

    }

    return (
        <div>{`Currently the field ${resolvedProperty.dataType} is not supported`}</div>
    );
}

function FieldInternal<T extends CMSType, CustomProps, M extends Record<string, any>>
({
     Component,
     componentProps: {
         propertyKey,
         property,
         includeDescription,
         underlyingValueHasChanged,
         tableMode,
         partOfArray,
         autoFocus,
         context,
         disabled,
         shouldAlwaysRerender
     },
     fieldProps
 }:
     {
         Component: ComponentType<FieldProps<T, any, M>>,
         componentProps: PropertyFieldBindingProps<T, M>,
         fieldProps: FormikFieldProps<T>
     }) {

    const customFieldProps: any = property.customProps;
    const value = fieldProps.field.value;
    const initialValue = fieldProps.meta.initialValue;
    const error = getIn(fieldProps.form.errors, propertyKey);
    const touched = getIn(fieldProps.form.touched, propertyKey);

    const showError: boolean = error &&
        (fieldProps.form.submitCount > 0 || property.validation?.unique) &&
        (!Array.isArray(error) || !!error.filter((e: any) => !!e).length);

    const isSubmitting = fieldProps.form.isSubmitting;

    const cmsFieldProps: FieldProps<T, CustomProps, M> = {
        propertyKey,
        value: value as T,
        initialValue,
        setValue: (value: T | null) => {
            fieldProps.form.setFieldTouched(propertyKey, true, false);
            fieldProps.form.setFieldValue(propertyKey, value);
        },
        error,
        touched,
        showError,
        isSubmitting,
        includeDescription: includeDescription ?? true,
        property: property as ResolvedProperty<T>,
        disabled: disabled ?? false,
        underlyingValueHasChanged: underlyingValueHasChanged ?? false,
        tableMode: tableMode ?? false,
        partOfArray: partOfArray ?? false,
        autoFocus: autoFocus ?? false,
        customProps: customFieldProps,
        context,
        shouldAlwaysRerender: shouldAlwaysRerender ?? true
    };

    return (
        <ErrorBoundary>

            <Component {...cmsFieldProps}/>

            {underlyingValueHasChanged && !isSubmitting &&
                <FormHelperText>
                    This value has been updated elsewhere
                </FormHelperText>}

        </ErrorBoundary>);

}
