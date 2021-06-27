import * as React from "react";

import {
    Box,
    createStyles,
    IconButton,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Theme,
    Typography
} from "@material-ui/core";
import {
    buildPropertyFrom,
    Entity,
    EntitySchema,
    Property,
    PropertyOrBuilder
} from "../../models";
import { PreviewComponent } from "../../preview/PreviewComponent";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { getIconForProperty, getIdIcon } from "../../util/property_icons";
import { default as ErrorBoundary } from "../internal/ErrorBoundary";
import { useCMSAppContext } from "../../contexts";
import { CMSAppContext } from "../../contexts/CMSAppContext";

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

export interface EntityPreviewProps<S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>> {
    entity: Entity<S, Key>;
    schema: S;
}

export default function EntityPreview<S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>>(
    {
        entity,
        schema
    }: EntityPreviewProps<S, Key>) {

    const classes = useStyles();

    const appConfig: CMSAppContext | undefined = useCMSAppContext();
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
                                {appConfig?.firebaseConfig &&
                                <a href={`https://console.firebase.google.com/project/${(appConfig.firebaseConfig as any)["projectId"]}/firestore/data/${entity.reference.path}`}
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

                    {schema && Object.entries(schema.properties).map(([key, propertyOrBuilder]) => {
                        const value = (entity.values as any)[key];
                        const property: Property = buildPropertyFrom(propertyOrBuilder as PropertyOrBuilder<any, S, Key>, entity.values, entity.id);
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
