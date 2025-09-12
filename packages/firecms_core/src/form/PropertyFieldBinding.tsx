import React, { ComponentType, ReactElement, useCallback, useRef } from "react";
import equal from "react-fast-compare"

import { Field, FieldProps as FormexFieldProps, getIn } from "@firecms/formex";

import {
    FieldProps,
    FireCMSPlugin,
    PluginFieldBuilderParams,
    Property,
    PropertyFieldBindingProps,
    ResolvedEntityCollection,
    ResolvedProperty
} from "@firecms/types";
import { ReadOnlyFieldBinding } from "./field_bindings/ReadOnlyFieldBinding";

import { isHidden, isPropertyBuilder, isReadOnly } from "@firecms/common";
import { useAuthController, useCustomizationController } from "../hooks";
import { Typography } from "@firecms/ui";
import { getFieldConfig, getFieldId } from "../core";
import { ErrorBoundary } from "../components";
import { resolveProperty } from "../util";

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
 * @group Form custom fields
 */
export const PropertyFieldBinding = React.memo(PropertyFieldBindingInternal, (a: PropertyFieldBindingProps<any>, b: PropertyFieldBindingProps<any>) => {
    if (a.propertyKey !== b.propertyKey) {
        return false;
    }
    if (a.index !== b.index) {
        return false;
    }

    if (a.size !== b.size) {
        return false;
    }
    const aIsBuilder = isPropertyBuilder(a.property);
    const bIsBuilder = isPropertyBuilder(b.property);

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

function PropertyFieldBindingInternal<M extends Record<string, any> = any>
({
     propertyKey,
     property,
     context,
     includeDescription,
     underlyingValueHasChanged,
     disabled: disabledProp,
     partOfArray,
     minimalistView,
     autoFocus,
     index,
     size,
     onPropertyChange,
 }: PropertyFieldBindingProps<M>): ReactElement<PropertyFieldBindingProps<M>> {

    const authController = useAuthController();
    const customizationController = useCustomizationController();

    return (
        <Field
            key={propertyKey}
            name={propertyKey}
        >
            {(fieldProps) => {

                let Component: ComponentType<FieldProps> | undefined;
                const resolvedProperty: ResolvedProperty | null = resolveProperty({
                    propertyKey,
                    property: property,
                    values: fieldProps.form.values,
                    path: context.path,
                    entityId: context.entityId,
                    propertyConfigs: customizationController.propertyConfigs,
                    index,
                    authController
                });

                const readOnly = isReadOnly(resolvedProperty);
                const disabled = disabledProp || readOnly || Boolean(resolvedProperty?.disabled) || context.disabled;

                if (resolvedProperty === null || isHidden(resolvedProperty)) {
                    return <></>;
                } else if (readOnly) {
                    Component = ReadOnlyFieldBinding;
                } else if (resolvedProperty.Field) {
                    if (typeof resolvedProperty.Field === "function") {
                        Component = resolvedProperty.Field as ComponentType<FieldProps<any>>;
                    }
                } else {
                    const propertyConfig = getFieldConfig(resolvedProperty, customizationController.propertyConfigs);
                    if (!propertyConfig) {
                        console.log("INTERNAL: Could not find field config for property", {
                            propertyKey,
                            property,
                            resolvedProperty,
                            fields: customizationController.propertyConfigs,
                            propertyConfig
                        });
                        throw new Error(`INTERNAL: Could not find field config for property ${propertyKey}`);
                    }
                    const configProperty = resolveProperty({
                        propertyKey,
                        property: propertyConfig.property,
                        values: fieldProps.form.values,
                        path: context.path,
                        entityId: context.entityId,
                        propertyConfigs: customizationController.propertyConfigs,
                        index,
                        authController
                    });
                    Component = configProperty.Field as ComponentType<FieldProps>;
                }
                if (!Component) {
                    console.warn(`No field component found for property ${propertyKey}`);
                    console.warn("Property:", property);
                    return (
                        <div className={"w-full"}>
                            {`Currently the field ${resolvedProperty.type} is not supported`}
                        </div>
                    );
                }

                const componentProps: ResolvedPropertyFieldBindingProps<M> = {
                    propertyKey,
                    property: resolvedProperty,
                    includeDescription,
                    underlyingValueHasChanged,
                    context,
                    disabled,
                    partOfArray,
                    minimalistView,
                    autoFocus,
                    size,
                    onPropertyChange
                };

                return <FieldInternal
                    Component={Component as ComponentType<FieldProps>}
                    componentProps={componentProps}
                    formexFieldProps={fieldProps}/>;
            }}
        </Field>
    );

}

type ResolvedPropertyFieldBindingProps< M extends Record<string, any> = any> =
    Omit<PropertyFieldBindingProps<M>, "property">
    & {
    property: ResolvedProperty
};

function FieldInternal<CustomProps, M extends Record<string, any>>
({
     Component,
     componentProps: {
         propertyKey,
         property,
         includeDescription,
         underlyingValueHasChanged,
         partOfArray,
         minimalistView,
         autoFocus,
         context,
         disabled,
         size,
         onPropertyChange
     },
     formexFieldProps
 }:
 {
     Component: ComponentType<FieldProps>,
     componentProps: ResolvedPropertyFieldBindingProps< M>,
     formexFieldProps: FormexFieldProps<any, any>
 }) {

    const { plugins } = useCustomizationController();

    const customFieldProps: any = property.customProps;
    const value = formexFieldProps.field.value;
    const error = getIn(formexFieldProps.form.errors, propertyKey);
    const touched = getIn(formexFieldProps.form.touched, propertyKey);

    const showError: boolean = error &&
        (formexFieldProps.form.submitCount > 0 || property.validation?.unique) &&
        (!Array.isArray(error) || !!error.filter((e: any) => !!e).length);

    const WrappedComponent: ComponentType<FieldProps<any, any, M>> | null = useWrappedComponent({
        path: context.path,
        collection: context.collection,
        propertyKey: propertyKey,
        property: property,
        Component: Component,
        plugins: plugins
    });
    const UsedComponent: ComponentType<FieldProps> = WrappedComponent ?? Component;

    const isSubmitting = formexFieldProps.form.isSubmitting;

    const setValue = useCallback((value: any | null, shouldValidate?: boolean) => {
        formexFieldProps.form.setFieldTouched(propertyKey, true, false);
        formexFieldProps.form.setFieldValue(propertyKey, value, shouldValidate);
    }, []);

    const setFieldValue = useCallback((otherPropertyKey: string, value: any | null, shouldValidate?: boolean) => {
        formexFieldProps.form.setFieldTouched(propertyKey, true, false);
        formexFieldProps.form.setFieldValue(otherPropertyKey, value, shouldValidate);
    }, []);

    const cmsFieldProps: FieldProps<any, CustomProps, M> = {
        propertyKey,
        value,
        setValue,
        setFieldValue,
        error,
        touched,
        showError,
        isSubmitting,
        includeDescription: includeDescription ?? true,
        property: property as ResolvedProperty,
        disabled: disabled ?? false,
        underlyingValueHasChanged: underlyingValueHasChanged ?? false,
        partOfArray: partOfArray ?? false,
        minimalistView: minimalistView ?? false,
        autoFocus: autoFocus ?? false,
        customProps: customFieldProps,
        context,
        size,
        onPropertyChange
    };

    return (
        <ErrorBoundary>

            <UsedComponent {...cmsFieldProps}/>

            {underlyingValueHasChanged && !isSubmitting &&
                <Typography variant={"caption"} className={"ml-3.5"}>
                    This value has been updated elsewhere
                </Typography>}

        </ErrorBoundary>);

}

const shouldPropertyReRender = (property: Property | ResolvedProperty, plugins?: FireCMSPlugin[]): boolean => {
    if (plugins?.some((plugin) => plugin.form?.fieldBuilder)) {
        return true;
    }
    if (isPropertyBuilder(property)) {
        return true;
    }
    const defAProperty = property as Property | ResolvedProperty;
    const rerenderThisProperty = Boolean(defAProperty.Field) || ("fromBuilder" in defAProperty && defAProperty.fromBuilder);
    if (defAProperty.type === "map" && defAProperty.properties) {
        return rerenderThisProperty || Object.values(defAProperty.properties).some((childProperty) => shouldPropertyReRender(childProperty, plugins));
    } else if (defAProperty.type === "array" && "resolvedProperties" in defAProperty) {
        // @ts-ignore
        return rerenderThisProperty || defAProperty.resolvedProperties?.some((childProperty) => childProperty && shouldPropertyReRender(childProperty, plugins));
    } else {
        return rerenderThisProperty;
    }
}

interface UseWrappedComponentParams< M extends Record<string, any> = any> {
    path?: string,
    collection?: ResolvedEntityCollection<M>,
    propertyKey: string,
    property: ResolvedProperty,
    Component: ComponentType<FieldProps<any, any, M>>,
    plugins?: FireCMSPlugin[]
}

function useWrappedComponent<T, M extends Record<string, any> = any>(
    {
        path,
        collection,
        propertyKey,
        property,
        Component,
        plugins
    }: UseWrappedComponentParams< M>
): ComponentType<FieldProps<any, any, M>> | null {

    const wrapperRef = useRef<ComponentType<FieldProps<any, any, M>> | null>((() => {
        let Wrapper: ComponentType<FieldProps<any, any, M>> | null = null;
        if (plugins) {
            plugins.forEach((plugin) => {
                const fieldId = getFieldId(property);
                if (fieldId && plugin.form?.fieldBuilder) {
                    const params: PluginFieldBuilderParams = {
                        fieldConfigId: fieldId,
                        propertyKey,
                        property,
                        Field: Component,
                        plugin,
                        path,
                        collection,
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
