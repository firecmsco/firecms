import * as React from "react";

import {
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Theme,
    Typography
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import {
    AnyProperty,
    Entity,
    FireCMSContext,
    Properties,
    ResolvedEntitySchema
} from "../../models";
import { PreviewComponent } from "../../preview/PreviewComponent";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getIconForProperty, getIdIcon } from "../util/property_utils";
import { ErrorBoundary } from "../internal/ErrorBoundary";
import { useFireCMSContext } from "../../hooks";

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

/**
 * @category Components
 */
export interface EntityPreviewProps<M> {
    entity: Entity<M>;
    schema: ResolvedEntitySchema<M>;
    path: string;
}

/**
 * Use this component to render a preview of a property values
 * @param entity
 * @param schema
 * @param path
 * @constructor
 * @category Components
 */
export function EntityPreview<M>(
    {
        entity,
        schema,
        path
    }: EntityPreviewProps<M>) {

    const classes = useStyles();

    const appConfig: FireCMSContext | undefined = useFireCMSContext();

    const properties:Properties = schema.properties;

    return (
        <TableContainer>
            <Table aria-label="entity table">
                <TableBody>
                    <TableRow>
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
                                {appConfig?.entityLinkBuilder &&
                                <a href={appConfig.entityLinkBuilder({ entity })}
                                   rel="noopener noreferrer"
                                   target="_blank">
                                    <IconButton
                                        aria-label="go-to-entity-datasource"
                                        size="large">
                                        <OpenInNewIcon
                                            fontSize={"small"}/>
                                    </IconButton>
                                </a>}
                            </Box>
                        </TableCell>
                    </TableRow>

                    {schema && Object.entries(properties)
                        .map(([key, property]) => {
                            const value = (entity.values as any)[key];
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
                                            property={property as AnyProperty}
                                            size={"regular"}/>
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

export default EntityPreview;
