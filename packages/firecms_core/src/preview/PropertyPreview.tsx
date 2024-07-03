import React, { createElement } from "react";
import equal from "react-fast-compare"

import {
    CMSType,
    EntityReference,
    ResolvedArrayProperty,
    ResolvedMapProperty,
    ResolvedNumberProperty,
    ResolvedStringProperty
} from "../types";

import { resolveProperty } from "../util";

import { PropertyPreviewProps } from "./PropertyPreviewProps";
import { useCustomizationController } from "../hooks";
import { EmptyValue } from "./components/EmptyValue";
import { UrlComponentPreview } from "./components/UrlComponentPreview";
import { StorageThumbnail } from "./components/StorageThumbnail";
import { Markdown } from "@firecms/ui";
import { StringPropertyPreview } from "./property_previews/StringPropertyPreview";
import { ArrayPropertyPreview } from "./property_previews/ArrayPropertyPreview";
import { ArrayOfReferencesPreview } from "./property_previews/ArrayOfReferencesPreview";
import { ArrayOfStorageComponentsPreview } from "./property_previews/ArrayOfStorageComponentsPreview";
import { ArrayPropertyEnumPreview } from "./property_previews/ArrayPropertyEnumPreview";
import { ArrayOfStringsPreview } from "./property_previews/ArrayOfStringsPreview";
import { ArrayOneOfPreview } from "./property_previews/ArrayOneOfPreview";
import { MapPropertyPreview } from "./property_previews/MapPropertyPreview";
import { ReferencePreview } from "./components/ReferencePreview";
import { DatePreview } from "./components/DatePreview";
import { BooleanPreview } from "./components/BooleanPreview";
import { NumberPropertyPreview } from "./property_previews/NumberPropertyPreview";
import { ErrorView } from "../components";

/**
 * @group Preview components
 */
export const PropertyPreview = React.memo(function PropertyPreview<T extends CMSType>(props: PropertyPreviewProps<T>) {

    const customizationController = useCustomizationController();

    let content: React.ReactNode | any;
    const {
        property: inputProperty,
        propertyKey,
        value,
        size,
        height,
        width,
        interactive
    } = props;

    const property = resolveProperty({
        propertyKey,
        propertyOrBuilder: inputProperty,
        fields: customizationController.propertyConfigs
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
                // entity,
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
                                             interactive={interactive}
                                             previewType={stringProperty.url}/>;
            } else if (stringProperty.storage) {
                content = <StorageThumbnail
                    interactive={interactive}
                    storeUrl={property.storage?.storeUrl ?? false}
                    size={props.size}
                    storagePathOrDownloadUrl={value}/>;
            } else if (stringProperty.markdown) {
                content = <Markdown source={value} size={"small"}/>;
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
                } else if (arrayProperty.of.dataType === "reference") {
                    content = <ArrayOfReferencesPreview {...props}
                                                        value={value}
                                                        property={property as ResolvedArrayProperty}/>;
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
            if (typeof value === "object" && "isEntityReference" in value && value.isEntityReference()) {
                content = <ReferencePreview
                    disabled={!property.path}
                    previewProperties={property.previewProperties}
                    includeId={property.includeId}
                    includeEntityLink={property.includeEntityLink}
                    size={props.size}
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
            content = <BooleanPreview value={value} size={size} property={property}/>;
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

    return content === undefined || content === null || (Array.isArray(content) && content.length === 0)
        ? <EmptyValue/>
        : content;
}, equal);

function buildWrongValueType(name: string | undefined, dataType: string, value: any) {
    console.warn(`Unexpected value for property ${name}, of type ${dataType}`, value);
    return (
        <ErrorView title={"Unexpected value"}
                   error={`${JSON.stringify(value)}`}/>
    );
}
