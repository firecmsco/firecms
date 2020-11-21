import { ArrayProperty, MapProperty } from "../../models";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps
} from "../PreviewComponentProps";
import ErrorBoundary from "../../components/ErrorBoundary";

import React from "react";

import {
    createStyles,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Theme
} from "@material-ui/core";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tableNoBottomBorder: {
            "&:last-child th, &:last-child td": {
                borderBottom: 0
            }
        }
    })
);

export function ArrayOfMapsPreview({
                                       name,
                                       value,
                                       property,
                                       size,
                                       entitySchema,
                                       PreviewComponent
                                   }: PreviewComponentProps<object[]> & PreviewComponentFactoryProps) {

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
                                                value={value[key] as any}
                                                property={properties[key]}
                                                size={"small"}
                                                entitySchema={entitySchema}/>
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
