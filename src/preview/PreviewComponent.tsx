import React, { createElement } from "react";
import { ArrayProperty, CMSType, EntityReference } from "../models";

import {
    ArrayOfMapsPreview,
    ArrayOfReferencesPreview,
    ArrayOfStorageComponentsPreview,
    ArrayOfStringsPreview,
    ArrayOneOfPreview,
    ArrayPreview,
    ArrayPropertyEnumPreview,
    BooleanPreview,
    EmptyValue,
    MapPreview,
    NumberPreview,
    ReferencePreview,
    StorageThumbnail,
    StringPreview,
    TimestampPreview,
    UrlComponentPreview
} from "./internal";
import { ErrorView } from "../core/components";

import { PreviewComponentProps } from "./PreviewComponentProps";

import { Markdown } from "./components/Markdown";

/**
 * @category Preview components
 */
export function PreviewComponent<T extends CMSType>(props: PreviewComponentProps<T>) {
    return <MemoPreviewComponent {...props} />;
}

export function PreviewComponentInternal<T extends CMSType>(props: PreviewComponentProps<T>) {
    let content: JSX.Element | any;
    const {
        property, name, value, size, height, width
    } = props;

    const fieldProps = { ...props };

    if (value === undefined) {
        content = <EmptyValue/>;
    } else if (property.config?.Preview) {
        content = createElement(property.config.Preview as React.ComponentType<PreviewComponentProps>,
            {
                name,
                value,
                property,
                size,
                height,
                width,
                customProps: property.config.customProps
            });
    } else if (value === null) {
        content = <EmptyValue/>;
    } else if (property.dataType === "string") {
        if (typeof value === "string") {
            if (property.config?.url) {
                content = <UrlComponentPreview {...fieldProps}
                                               property={property}
                                               value={value}/>;
            } else if (property.config?.storageMeta) {
                content = <StorageThumbnail {...fieldProps}
                                            property={property}
                                            value={value}/>;
            } else if (property.config?.markdown) {
                content = <Markdown source={value}/>;
            } else {
                content = <StringPreview {...fieldProps}
                                         property={property}
                                         value={value}/>;
            }
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "array") {
        if (value instanceof Array) {
            if (!property.of && !property.oneOf) {
                throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${name}`);
            }

            if (property.of) {
                if (property.of.dataType === "map") {
                    content =
                        <ArrayOfMapsPreview name={name}
                                            property={property as ArrayProperty}
                                            value={value as object[]}
                                            size={size}
                        />;
                } else if (property.of.dataType === "reference") {
                    content = <ArrayOfReferencesPreview {...fieldProps}
                                                        value={value}
                                                        property={property}/>;
                } else if (property.of.dataType === "string") {
                    if (property.of.config?.enumValues) {
                        content = <ArrayPropertyEnumPreview
                            {...fieldProps}
                            value={value as string[]}
                            property={property as ArrayProperty}/>;
                    } else if (property.of.config?.storageMeta) {
                        content = <ArrayOfStorageComponentsPreview
                            {...fieldProps}
                            value={value}
                            property={property}/>;
                    } else {
                        content = <ArrayOfStringsPreview
                            {...fieldProps}
                            value={value as string[]}
                            property={property as ArrayProperty}/>;
                    }
                } else if (property.of.dataType === "number") {
                    if (property.of.config?.enumValues) {
                        content = <ArrayPropertyEnumPreview
                            {...fieldProps}
                            value={value as string[]}
                            property={property as ArrayProperty}/>;
                    }
                } else {
                    content = <ArrayPreview {...fieldProps}
                                            value={value}
                                            property={property}/>;
                }
            } else if (property.oneOf) {
                content = <ArrayOneOfPreview {...fieldProps}
                                             value={value}
                                             property={property}/>;
            }
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "map") {
        if (typeof value === "object") {
            content =
                <MapPreview {...fieldProps}
                            property={property}/>;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "timestamp") {
        if (value instanceof Date) {
            content = <TimestampPreview {...fieldProps}
                                        value={value}
                                        property={property}/>;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "reference") {
        if (value instanceof EntityReference) {
            content = <ReferencePreview
                {...fieldProps}
                value={value as EntityReference}
                property={property}
            />;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "boolean") {
        if (typeof value === "boolean") {
            content = <BooleanPreview {...fieldProps}
                                      value={value}
                                      property={property}/>;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else if (property.dataType === "number") {
        if (typeof value === "number") {
            content = <NumberPreview {...fieldProps}
                                     value={value}
                                     property={property}/>;
        } else {
            content = buildWrongValueType(name, property.dataType, value);
        }
    } else {
        content = JSON.stringify(value);
    }

    return content === undefined || content === null ? <EmptyValue/> : content;
}

function buildWrongValueType(name: string | undefined, dataType: string, value: any) {
    console.error(`Unexpected value for property ${name}, of type ${dataType}`, value);
    return (
        <ErrorView error={`Unexpected value: ${JSON.stringify(value)}`}/>
    );
}

const MemoPreviewComponent = React.memo<PreviewComponentProps<any>>(PreviewComponentInternal) as React.FunctionComponent<PreviewComponentProps<any>>;

