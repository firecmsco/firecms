import {
    ResolvedArrayProperty,
    ResolvedMapProperty,
    ResolvedProperties,
    ResolvedProperty,
    ResolvedStringProperty
} from "../../types";
import React from "react";
import { getThumbnailMeasure } from "../util";
import { PreviewSize } from "../PropertyPreviewProps";
import { Skeleton } from "../../components/Skeleton";

export interface SkeletonPropertyComponentProps {
    property: ResolvedProperty,
    size: PreviewSize
}

/**
 * @category Preview components
 */
export function SkeletonPropertyComponent({
                                              property,
                                              size
                                          }: SkeletonPropertyComponentProps
) {

    if (!property) {
        console.error("No property assigned for skeleton component", property, size);
    }

    let content: React.ReactNode | any;
    if (property.dataType === "string") {
        const stringProperty = property as ResolvedStringProperty;
        if (stringProperty.url) {
            content = renderUrlComponent(stringProperty, size);
        } else if (stringProperty.storage) {
            content = renderSkeletonImageThumbnail(size);
        } else {
            content = renderSkeletonText();
        }
    } else if (property.dataType === "array") {
        const arrayProperty = property as ResolvedArrayProperty;

        if (arrayProperty.of) {
            if (Array.isArray(arrayProperty.of)) {
                content = <>{arrayProperty.of.map((p, i) => renderGenericArrayCell(p, i))} </>;
            } else {
                if (arrayProperty.of.dataType === "map" && arrayProperty.of.properties) {
                    content = renderArrayOfMaps(arrayProperty.of.properties, size, arrayProperty.of.previewProperties);
                } else if (arrayProperty.of.dataType === "string") {
                    if (arrayProperty.of.enumValues) {
                        content = renderArrayEnumTableCell();
                    } else if (arrayProperty.of.storage) {
                        content = renderGenericArrayCell(arrayProperty.of);
                    } else {
                        content = renderArrayOfStrings();
                    }
                } else {
                    content = renderGenericArrayCell(arrayProperty.of);
                }
            }
        }

    } else if (property.dataType === "map") {
        content = renderMap(property as ResolvedMapProperty, size);
    } else if (property.dataType === "date") {
        content = renderSkeletonText();
    } else if (property.dataType === "reference") {
        content = renderReference();
    } else if (property.dataType === "boolean") {
        content = renderSkeletonText();
    } else {
        content = renderSkeletonText();
    }
    return (content || null);
}

function renderMap<T extends Record<string, any>>(property: ResolvedMapProperty<T>, size: PreviewSize) {

    if (!property.properties)
        return <></>;

    let mapPropertyKeys: string[];
    if (size === "medium") {
        mapPropertyKeys = Object.keys(property.properties);
    } else {
        mapPropertyKeys = (property.previewProperties || Object.keys(property.properties)) as string[];
        if (size === "small")
            mapPropertyKeys = mapPropertyKeys.slice(0, 3);
        else if (size === "tiny")
            mapPropertyKeys = mapPropertyKeys.slice(0, 1);
    }

    if (size !== "medium")
        return (
            <div
                className="w-full flex flex-col space-y-4 md:space-y-[theme.spacing(0.5)]"
            >
                {mapPropertyKeys.map((key, index) => (
                    <div key={`map_${key}`}>
                        {property.properties && property.properties[key] &&
                            <SkeletonPropertyComponent
                                property={property.properties[key]}
                                size={"small"}/>}
                    </div>
                ))}
            </div>
        );

    return (
        <table className="table-auto">
            <tbody>
            {mapPropertyKeys &&
                mapPropertyKeys.map((key, index) => {
                    return (
                        <tr
                            key={`map_preview_table__${index}`}
                            className="border-b last:border-b-0">
                            <th key={`table-cell-title--${key}`}
                                className="align-top"
                                style={{ width: "30%" }}>
                                <p className="text-xs text-secondary">
                                    {property.properties![key].name}
                                </p>
                            </th>
                            <th key={`table-cell-${key}`}
                                style={{ width: "70%" }}>
                                {property.properties && property.properties[key] &&
                                    <SkeletonPropertyComponent
                                        property={property.properties[key]}
                                        size={"small"}/>}
                            </th>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function renderArrayOfMaps<M extends Record<string, any>>(properties: ResolvedProperties<M>, size: PreviewSize, previewProperties?: string[]) {
    let tableProperties = previewProperties;
    if (!tableProperties || !tableProperties.length) {
        tableProperties = Object.keys(properties) as string[];
        if (size)
            tableProperties = tableProperties.slice(0, 3);
    }

    return (
        <table className="table-auto">
            <tbody>
            {
                [0, 1, 2].map((value, index) => {
                    return (
                        <tr key={`table_${value}_${index}`}>
                            {tableProperties && tableProperties.map(
                                (key) => (
                                    <th
                                        key={`table-cell-${key}`}
                                    >
                                        <SkeletonPropertyComponent
                                            property={(properties)[key]}
                                            size={"small"}/>
                                    </th>
                                )
                            )}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function renderArrayOfStrings() {
    return (
        <div className={"flex flex-col gap-2"}>
            {
                [0, 1].map((value, index) => (
                    renderSkeletonText(index)
                ))}
        </div>
    );
}

function renderArrayEnumTableCell() {
    return (
        <div className={"flex flex-col gap-2"}>
            {
                [0, 1].map((value, index) =>
                    <>
                        {renderSkeletonText(index)}
                    </>
                )}
        </div>
    );
}

function renderGenericArrayCell(
    property: ResolvedProperty,
    index = 0
) {
    return (

        <div key={"array_index"}
             className={"flex flex-col gap-2"}>

            {
                [0, 1].map((value, index) =>
                    <>
                        <SkeletonPropertyComponent key={`i_${index}`}
                                                   property={property}
                                                   size={"small"}/>
                    </>
                )}
        </div>
    );
}

function renderUrlAudioComponent() {
    return (
        <Skeleton width={300}
                  height={100}/>
    );
}

export function renderSkeletonImageThumbnail(size: PreviewSize) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const imageSize = size === "tiny" ? 40 : size === "small" ? 100 : 200;
    return (
        <Skeleton width={imageSize}
                  height={imageSize}/>
    );
}

function renderUrlVideo(size: PreviewSize) {

    return (
        <Skeleton width={size !== "medium" ? 300 : 500}
                  height={size !== "medium" ? 200 : 250}/>
    );
}

function renderReference() {
    return <Skeleton width={200} height={100}/>;
}

function renderUrlComponent(property: ResolvedStringProperty, size: PreviewSize = "medium") {

    if (typeof property.url === "boolean") {
        return <div style={{
            display: "flex"
        }}>
            {renderSkeletonIcon()}
            {renderSkeletonText()}
        </div>;
    }

    return renderUrlFile(size);
}

function renderUrlFile(size: PreviewSize) {

    return (
        <div
            className={`w-${getThumbnailMeasure(size)} h-${getThumbnailMeasure(size)}`}>
            {renderSkeletonIcon()}
        </div>
    );
}

export function renderSkeletonText(index?: number) {
    return <Skeleton width={120} key={`skeleton_${index}`}/>;
}

export function renderSkeletonCaptionText(index?: number) {
    return <Skeleton
        height={20}/>;
}

export function renderSkeletonIcon() {
    return <Skeleton width={24} height={24}/>;
}
