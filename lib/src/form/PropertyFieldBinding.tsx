import React, { ComponentType, ReactElement, useMemo } from "react";
import equal from "react-fast-compare"

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
    FireCMSPlugin,
    PluginFieldBuilderParams,
    PropertyFieldBindingProps,
    ResolvedProperty
} from "../types";
import { ReadOnlyFieldBinding } from "./field_bindings/ReadOnlyFieldBinding";

import {
    ErrorBoundary,
    getFieldConfig,
    getFieldId,
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
 * @param propertyKey You can use nested names such as `address.street` or `friends[2]`
 * @param property
 * @param context
 * @param includeDescription
 * @param underlyingValueHasChanged
 * @param disabled
 * @param tableMode
 * @param partOfArray
 * @param autoFocus
 * @category Form custom fields
 */
// export const PropertyFieldBinding = PropertyFieldBindingInternal;
export const PropertyFieldBinding = React.memo(PropertyFieldBindingInternal, (a: PropertyFieldBindingProps<any>, b: PropertyFieldBindingProps<any>) => {
    return equal(a.context.values, b.context.values) &&
        ((typeof a.property === "function" && typeof b.property === "function") || equal(a.property, b.property)) &&
        a.disabled === b.disabled
}) as typeof PropertyFieldBindingInternal;

function PropertyFieldBindingInternal<T extends CMSType = CMSType, CustomProps = any, M extends Record<string, any> = Record<string, any>>
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
     context: {
         values,
         path,
         entityId
     }
 }: PropertyFieldBindingProps<any, M>): ReactElement<PropertyFieldBindingProps<T, M>> {

    const fireCMSContext = useFireCMSContext();

    let component: ComponentType<FieldProps<T>> | undefined;
    const resolvedProperty: ResolvedProperty<T> | null = resolveProperty({
        propertyKey,
        propertyValue: getIn(values, propertyKey),
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
            component = resolvedProperty.Field as ComponentType<FieldProps<any>>;
        }
    } else {
        const fieldConfig = getFieldConfig(resolvedProperty);
        if (!fieldConfig) {
            throw new Error(`INTERNAL: Could not find field config for property ${propertyKey}`);
        }
        component = fieldConfig.Field as ComponentType<FieldProps<T>>;

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
            autoFocus
        };

        const shouldAlwaysRerender = shouldPropertyReRender(property, fireCMSContext.plugins);
        // we use the standard Field for user defined fields, since it rebuilds
        // when there are changes in other values, in contrast to FastField
        const FieldComponent = shouldAlwaysRerender || resolvedProperty.Field ? Field : FastField;
        // const FieldComponent = Field;

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
         disabled
     },
     fieldProps
 }:
     {
         Component: ComponentType<FieldProps<T, any, M>>,
         componentProps: PropertyFieldBindingProps<T, M>,
         fieldProps: FormikFieldProps<T>
     }) {

    const { plugins } = useFireCMSContext();
    const UsedComponent: ComponentType<FieldProps<T, any, M>> =
        useMemo(() => {
            let _UsedComponent: ComponentType<FieldProps<T, any, M>> = Component;
            if (plugins) {
                plugins.forEach(plugin => {
                    const fieldId = getFieldId(property);
                    if (fieldId && plugin.form?.fieldBuilder) {
                        const props: PluginFieldBuilderParams<T> = {
                            fieldConfigId: fieldId,
                            dataType: property.dataType as T,
                            property,
                            Field: _UsedComponent
                        };
                        const fieldBuilder = plugin.form.fieldBuilder<T>(props);
                        if (fieldBuilder) {
                            _UsedComponent = fieldBuilder(props) || _UsedComponent;
                        }
                    }
                    if (!fieldId) {
                        console.warn("INTERNAL: Field id not found for property", property);
                    }
                });
            }
            return _UsedComponent;
        }, [plugins]);

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
        setValue: (value: T | null, shouldValidate?: boolean) => {
            fieldProps.form.setFieldTouched(propertyKey, true, false);
            fieldProps.form.setFieldValue(propertyKey, value, shouldValidate);
        },
        setFieldValue: (otherPropertyKey: string, value: CMSType | null, shouldValidate?: boolean) => {
            fieldProps.form.setFieldTouched(propertyKey, true, false);
            fieldProps.form.setFieldValue(otherPropertyKey, value, shouldValidate);
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
        context
    };

    return (
        <ErrorBoundary>

            <UsedComponent key={propertyKey} {...cmsFieldProps}/>

            {underlyingValueHasChanged && !isSubmitting &&
                <FormHelperText>
                    This value has been updated elsewhere
                </FormHelperText>}

        </ErrorBoundary>);

}

const shouldPropertyReRender = (property: ResolvedProperty, plugins?: FireCMSPlugin[]): boolean => {
    if (plugins?.some((plugin) => plugin.form?.fieldBuilder)) {
        return true;
    }
    const rerenderThisProperty = Boolean(property.Field) || property.fromBuilder;
    if (property.dataType === "map" && property.properties) {
        return rerenderThisProperty || Object.values(property.properties).some((childProperty) => shouldPropertyReRender(childProperty, plugins));
    } else if (property.dataType === "array" && Array.isArray(property.resolvedProperties)) {
        return rerenderThisProperty || property.resolvedProperties.some((childProperty) => childProperty && shouldPropertyReRender(childProperty, plugins));
    } else {
        return rerenderThisProperty;
    }
}
