import React from "react";
import { ArrayProperty, ResolvedMapProperty } from "../../models";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";

import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { PropertyPreview, PropertyPreviewProps } from "../internal";
import { resolveArrayProperty } from "../../core/util/resolutions";

/**
 * @category Preview components
 */
export function ArrayOfMapsPreview({
                                       propertyKey,
                                       value,
                                       property: inputProperty,
                                       size,
                                       entity
                                   }: PropertyPreviewProps<object[]>) {

    const property = resolveArrayProperty({
        property: inputProperty,
        propertyValue: value
    });

    if (Array.isArray(property?.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (property?.dataType !== "array" || !property.of || property.of.dataType !== "map")
        throw Error("Picked wrong preview component ArrayOfMapsPreview");

    const mapProperty = (property as ArrayProperty).of as ResolvedMapProperty;
    const properties = mapProperty.properties;
    if (!properties) {
        throw Error(`You need to specify a 'properties' prop (or specify a custom field) in your map property ${propertyKey}`);
    }
    const values = value;
    const previewProperties = mapProperty.previewProperties;

    if (!values) return null;

    let mapProperties = previewProperties;
    if (!mapProperties || !mapProperties.length) {
        mapProperties = Object.keys(properties);
        if (size)
            mapProperties = mapProperties.slice(0, 3);
    }

    return (
        <Table size="small">
            <TableBody>
                {values &&
                values.map((v, index) => {
                    return (
                        <TableRow key={`table_${v}_${index}`}
                                  sx={{
                                      "&:last-child th, &:last-child td": {
                                          borderBottom: 0
                                      }
                                  }}>
                            {mapProperties && mapProperties.map(
                                (key) => (
                                    <TableCell
                                        key={`table-cell-${key as string}`}
                                        component="th"
                                    >
                                        <ErrorBoundary>
                                            <PropertyPreview
                                                propertyKey={key as string}
                                                value={(v as any)[key]}
                                                property={properties[key as string]}
                                                entity={entity}
                                                size={"small"}/>
                                        </ErrorBoundary>
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
