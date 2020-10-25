import * as React from "react";

import {
    Box,
    createStyles,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Theme,
    Typography
} from "@material-ui/core";
import { Entity, EntitySchema } from "../models";
import PreviewComponent from "./PreviewComponent";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import IconButton from "@material-ui/core/IconButton";
import { FirebaseConfigContext } from "../contexts";
import { getIconForProperty, getIdIcon } from "../util/property_icons";
import ErrorBoundary from "../components/ErrorBoundary";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        property: {
            display: "flex"
        },
        valuePreview: {
            width: "358px",
            height: "72px",
            padding: theme.spacing(2, 3)
        }
    })
);

export interface EntityPreviewProps<S extends EntitySchema> {
    entity: Entity<S>;
    schema: S;
}

export default function EntityPreview<S extends EntitySchema>(
    {
        entity,
        schema
    }: EntityPreviewProps<S>) {

    const classes = useStyles();

    return (
        <FirebaseConfigContext.Consumer>
            {config => (
                <TableContainer>
                    <Table aria-label="entity table">
                        <TableBody>
                            <TableRow key={"entity_prev_id"}>
                                <TableCell align="right"
                                           component="td"
                                           scope="row">
                                    <Typography variant={"caption"}
                                                color={"textSecondary"}>
                                        Id
                                    </Typography>
                                </TableCell>
                                <TableCell padding="none">
                                    {getIdIcon("disabled", "small")}
                                </TableCell>
                                <TableCell className={classes.valuePreview}>
                                    <Box display="flex" alignItems="center">
                                        {entity.id}
                                        <a href={`https://console.firebase.google.com/project/${config["projectId"]}/firestore/data/${entity.reference.path}`}
                                           target="_blank">
                                            <IconButton
                                                aria-label="go-to-firestore">
                                                <OpenInNewIcon
                                                    fontSize={"small"}/>
                                            </IconButton>
                                        </a>
                                    </Box>
                                </TableCell>
                            </TableRow>

                            {schema && Object.entries(schema.properties).map(([key, property]) => {
                                const value = entity.values[key as string];
                                return (
                                    <TableRow
                                        key={"entity_prev" + property.title + key}>
                                        <TableCell align="right"
                                                   component="td"
                                                   scope="row">
                                            <Typography
                                                style={{ paddingLeft: "16px" }}
                                                variant={"caption"}
                                                color={"textSecondary"}>
                                                {property.title}
                                            </Typography>
                                        </TableCell>

                                        <TableCell padding="none">
                                            {getIconForProperty(property, "disabled", "small")}
                                        </TableCell>

                                        <TableCell
                                            className={classes.valuePreview}>
                                            <ErrorBoundary>
                                                <PreviewComponent
                                                    name={key}
                                                    value={value}
                                                    property={property}
                                                    size={"regular"}
                                                    entitySchema={schema}/>
                                            </ErrorBoundary>
                                        </TableCell>

                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </FirebaseConfigContext.Consumer>

    );

}
