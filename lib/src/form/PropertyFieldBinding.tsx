import React, { ComponentType, ReactElement, useRef } from "react";
import equal from "react-fast-compare"

import { FormHelperText } from "@mui/material";

import {
    FastField,
    Field,
    FieldProps as FormikFieldProps,
    getIn
} from "formik";

import {
    CMSType, EntityCollection,
    FieldProps,
    FireCMSPlugin,
    PluginFieldBuilderParams,
    Property,
    PropertyFieldBindingProps,
    PropertyOrBuilder,
    ResolvedProperty
} from "../types";
import { ReadOnlyFieldBinding } from "./field_bindings/ReadOnlyFieldBinding";

import {
    ErrorBoundary,
    getFieldConfig,
    getFieldId,
    isHidden,
    isPropertyBuilder,
    isReadOnly,
    resolveProperty
} from "../core";
import { useFireCMSContext } from "../hooks";
import path from "path";

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

    const aIsBuilder = isPropertyBuilder(a.property) || a.property.fromBuilder;
    const bIsBuilder = isPropertyBuilder(b.property) || b.property.fromBuilder;

    const baseCheck = (aIsBuilder === bIsBuilder || equal(a.property, b.property)) &&
        a.disabled === b.disabled;
    if (!baseCheck) {
        return false;
    }

    if (shouldPropertyReRender(b.property)) {
        return false;
    }

    return false;
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
         collection,
         path,
         entityId
     }
 }: PropertyFieldBindingProps<T, M>): ReactElement<PropertyFieldBindingProps<T, M>> {

    const fireCMSContext = useFireCMSContext();

    const shouldAlwaysRerender = shouldPropertyReRender(property, fireCMSContext.plugins);
    // console.log("shouldAlwaysRerender", shouldAlwaysRerender, propertyKey)
    // we use the standard Field for user defined fields, since it rebuilds
    // when there are changes in other values, in contrast to FastField
    const FieldComponent = shouldAlwaysRerender ? Field : FastField;

    return (
        <FieldComponent
            // required={property.validation?.required}
            name={propertyKey}
        >
            {(fieldProps: FormikFieldProps<T>) => {

                let Component: ComponentType<FieldProps<T>> | undefined;
                const resolvedProperty: ResolvedProperty<T> | null = resolveProperty({
                    propertyKey,
                    propertyValue: fieldProps.field.value,
                    propertyOrBuilder: property,
                    values: fieldProps.form.values,
                    path: context.path,
                    entityId: context.entityId,
                    fields: fireCMSContext.fields
                });

                if (resolvedProperty === null || isHidden(resolvedProperty)) {
                    return <></>;
                } else if (isReadOnly(resolvedProperty)) {
                    Component = ReadOnlyFieldBinding;
                } else if (resolvedProperty.Field) {
                    if (typeof resolvedProperty.Field === "function") {
                        Component = resolvedProperty.Field as ComponentType<FieldProps<any>>;
                    }
                } else {
                    const fieldConfig = getFieldConfig(resolvedProperty);
                    if (!fieldConfig) {
                        throw new Error(`INTERNAL: Could not find field config for property ${propertyKey}`);
                    }
                    Component = fieldConfig.Field as ComponentType<FieldProps<T>>;

                }
                if (!Component) {
                    return (
                        <div>{`Currently the field ${resolvedProperty.dataType} is not supported`}</div>
                    );
                    // return null;
                }

                const componentProps: ResolvedPropertyFieldBindingProps<T, M> = {
                    propertyKey,
                    property: resolvedProperty,
                    includeDescription,
                    underlyingValueHasChanged,
                    context,
                    disabled,
                    tableMode,
                    partOfArray,
                    autoFocus
                };

                return <FieldInternal
                    Component={Component as ComponentType<FieldProps>}
                    componentProps={componentProps}
                    fieldProps={fieldProps}/>;
            }}
        </FieldComponent>
    );

}


type ResolvedPropertyFieldBindingProps<T extends CMSType = CMSType, M extends Record<string, any> = Record<string, any>> =
    Omit<PropertyFieldBindingProps<T, M>, "property">
    & {
    property: ResolvedProperty<T>
};

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
         componentProps: ResolvedPropertyFieldBindingProps<T, M>,
         fieldProps: FormikFieldProps<T>
     }) {

    const { plugins } = useFireCMSContext();

    const customFieldProps: any = property.customProps;
    const value = fieldProps.field.value;
    const initialValue = fieldProps.meta.initialValue;
    const error = getIn(fieldProps.form.errors, propertyKey);
    const touched = getIn(fieldProps.form.touched, propertyKey);

    const showError: boolean = error &&
        (fieldProps.form.submitCount > 0 || property.validation?.unique) &&
        (!Array.isArray(error) || !!error.filter((e: any) => !!e).length);

    const WrappedComponent: ComponentType<FieldProps<T, any, M>> | null = useWrappedComponent(context.path, context.collection, propertyKey, property, Component, plugins);
    const UsedComponent: ComponentType<FieldProps<T>> = WrappedComponent ?? Component;
    // const UsedComponent: ComponentType<FieldProps<T>> = Component;

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

            <UsedComponent {...cmsFieldProps}/>

            {underlyingValueHasChanged && !isSubmitting &&
                <FormHelperText>
                    This value has been updated elsewhere
                </FormHelperText>}

        </ErrorBoundary>);

}

const shouldPropertyReRender = (property: PropertyOrBuilder | ResolvedProperty, plugins?: FireCMSPlugin[]): boolean => {
    if (plugins?.some((plugin) => plugin.form?.fieldBuilder)) {
        return true;
    }
    if (isPropertyBuilder(property)) {
        return true;
    }
    const defAProperty = property as Property | ResolvedProperty;
    const rerenderThisProperty = Boolean(defAProperty.Field) || ("fromBuilder" in defAProperty && defAProperty.fromBuilder);
    if (defAProperty.dataType === "map" && defAProperty.properties) {
        return rerenderThisProperty || Object.values(defAProperty.properties).some((childProperty) => shouldPropertyReRender(childProperty, plugins));
    } else if (defAProperty.dataType === "array" && "resolvedProperties" in defAProperty) {
        // @ts-ignore
        return rerenderThisProperty || defAProperty.resolvedProperties?.some((childProperty) => childProperty && shouldPropertyReRender(childProperty, plugins));
    } else {
        return rerenderThisProperty;
    }
}

function useWrappedComponent<T extends CMSType = CMSType, M extends Record<string, any> = any>(
    path: string,
    collection: EntityCollection<M>,
    propertyKey: string,
    property: ResolvedProperty<T>,
    Component: ComponentType<FieldProps<T, any, M>>,
    plugins?: FireCMSPlugin[]
): ComponentType<FieldProps<T, any, M>> | null {

    const wrapperRef = useRef<ComponentType<FieldProps<T, any, M>> | null>((() => {
        let Wrapper: ComponentType<FieldProps<T, any, M>> | null = null;
        if (plugins) {
            plugins.forEach((plugin) => {
                const fieldId = getFieldId(property);
                if (fieldId && plugin.form?.fieldBuilder) {
                    const params: PluginFieldBuilderParams<T> = {
                        fieldConfigId: fieldId,
                        propertyKey,
                        property,
                        Field: Component,
                        plugin,
                        path,
                        collection
                    };
                    const enabled = plugin.form?.fieldBuilderEnabled?.(params);
                    if (enabled === undefined || enabled)
                        Wrapper = plugin.form.fieldBuilder(params) || Wrapper;
                }
                if (!fieldId) {
                    console.warn("INTERNAL: Field id not found for property", property);
                }
            });
        }
        return Wrapper;
    })());

    return wrapperRef.current;
}
