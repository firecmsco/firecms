import React from "react";
import { Entity, EntityCollectionView, EntitySchema } from "../models";
import { BreadcrumbEntry } from "./navigation";
import {
    Box,
    Button,
    createStyles,
    makeStyles,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import { useRouteMatch } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";
import { useBreadcrumbsContext } from "../contexts/BreacrumbsContext";
import { CollectionTable } from "../collection/CollectionTable";
import { useSelectedEntityContext } from "../side_dialog/SelectedEntityContext";
import { createFormField } from "../form/form_factory";

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
    const editEnabled = view.editEnabled === undefined || view.editEnabled;

    const classes = useStyles();

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up("md"));

    function buildAddEntityButton() {
        const onClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            return selectedEntityContext.open({ collectionPath });
        };
        return matches ?
            <Button
                onClick={onClick}
                startIcon={<AddIcon/>}
                size="large"
                variant="contained"
                color="primary">
                Add {view.schema.name}
            </Button>
            : <Button
                onClick={onClick}
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
                             editEnabled={editEnabled}
                             deleteEnabled={deleteEnabled}
                             onEntityClick={onEntityClick}
                             additionalColumns={view.additionalColumns}
                             defaultSize={view.defaultSize}
                             paginationEnabled={view.pagination === undefined ? true : view.pagination}
                             initialFilter={view.initialFilter}
                             filterableProperties={view.filterableProperties}
                             properties={view.properties}
                             excludedProperties={view.excludedProperties}
                             onEntityDelete={(collectionPath: string, entity: Entity<any>) =>
                                 view.schema.onDelete && view.schema.onDelete({
                                     schema: view.schema,
                                     collectionPath,
                                     id: entity.id,
                                     entity: entity
                                 })}
                             title={title}
                             createFormField={createFormField}/>

        </Box>
    );
}
