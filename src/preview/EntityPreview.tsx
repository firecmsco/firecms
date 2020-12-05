import * as React from "react";

import {
    Box,
    createStyles,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    IconButton,
    TableRow,
    Theme,
    Typography
} from "@material-ui/core";
import { Entity, EntitySchema } from "../models";
import PreviewComponent from "./PreviewComponent";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { getIconForProperty, getIdIcon } from "../util/property_icons";
import ErrorBoundary from "../components/ErrorBoundary";
import { CMSAppProps } from "../CMSAppProps";
import { useAppConfigContext } from "../contexts/AppConfigContext";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        property: {
            display: "flex"
        },
        valuePreview: {
            height: "72px",
            padding: theme.spacing(2, 3)
        },
        iconCell: {
            paddingTop: theme.spacing(1)
        },
        titleCell: {
            width: "25%",
            padding: theme.spacing(1)
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

    const appConfig: CMSAppProps | undefined = useAppConfigContext();
    return (
        <TableContainer>
            <Table aria-label="entity table">
                <TableBody>
                    <TableRow key={"entity_prev_id"}>
                        <TableCell align="right"
                                   component="td"
                                   scope="row"
                                   className={classes.titleCell}>
                            <Typography variant={"caption"}
                                        color={"textSecondary"}>
                                Id
                            </Typography>
                        </TableCell>
                        <TableCell padding="none"
                                   className={classes.iconCell}>
                            {getIdIcon("disabled", "small")}
                        </TableCell>
                        <TableCell className={classes.valuePreview}>
                            <Box display="flex" alignItems="center">
                                {entity.id}
                                {appConfig?.firebaseConfig &&
                                <a href={`https://console.firebase.google.com/project/${appConfig.firebaseConfig["projectId"]}/firestore/data/${entity.reference.path}`}
                                   rel="noopener noreferrer"
                                   target="_blank">
                                    <IconButton
                                        aria-label="go-to-firestore">
                                        <OpenInNewIcon
                                            fontSize={"small"}/>
                                    </IconButton>
                                </a>}
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
                                           scope="row"
                                           className={classes.titleCell}>
                                    <Typography
                                        style={{ paddingLeft: "16px" }}
                                        variant={"caption"}
                                        color={"textSecondary"}>
                                        {property.title}
                                    </Typography>
                                </TableCell>

                                <TableCell padding="none"
                                           className={classes.iconCell}>
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

    );

}
