import {
    ArrayProperty,
    BooleanProperty,
    MapProperty,
    NumberProperty,
    ReferenceProperty,
    StringProperty,
    TimestampProperty
} from "../models";
import React, { createElement } from "react";
import StorageThumbnail from "./StorageThumbnail";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps
} from "../models/preview_component_props";
import { EmptyValue } from "../components/EmptyValue";
import ReactMarkdown from "react-markdown";
import { ArrayOfMapsPreview } from "./components/ArrayOfMapsPreview";
import { MapPreview } from "./components/MapPreview";
import { StringPreview } from "./components/StringPreview";
import { BooleanPreview } from "./components/BooleanPreview";
import { TimestampPreview } from "./components/TimestampPreview";
import { default as ReferencePreview } from "./components/ReferencePreview";
import { ArrayOfReferencesPreview } from "./components/ArrayOfReferencesPreview";
import { ArrayEnumPreview } from "./components/ArrayEnumPreview";
import { ArrayPreview } from "./components/ArrayPreview";
import { UrlComponentPreview } from "./components/UrlComponentPreview";
import { ArrayOfStorageComponentsPreview } from "./components/ArrayOfStorageComponentsPreview";
import { ArrayOfStringsPreview } from "./components/ArrayOfStringsPreview";
import { NumberPreview } from "./components/NumberPreview";
import ErrorIcon from "@material-ui/icons/Error";

import firebase from "firebase/app";
import { Box } from "@material-ui/core";
import { useStyles } from "./components/styles";
import clsx from "clsx";

export function PreviewComponent<T>(props: PreviewComponentProps<T>) {
    let content: JSX.Element | any;
    const {
        property, name, value, size, entitySchema
    } = props;

    const fieldProps = { ...props, PreviewComponent };

    if (value === null || value === undefined) {
        return <EmptyValue/>;
    }

    if (property.config?.customPreview) {
        content = createElement(property.config.customPreview as React.ComponentType<PreviewComponentProps & PreviewComponentFactoryProps>,
            {
                name,
                value,
                property,
                size,
                entitySchema,
                PreviewComponent
            });
    } else if (property.dataType === "string") {
        const stringProperty = property as StringProperty;
        if (typeof value === "string") {
            if (stringProperty.config?.url) {
                content = <UrlComponentPreview {...fieldProps}
                                               property={property as StringProperty}
                                               value={value}/>;
            } else if (stringProperty.config?.storageMeta) {

                content = <StorageThumbnail {...fieldProps}
                                            property={property as StringProperty}
                                            value={value}/>;

            } else if (stringProperty.config?.markdown) {
                content = <ReactMarkdown>{value}</ReactMarkdown>;
            } else {
                content = <StringPreview {...fieldProps}
                                         property={property as StringProperty}
                                         value={value}/>;
            }
        } else {
            content = buildWrongValueType();
        }
    } else if (property.dataType === "array") {
        if (value instanceof Array) {
            const arrayProperty = property as ArrayProperty;

            if (arrayProperty.of.dataType === "map") {
                content =
                    <ArrayOfMapsPreview name={name}
                                        property={property as ArrayProperty}
                                        value={value}
                                        size={size}
                                        entitySchema={entitySchema}
                                        PreviewComponent={PreviewComponent}/>;
            } else if (arrayProperty.of.dataType === "reference") {
                content = <ArrayOfReferencesPreview {...fieldProps}
                                                    value={value}
                                                    property={property as ArrayProperty}/>;
            } else if (arrayProperty.of.dataType === "string") {
                if (arrayProperty.of.config?.enumValues) {
                    content = <ArrayEnumPreview
                        {...fieldProps}
                        value={value}
                        property={property as ArrayProperty}/>;
                } else if (arrayProperty.of.config?.storageMeta) {
                    content = <ArrayOfStorageComponentsPreview
                        {...fieldProps}
                        value={value}
                        property={property as ArrayProperty}/>;
                } else {
                    content = <ArrayOfStringsPreview
                        {...fieldProps}
                        value={value}
                        property={property as ArrayProperty}/>;
                }
            } else {
                content = <ArrayPreview {...fieldProps}
                                        value={value}
                                        property={property as ArrayProperty}/>;
            }
        } else {
            content = buildWrongValueType();
        }
    } else if (property.dataType === "map") {
        if (typeof value === "object") {
            content =
                <MapPreview {...fieldProps}
                            property={property as MapProperty}/>;
        } else {
            content = buildWrongValueType();
        }
    } else if (property.dataType === "timestamp") {
        if (value instanceof Date) {
            content = <TimestampPreview {...fieldProps}
                                        value={value}
                                        property={property as TimestampProperty}/>;
        } else {
            content = buildWrongValueType();
        }
    } else if (property.dataType === "reference") {
        if (value instanceof firebase.firestore.DocumentReference) {
            content = <ReferencePreview
                {...fieldProps}
                value={value}
                property={property as ReferenceProperty}
            />;
        } else {
            content = buildWrongValueType();
        }
    } else if (property.dataType === "boolean") {
        if (typeof value === "boolean") {
            content = <BooleanPreview {...fieldProps}
                                      value={value}
                                      property={property as BooleanProperty}/>;
        } else {
            content = buildWrongValueType();
        }
    } else if (property.dataType === "number") {
        if (typeof value === "number") {
            content = <NumberPreview {...fieldProps}
                                     value={value}
                                     property={property as NumberProperty}/>;
        } else {
            console.debug("Unexpected value for property", property, value);
            console.debug("typeof value", typeof value);
            content = buildWrongValueType();
        }
    } else {
        content = JSON.stringify(value);
    }

    return content === undefined || content === null ? <EmptyValue/> : content;
}

function buildWrongValueType() {

    const classes = useStyles();
    return (
        <div
            className={clsx(classes.flexCenter, classes.smallMargin)}>
            <ErrorIcon fontSize={"small"} color={"error"}/>
            <Box marginLeft={1}>Unexpected value</Box>
        </div>
    );
}

export default React.memo<PreviewComponentProps>(PreviewComponent);
