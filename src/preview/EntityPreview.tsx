import * as React from "react";

import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography
} from "@material-ui/core";
import { Entity, EntitySchema } from "../models";
import PreviewComponent from "./PreviewComponent";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import IconButton from "@material-ui/core/IconButton";
import { FirebaseConfigContext } from "../contexts";


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
        <FirebaseConfigContext.Consumer>
            {config => (
                <TableContainer>
                    <Table aria-label="simple table">
                        <TableBody>
                            <TableRow key={"entity_prev_id"}>
                                <TableCell align="right" component="th"
                                           scope="row">
                                    <Typography variant={"caption"}
                                                color={"textSecondary"}>
                                        Id
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        {entity.id}
                                        <a href={`https://console.firebase.google.com/u/0/project/${config["projectId"]}/firestore/data/${entity.reference.path}`}
                                           target="_blank">
                                            <IconButton
                                                aria-label="go-to-firestore">
                                                <OpenInNewIcon/>
                                            </IconButton>
                                        </a>
                                    </Box>
                                </TableCell>
                            </TableRow>
                            {Object.entries(schema.properties).map(([key, property]) => (
                                <TableRow
                                    key={"entity_prev" + property.title + key}>
                                    <TableCell align="right" component="th"
                                               scope="row">
                                        <Typography variant={"caption"}
                                                    color={"textSecondary"}>
                                            {property.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <PreviewComponent
                                            value={entity.values[key as string]}
                                            property={property}
                                            small={false}/>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </FirebaseConfigContext.Consumer>

    );

}
