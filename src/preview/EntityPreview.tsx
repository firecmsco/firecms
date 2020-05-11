import * as React from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from "@material-ui/core";
import { Entity, EntitySchema } from "../models";
import renderPreviewComponent from "./index";

export interface EntityPreviewProps<S extends EntitySchema> {

    entity: Entity<S>;

    schema: S;

}

export default function EntityPreview<S extends EntitySchema>(
    {
        entity,
        schema
    }: EntityPreviewProps<S>) {

    return (
        <TableContainer >
            <Table aria-label="simple table">
                <TableBody>
                    {Object.entries(schema.properties).map(([key, property]) => (
                        <TableRow key={"entity_prev" + property.title + key}>
                            <TableCell align="right" component="th" scope="row">
                                {property.title}
                            </TableCell>
                            <TableCell>
                                {renderPreviewComponent(entity.values[key], property, false)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

}
