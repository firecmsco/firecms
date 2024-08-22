import React from "react";

import { ResolvedMapProperty } from "../../types";
import { PropertyPreviewProps } from "../PropertyPreviewProps";
import { PropertyPreview } from "../PropertyPreview";
import { cls, defaultBorderMixin, Typography } from "@firecms/ui";
import { ErrorBoundary } from "../../components";
import { EmptyValue } from "../components/EmptyValue";

/**
 * @group Preview components
 */
export function MapPropertyPreview<T extends Record<string, any> = Record<string, any>>({
                                                                                            propertyKey,
                                                                                            value,
                                                                                            property,
                                                                                            // entity,
                                                                                            size
                                                                                        }: PropertyPreviewProps<T>) {

    if (property.dataType !== "map") {
        throw Error("Picked wrong preview component MapPropertyPreview");
    }

    const mapProperty = property as ResolvedMapProperty;

    if (!mapProperty.properties || Object.keys(mapProperty.properties ?? {}).length === 0) {
        return (
            <KeyValuePreview value={value}/>
        );
    }

    if (!value) return null;

    const mapPropertyKeys: string[] = Object.keys(mapProperty.properties)

    if (size === "smallest")
        return (
            <div className="w-full flex flex-col space-y-1 md:space-y-2">
                {mapPropertyKeys.map((key, index) => (
                    <div key={`map_${key}`}>
                        <ErrorBoundary
                            key={"map_preview_" + mapProperty.name + key + index}>
                            <PropertyPreview propertyKey={key}
                                             value={(value)[key]}
                                             property={mapProperty.properties![key]}
                                // entity={entity}
                                             size={size}/>
                        </ErrorBoundary>
                    </div>
                ))}
            </div>
        );

    return (
        <div
            className="flex flex-col gap-1 w-full">
            {mapPropertyKeys &&
                mapPropertyKeys.map((key, index) => {
                    const childProperty = mapProperty.properties![key];
                    return (
                        <div
                            key={`map_preview_table_${key}}`}
                            className={cls(defaultBorderMixin, "last:border-b-0 border-b")}>
                            <div
                                className={"flex flex-row pt-0.5 pb-0.5 gap-2"}>
                                <div
                                    className="min-w-[140px] w-[25%] py-1">
                                    <Typography variant={"caption"}
                                                className={"font-mono break-words"}
                                                color={"secondary"}>
                                        {childProperty.name}
                                    </Typography>
                                </div>
                                <div
                                    className="flex-grow max-w-[75%]">
                                    <ErrorBoundary>
                                        {!(childProperty.dataType === "map" || childProperty === "array") &&
                                            <PropertyPreview
                                                propertyKey={key}
                                                value={(value)[key]}
                                                property={childProperty}
                                                // entity={entity}
                                                size={size}/>}
                                    </ErrorBoundary>
                                </div>
                            </div>

                            {(childProperty.dataType === "map" || childProperty === "array") &&
                                <div className={cls(defaultBorderMixin, "border-l pl-4 ml-2 my-2")}>
                                    <PropertyPreview
                                        propertyKey={key}
                                        value={(value)[key]}
                                        property={childProperty}
                                        // entity={entity}
                                        size={size}/>
                                </div>
                            }
                        </div>
                    );
                })}
        </div>
    );

}

export function KeyValuePreview({ value }: { value: any }) {
    if (typeof value !== "object") return null;
    if (!value) return <EmptyValue/>;
    return <div
        className="flex flex-col gap-1 w-full">
        {
            Object.entries(value).map(([key, childValue]) => (
                <div
                    key={`map_preview_table_${key}}`}
                    className={cls(defaultBorderMixin, "last:border-b-0 border-b")}>
                    <div
                        className={"flex flex-row pt-0.5 pb-0.5 gap-2"}>
                        <div
                            key={`table-cell-title-${key}-${key}`}
                            className="min-w-[140px] w-[25%] py-1">
                            <Typography variant={"caption"}
                                        className={"font-mono break-words"}
                                        color={"secondary"}>
                                {key}
                            </Typography>
                        </div>
                        <div
                            className="flex-grow max-w-[75%]">
                            {typeof childValue !== "object" && <Typography>
                                <ErrorBoundary>
                                    {childValue && childValue.toString()}
                                </ErrorBoundary>
                            </Typography>}
                        </div>
                    </div>
                    {typeof childValue === "object" &&
                        <div className={cls(defaultBorderMixin, "border-l pl-4")}>
                            <KeyValuePreview value={childValue}/>
                        </div>
                    }
                </div>
            ))
        }
    </div>;
}
