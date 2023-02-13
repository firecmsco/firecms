import * as React from "react";

import { styled } from "@mui/material/styles";

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
import {
    Entity,
    EntityCollection,
    FireCMSContext,
    ResolvedEntityCollection,
    ResolvedProperties
} from "../../types";
import { PropertyPreview } from "../../preview";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getIconForProperty, getIdIcon, resolveCollection } from "../util";
import { ErrorBoundary } from "./ErrorBoundary";
import { useFireCMSContext } from "../../hooks";

const PREFIX = "EntityPreview";

const classes = {
    property: `${PREFIX}-property`,
    valuePreview: `${PREFIX}-valuePreview`,
    iconCell: `${PREFIX}-iconCell`,
    titleCell: `${PREFIX}-titleCell`
};

const StyledTableContainer = styled(TableContainer)((
    { theme }: {
        theme: Theme
    }
) => ({
    [`& .${classes.property}`]: {
        display: "flex"
    },

    [`& .${classes.valuePreview}`]: {
        height: "72px",
        padding: theme.spacing(2, 3)
    },

    [`& .${classes.iconCell}`]: {
        paddingTop: theme.spacing(1)
    },

    [`& .${classes.titleCell}`]: {
        width: "25%",
        padding: theme.spacing(1)
    }
}));

/**
 * @category Components
 */
export interface EntityPreviewProps<M extends Record<string, any>> {
    entity: Entity<M>;
    collection: EntityCollection<M>;
    path: string;
}

/**
 * Use this component to render a preview of a property values
 * @param entity
 * @param collection
 * @param path
 * @constructor
 * @category Components
 */
export function EntityPreview<M extends Record<string, any>>(
    {
        entity,
        collection,
        path
    }: EntityPreviewProps<M>) {

    const context = useFireCMSContext();
    const resolvedCollection: ResolvedEntityCollection<M> = React.useMemo(() => resolveCollection<M>({
        collection,
        path,
        entityId: entity.id,
        values: entity.values,
        fields: context.fields
    }), [collection, path, entity]);

    const appConfig: FireCMSContext | undefined = useFireCMSContext();

    const properties: ResolvedProperties = resolvedCollection.properties;

    return (
        <>

            <Box
                sx={(theme) => ({
                    width: "100%",
                    marginTop: theme.spacing(3),
                    paddingLeft: theme.spacing(4),
                    paddingRight: theme.spacing(4),
                    paddingTop: theme.spacing(3),
                    [theme.breakpoints.down("lg")]: {
                        marginTop: theme.spacing(2),
                        paddingLeft: theme.spacing(2),
                        paddingRight: theme.spacing(2),
                        paddingTop: theme.spacing(2)
                    },
                    [theme.breakpoints.down("md")]: {
                        marginTop: theme.spacing(1),
                        paddingLeft: theme.spacing(2),
                        paddingRight: theme.spacing(2),
                        paddingTop: theme.spacing(2)
                    }
                })}>

                <Typography
                    sx={{
                        marginTop: 4,
                        marginBottom: 4
                    }}
                    variant={"h4"}>{collection.singularName ?? collection.name + " entry"}
                </Typography>

            </Box>

            <StyledTableContainer>
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

                        {collection && Object.entries(properties)
                            .map(([key, property]) => {
                                const value = (entity.values)[key];
                                return (
                                    <TableRow
                                        key={"entity_prev" + property.name + key}>
                                        <TableCell align="right"
                                                   component="td"
                                                   scope="row"
                                                   className={classes.titleCell}>
                                            <Typography
                                                sx={{ paddingLeft: 2 }}
                                                variant={"caption"}
                                                color={"textSecondary"}>
                                                {property.name}
                                            </Typography>
                                        </TableCell>

                                        <TableCell padding="none"
                                                   className={classes.iconCell}>
                                            {getIconForProperty(property, "disabled", "small")}
                                        </TableCell>

                                        <TableCell
                                            className={classes.valuePreview}>
                                            <ErrorBoundary>
                                                <PropertyPreview
                                                    propertyKey={key}
                                                    value={value}
                                                    entity={entity}
                                                    property={property}
                                                    size={"regular"}/>
                                            </ErrorBoundary>
                                        </TableCell>

                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </StyledTableContainer>

        </>
    );

}

export default EntityPreview;
