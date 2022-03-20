import * as React from "react";

import { styled } from '@mui/material/styles';

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
    FireCMSContext,
    ResolvedEntityCollection,
    ResolvedProperties
} from "../../models";
import { PropertyPreview } from "../../preview/PropertyPreview";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getIconForProperty, getIdIcon } from "../util/property_utils";
import { ErrorBoundary } from "../internal/ErrorBoundary";
import { useFireCMSContext } from "../../hooks";

const PREFIX = 'EntityPreview';

const classes = {
    property: `${PREFIX}-property`,
    valuePreview: `${PREFIX}-valuePreview`,
    iconCell: `${PREFIX}-iconCell`,
    titleCell: `${PREFIX}-titleCell`
};

const StyledTableContainer = styled(TableContainer)((
   { theme } : {
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
export interface EntityPreviewProps<M> {
    entity: Entity<M>;
    collection: ResolvedEntityCollection<M>;
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
export function EntityPreview<M>(
    {
        entity,
        collection,
        path
    }: EntityPreviewProps<M>) {



    const appConfig: FireCMSContext | undefined = useFireCMSContext();

    const properties: ResolvedProperties = collection.properties;

    return (
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
                            const value = (entity.values as any)[key];
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
    );

}

export default EntityPreview;
