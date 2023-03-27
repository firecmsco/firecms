import React, { createElement } from "react";
import {
    CMSType,
    EntityReference,
    ResolvedArrayProperty,
    ResolvedMapProperty,
    ResolvedNumberProperty,
    ResolvedStringProperty
} from "../types";

import {
    ArrayOfMapsPreview,
    ArrayOfReferencesPreview,
    ArrayOfStorageComponentsPreview,
    ArrayOfStringsPreview,
    ArrayOneOfPreview,
    ArrayPropertyEnumPreview,
    ArrayPropertyPreview,
    BooleanPreview,
    DatePreview,
    EmptyValue,
    MapPropertyPreview,
    Markdown,
    NumberPropertyPreview,
    ReferencePreview,
    StorageThumbnail,
    StringPropertyPreview,
    UrlComponentPreview
} from "./index";
import { ErrorView, resolveProperty } from "../core";

import { PropertyPreviewProps } from "./PropertyPreviewProps";
import { useFireCMSContext } from "../hooks";

/**
 * @category Preview components
 */
export function PropertyPreview<T extends CMSType>(props: PropertyPreviewProps<T>) {

    const fireCMSContext = useFireCMSContext();
    let content: React.ReactNode | any;
    const {
        property: inputProperty,
        propertyKey,
        value,
        size,
        height,
        width,
        entity
    } = props;

    const property = resolveProperty({
        propertyKey,
        propertyOrBuilder: inputProperty,
        propertyValue: value,
        fields: fireCMSContext.fields
    });

    if (value === undefined || property === null) {
        content = <EmptyValue/>;
    } else if (property.Preview) {
        content = createElement(property.Preview as React.ComponentType<PropertyPreviewProps>,
            {
                propertyKey,
                value,
                property,
                size,
                height,
                width,
                entity,
                customProps: property.customProps
            });
    } else if (value === null) {
        content = <EmptyValue/>;
    } else if (property.dataType === "string") {
        const stringProperty = property as ResolvedStringProperty;
        if (typeof value === "string") {
            if (stringProperty.url) {
                if (typeof stringProperty.url === "boolean")
                    content =
                        <UrlComponentPreview size={props.size}
                                             url={value}/>;
                else if (typeof stringProperty.url === "string")
                    content =
                        <UrlComponentPreview size={props.size}
                                             url={value}
                                             previewType={stringProperty.url}/>;
            } else if (stringProperty.storage) {
                content = <StorageThumbnail
                    storeUrl={property.storage?.storeUrl ?? false}
                    size={props.size}
                    storagePathOrDownloadUrl={value}/>;
            } else if (stringProperty.markdown) {
                content = <Markdown source={value}/>;
            } else {
                content = <StringPropertyPreview {...props}
                                                 property={stringProperty}
                                                 value={value}/>;
            }
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "array") {
        if (value instanceof Array) {
            const arrayProperty = property as ResolvedArrayProperty;
            if (!arrayProperty.of && !arrayProperty.oneOf) {
                throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`);
            }

            if (arrayProperty.of) {
                if (Array.isArray(arrayProperty.of)) {
                    content = <ArrayPropertyPreview {...props}
                                                    value={value}
                                                    property={property as ResolvedArrayProperty}/>;
                } else if (arrayProperty.of.dataType === "map") {
                    content =
                        <ArrayOfMapsPreview propertyKey={propertyKey}
                                            property={property as ResolvedArrayProperty}
                                            value={value as Record<string, any>[]} // This might be wrong
                                            entity={entity}
                                            size={size}
                        />;
                } else if (arrayProperty.of.dataType === "reference") {
                    if (typeof arrayProperty.of.path === "string") {
                        content = <ArrayOfReferencesPreview {...props}
                                                            value={value}
                                                            property={property as ResolvedArrayProperty}/>;
                    } else {
                        content = <EmptyValue/>;
                    }
                } else if (arrayProperty.of.dataType === "string") {
                    if (arrayProperty.of.enumValues) {
                        content = <ArrayPropertyEnumPreview
                            {...props}
                            value={value as string[]}
                            property={property as ResolvedArrayProperty}/>;
                    } else if (arrayProperty.of.storage) {
                        content = <ArrayOfStorageComponentsPreview
                            {...props}
                            value={value}
                            property={property as ResolvedArrayProperty}/>;
                    } else {
                        content = <ArrayOfStringsPreview
                            {...props}
                            value={value as string[]}
                            property={property as ResolvedArrayProperty}/>;
                    }
                } else if (arrayProperty.of.dataType === "number" && arrayProperty.of.enumValues) {
                    content = <ArrayPropertyEnumPreview
                        {...props}
                        value={value as string[]}
                        property={property as ResolvedArrayProperty}/>;
                } else {
                    content = <ArrayPropertyPreview {...props}
                                                    value={value}
                                                    property={property as ResolvedArrayProperty}/>;
                }
            } else if (arrayProperty.oneOf) {
                content = <ArrayOneOfPreview {...props}
                                             value={value}
                                             property={property as ResolvedArrayProperty}/>;
            }
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "map") {
        if (typeof value === "object") {
            content =
                <MapPropertyPreview {...props}
                                    property={property as ResolvedMapProperty}/>;
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "date") {
        if (value instanceof Date) {
            content = <DatePreview date={value}/>;
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "reference") {
        if (typeof property.path === "string") {
            if (value instanceof EntityReference) {
                content = <ReferencePreview
                    disabled={!property.path}
                    previewProperties={property.previewProperties}
                    size={props.size}
                    onClick={props.onClick}
                    reference={value as EntityReference}
                />;
            } else {
                content = buildWrongValueType(propertyKey, property.dataType, value);
            }
        } else {
            content = <EmptyValue/>;
        }

    } else if (property.dataType === "boolean") {
        if (typeof value === "boolean") {
            content = <BooleanPreview value={value}/>;
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "number") {
        if (typeof value === "number") {
            content = <NumberPropertyPreview {...props}
                                             value={value}
                                             property={property as ResolvedNumberProperty}/>;
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else {
        content = JSON.stringify(value);
    }

    return content === undefined || content === null ? <EmptyValue/> : content;
}

function buildWrongValueType(name: string | undefined, dataType: string, value: any) {
    console.error(`Unexpected value for property ${name}, of type ${dataType}`, value);
    return (
        <ErrorView title={"Unexpected value"}
                   error={`${JSON.stringify(value)}`}/>
    );
}
