import React from "react";
import { Entity, EntityCollectionView, EntitySchema } from "../models";
import { BreadcrumbEntry } from "./navigation";
import {
    Box,
    Button,
    createStyles,
    makeStyles,
    useMediaQuery,
    useTheme,
    Typography
} from "@material-ui/core";
import { useRouteMatch } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";
import { useBreadcrumbsContext } from "../BreacrumbsContext";
import { CollectionTable } from "../collection/CollectionTable";
import { useSelectedEntityContext } from "../SelectedEntityContext";

export const useStyles = makeStyles(() =>
    createStyles({
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column"
        }
    })
);

interface CollectionRouteProps<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    collectionPath: string;
    breadcrumbs: BreadcrumbEntry[];
}

export function CollectionRoute<S extends EntitySchema>({
                                                            view,
                                                            collectionPath,
                                                            breadcrumbs
                                                        }
                                                            : CollectionRouteProps<S>) {

    const { path, url } = useRouteMatch();

    const breadcrumbsContext = useBreadcrumbsContext();
    React.useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: breadcrumbs
        });
    }, [url]);

    const selectedEntityContext = useSelectedEntityContext();

    const onEntityClick = (collectionPath: string, entity: Entity<S>) => {
        selectedEntityContext.open({
            entityId: entity.id,
            collectionPath
        });
    };

    const deleteEnabled = view.deleteEnabled === undefined || view.deleteEnabled;

    const classes = useStyles();

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up("md"));

    function buildAddEntityButton() {
        const onClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            return selectedEntityContext.openNew({ collectionPath });
        };
        return matches ?
            <Button
                // component={ReactLink}
                onClick={onClick}
                startIcon={<AddIcon/>}
                // to={getRouterNewEntityPath(collectionPath)}
                size="large"
                variant="contained"
                color="primary">
                Add {view.schema.name}
            </Button>
            : <Button
                // component={ReactLink}
                onClick={onClick}
                // to={getRouterNewEntityPath(collectionPath)}
                size="medium"
                variant="contained"
                color="primary"
            ><AddIcon/>
            </Button>;
    }

    const title = (
        <React.Fragment>
            <Typography variant="h6">
                {`${view.schema.name} list`}
            </Typography>
            <Typography variant={"caption"} color={"textSecondary"}>
                {`/${collectionPath}`}
            </Typography>
        </React.Fragment>
    );

    return (
        <Box className={classes.root}>

            <CollectionTable collectionPath={collectionPath}
                             schema={view.schema}
                             actions={buildAddEntityButton()}
                             textSearchDelegate={view.textSearchDelegate}
                             includeToolbar={true}
                             editEnabled={true}
                             deleteEnabled={deleteEnabled}
                             onEntityClick={onEntityClick}
                             additionalColumns={view.additionalColumns}
                             defaultSize={view.defaultSize}
                             paginationEnabled={view.pagination === undefined ? true : view.pagination}
                             initialFilter={view.initialFilter}
                             filterableProperties={view.filterableProperties}
                             properties={view.properties}
                             excludedProperties={view.excludedProperties}
                             title={title}/>

        </Box>
    );
}
