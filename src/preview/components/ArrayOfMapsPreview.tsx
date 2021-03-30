import React from "react";
import {
    ArrayProperty,
    MapProperty,
    PreviewComponentProps
} from "../../models";
import ErrorBoundary from "../../components/ErrorBoundary";

import { Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import { useStyles } from "./styles";
import { PreviewComponent } from "../PreviewComponent";

export function ArrayOfMapsPreview({
                                       value,
                                       property,
                                       size
}: PreviewComponentProps<object[]> ) {

    if (property.dataType !== "array" || property.of.dataType !== "map")
        throw Error("Picked wrong preview component ArrayOfMapsPreview");

    const properties = ((property as ArrayProperty).of as MapProperty).properties;
    const values = value;
    const previewProperties = ((property as ArrayProperty).of as MapProperty).previewProperties;

    if (!values) return null;

    const classes = useStyles();

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
                values.map((value, index) => {
                    return (
                        <TableRow key={`table_${value}_${index}`}
                                  className={classes.tableNoBottomBorder}>
                            {mapProperties && mapProperties.map(
                                (key, index) => (
                                    <TableCell
                                        key={`table-cell-${key}`}
                                        component="th"
                                    >
                                        <ErrorBoundary>
                                            <PreviewComponent
                                                name={key}
                                                value={(value as any)[key]}
                                                property={properties[key]}
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
