import React, { createElement } from "react";
import { deepEqual as equal } from "fast-equals"

import {
    ArrayProperty,
    EntityReference,
    EntityRelation,
    MapProperty,
    NumberProperty,
    Property,
    PropertyPreviewProps,
    StringProperty
} from "@firecms/types";

import { resolveProperty } from "@firecms/common";
import { useAuthController, useCustomizationController } from "../hooks";
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
import { RelationPreview } from "./components/RelationPreview";
import { UserPreview } from "./components/UserPreview";

/**
 * @group Preview components
 */
export const PropertyPreview = React.memo(function PropertyPreview<P extends Property>(props: PropertyPreviewProps<P>) {

    const authController = useAuthController();
    const customizationController = useCustomizationController();

    let content: React.ReactNode | any;
    const {
        property: inputProperty,
        propertyKey,
        value,
        size,
        height,
        width,
        interactive,
        fill
    } = props;

    const property = resolveProperty({
        propertyKey,
        property: inputProperty,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    });

    if (property === null) {
        content = <EmptyValue />;
    } else if (property.Preview) {
        content = createElement(property.Preview,
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
    } else if (value === undefined || value === null) {
        content = <EmptyValue />;
    } else if (property.type === "string") {
        const stringProperty = property as StringProperty;
        if (typeof value === "string") {
            if (stringProperty.storage) {
                const filePath = stringProperty.storage.previewUrl ? stringProperty.storage.previewUrl(value) : value;
                content = <StorageThumbnail
                    interactive={interactive}
                    storeUrl={property.storage?.storeUrl ?? false}
                    size={props.size}
                    fill={fill}
                    storagePathOrDownloadUrl={filePath} />;
            } else if (stringProperty.url) {
                if (typeof stringProperty.url === "boolean")
                    content =
                        <UrlComponentPreview size={props.size}
                            url={value}
                            fill={fill} />;
                else if (typeof stringProperty.url === "string")
                    content =
                        <UrlComponentPreview size={props.size}
                            url={value}
                            interactive={interactive}
                            fill={fill}
                            previewType={stringProperty.url} />;
            } else if (stringProperty.markdown) {
                content = <Markdown source={value} size={"small"} />;
            } else if (stringProperty.userSelect) {
                content = <UserPreview
                    value={value}
                    property={stringProperty}
                    propertyKey={propertyKey}
                    size={props.size}
                />;
            } else if (stringProperty.reference) {
                if (typeof stringProperty.reference.path === "string") {
                    content = <ReferencePreview
                        disabled={!stringProperty.reference.path}
                        previewProperties={stringProperty.reference.previewProperties}
                        includeId={stringProperty.reference.includeId}
                        includeEntityLink={stringProperty.reference.includeEntityLink}
                        size={props.size}
                        reference={new EntityReference({ id: value, path: stringProperty.reference.path })}
                    />;
                } else {
                    content = <EmptyValue />;
                }

            } else {
                content = <StringPropertyPreview {...props}
                    property={stringProperty}
                    value={value} />;
            }
        } else {
            content = buildWrongValueType(propertyKey, property.type, value);
        }
    } else if (property.type === "array") {
        if (Array.isArray(value)) {
            const arrayProperty = property as ArrayProperty;
            if (!arrayProperty.of && !arrayProperty.oneOf) {
                throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`);
            }

            if (arrayProperty.of) {
                if (Array.isArray(arrayProperty.of)) {
                    content = <ArrayPropertyPreview {...props}
                        value={value}
                        property={arrayProperty} />;
                } else if (arrayProperty.of.type === "reference") {
                    content = <ArrayOfReferencesPreview {...props}
                        value={value}
                        property={property} />;
                } else if (arrayProperty.of.type === "string") {
                    if (arrayProperty.of.enum) {
                        content = <ArrayPropertyEnumPreview
                            {...props}
                            value={value}
                            property={property} />;
                    } else if (arrayProperty.of.storage) {
                        content = <ArrayOfStorageComponentsPreview
                            {...props}
                            value={value}
                            property={property as ArrayProperty} />;
                    } else {
                        content = <ArrayOfStringsPreview
                            {...props}
                            property={property as ArrayProperty}
                            value={value as string[]} />;
                    }
                } else if (arrayProperty.of.type === "number" && arrayProperty.of.enum) {
                    content = <ArrayPropertyEnumPreview
                        {...props}
                        value={value as number[]}
                        property={property as ArrayProperty} />;
                } else {
                    content = <ArrayPropertyPreview {...props}
                        value={value}
                        property={property as ArrayProperty} />;
                }
            } else if (arrayProperty.oneOf) {
                content = <ArrayOneOfPreview {...props}
                    value={value}
                    property={property as ArrayProperty} />;
            }
        } else {
            content = buildWrongValueType(propertyKey, property.type, value);
        }
    } else if (property.type === "map") {
        if (typeof value === "object") {
            content =
                <MapPropertyPreview {...props}
                    value={value}
                    property={property as MapProperty} />;
        } else {
            content = buildWrongValueType(propertyKey, property.type, value);
        }
    } else if (property.type === "date") {
        if (value instanceof Date) {
            content = <DatePreview
                date={value}
                mode={property.mode}
            />;
        } else {
            content = buildWrongValueType(propertyKey, property.type, value);
        }
    } else if (property.type === "reference") {
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
                content = buildWrongValueType(propertyKey, property.type, value);
            }
        } else {
            content = <EmptyValue />;
        }

    } else if (property.type === "relation") {
        if (!value) {
            content = <EmptyValue />;
        }
        if (typeof value === "object" && "isEntityRelation" in value && value.isEntityRelation()) {
            content = <RelationPreview
                disabled={!property.relation}
                previewProperties={property.previewProperties}
                includeId={property.includeId}
                includeEntityLink={property.includeEntityLink}
                size={props.size}
                relation={value as EntityRelation}
            />;
        } else {
            content = buildWrongValueType(propertyKey, property.type, value);
        }

    } else if (property.type === "boolean") {
        if (typeof value === "boolean") {
            content = <BooleanPreview value={value} size={size} property={property} />;
        } else {
            content = buildWrongValueType(propertyKey, property.type, value);
        }
    } else if (property.type === "number") {
        if (typeof value === "number") {
            content = <NumberPropertyPreview {...props}
                value={value}
                property={property as NumberProperty} />;
        } else {
            content = buildWrongValueType(propertyKey, property.type, value);
        }
    } else {
        content = JSON.stringify(value);
    }

    return content === undefined || content === null || (Array.isArray(content) && content.length === 0)
        ? <EmptyValue />
        : content;
}, equal);

function buildWrongValueType(name: string | undefined, type: string, value: any) {
    console.warn(`Unexpected value for property ${name}, of type ${type}`, value);
    return (
        <ErrorView title={"Unexpected value"}
            error={`${JSON.stringify(value)}`} />
    );
}
