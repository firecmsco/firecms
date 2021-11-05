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
    EntitySchema,
    FireCMSContext,
    Property,
    PropertyOrBuilder
} from "../../models";
import { PreviewComponent } from "../../preview/PreviewComponent";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getIconForProperty, getIdIcon } from "../util/property_icons";
import { ErrorBoundary } from "../internal/ErrorBoundary";
import { useFireCMSContext } from "../../hooks";
import { buildPropertyFrom } from "../util/property_builder";

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
export interface EntityPreviewProps<M extends { [Key: string]: any }> {
    entity: Entity<M>;
    schema: EntitySchema<M>;
}

/**
 * Use this component to render a preview of a property values
 * @param entity
 * @param schema
 * @constructor
 * @category Components
 */
export function EntityPreview<M extends { [Key: string]: any }>(
    {
        entity,
        schema
    }: EntityPreviewProps<M>) {

    const classes = useStyles();

    const appConfig: FireCMSContext | undefined = useFireCMSContext();
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

                    {schema && Object.entries(schema.properties).map(([key, propertyOrBuilder]) => {
                        const value = (entity.values as any)[key];
                        const property: Property = buildPropertyFrom(propertyOrBuilder as PropertyOrBuilder<any, M>, entity.values, entity.id);
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
