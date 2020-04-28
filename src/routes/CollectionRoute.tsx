import React from "react";
import CollectionTable from "../collection/CollectionTable";
import { RouteComponentProps } from "react-router";
import { Entity, EntityCollectionView, EntitySchema } from "../models";
import {
    BreadcrumbEntry,
    getEntityPath,
    getRouterNewEntityPath,
    replacePathIdentifiers
} from "./navigation";
import {
    Box,
    Breadcrumbs,
    Button,
    Grid,
    Link,
    Typography
} from "@material-ui/core";
import { Link as ReactLink } from "react-router-dom";
import { BreadcrumbContainer } from "../util/BreadcrumbContainer";

interface CollectionRouteProps<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    entityPlaceholderPath: string,
    breadcrumbs: BreadcrumbEntry[]
}

export function CollectionRoute<S extends EntitySchema>({
                                                            view,
                                                            entityPlaceholderPath,
                                                            breadcrumbs,
                                                            match,
                                                            history
                                                        }
                                                            : CollectionRouteProps<S> & RouteComponentProps) {
    let collectionPath: string;

    if (match) {
        collectionPath = replacePathIdentifiers(match.params, entityPlaceholderPath);
    } else {
        throw Error("No match prop for some reason");
    }

    function onEntityEdit(collectionPath: string, entity: Entity<S>) {
        const entityPath = getEntityPath(entity.id, collectionPath);
        history.push(entityPath);
    }

    return (
        <React.Fragment>
            <Box mb={3}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <BreadcrumbContainer>
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link color="inherit" component={ReactLink}
                                      to="/">
                                    Home
                                </Link>
                                <Typography
                                    color="textPrimary">{view.schema.name}</Typography>
                            </Breadcrumbs>
                        </BreadcrumbContainer>
                    </Grid>
                    <Grid item xs={6}>
                        <Box textAlign="right">
                            <Button
                                component={ReactLink}
                                to={getRouterNewEntityPath(collectionPath)}
                                size="large"
                                variant="contained"
                                color="primary"
                            >
                                Add {view.schema.name}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Box mb={3}>
                <Typography variant="h5">{view.schema.name} List</Typography>
            </Box>
            <CollectionTable collectionPath={view.relativePath}
                             schema={view.schema}
                             textSearchDelegate={view.textSearchDelegate}
                             includeToolbar={true}
                             onEntityEdit={onEntityEdit}
                             paginationEnabled={view.pagination === undefined ? true : view.pagination}/>
        </React.Fragment>
    );
}
