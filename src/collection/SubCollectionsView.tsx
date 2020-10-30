import React from "react";
import { Box, Button, Grid, Paper, Tab, Tabs, Typography } from "@material-ui/core";
import { Entity, EntityCollectionView, EntitySchema } from "../models";
import { Link as ReactLink } from "react-router-dom";
import {
    getRouterNewEntityPath,
    removeInitialSlash
} from "../routes/navigation";
import DeleteEntityDialog from "./DeleteEntityDialog";
import { formStyles } from "../styles";
import { CollectionTable } from "./CollectionTable";


interface SubCollectionViewProps<S extends EntitySchema> {

    parentCollectionPath: string;
    subcollections: EntityCollectionView<any>[];
    entity?: Entity<S>;

    onEntityClick?(collectionPath: string,
                   entity: Entity<any>,
                   schema: EntitySchema<any>,
                   subcollections?: EntityCollectionView<any>[]): void;

    onEntityEdit?(collectionPath: string,
                  entity: Entity<any>,
                  schema: EntitySchema<any>,
                  subcollections?: EntityCollectionView<any>[]): void;

}

export default function SubCollectionsView<S extends EntitySchema>(
    {
        parentCollectionPath,
        subcollections,
        entity,
        onEntityClick,
        onEntityEdit
    }: SubCollectionViewProps<S>) {

    if (!subcollections) {
        throw Error("Subcollection view must use a schema with subcollection entries");
    }

    const classes = formStyles();

    const firstSubcollection = Object.values(subcollections)[0];
    const [selectedView, setSelectedView] = React.useState<EntityCollectionView<any>>(firstSubcollection);
    const [deleteEntityClicked, setDeleteEntityClicked] = React.useState<Entity<S> | undefined>(undefined);

    const onEntityDelete = (collectionPath: string, entity: Entity<S>) => {
        setDeleteEntityClicked(entity);
    };

    function _onViewClicked(view: EntityCollectionView<any>) {
        setSelectedView(view);
    }

    let subcollectionPath: string | undefined = undefined;
    if (entity)
        subcollectionPath = `${parentCollectionPath}/${entity.id}/${removeInitialSlash(selectedView.relativePath)}`;

    return (

        <Paper elevation={0}
               className={classes.formPaper}
               style={{ height: "100%" }}>

            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="flex-end"
            >
                <Tabs value={selectedView}
                      onChange={(e, value) => _onViewClicked(value)}>
                    {Object.entries(subcollections).map(([key, view]) => (
                        <Tab label={view.name} value={view}
                             key={`wrapped-tab-${key}`}/>
                    ))}
                </Tabs>
            </Grid>

            {Object.entries(subcollections).map(([key, view]) => {
                const onSubcollectionEntityClick = (collectionPath: string, entity: Entity<any>) => {
                    if (onEntityClick)
                        onEntityClick(collectionPath, entity, view.schema, view.subcollections);
                };
                const onSubcollectionEntityEdit = (collectionPath: string, entity: Entity<any>) => {
                    if (onEntityEdit)
                        onEntityEdit(collectionPath, entity, view.schema, view.subcollections);
                };

                const title =
                    <Typography variant={"caption"} color={"textSecondary"}>
                        {`/${subcollectionPath}`}
                    </Typography>;

                const deleteEnabled = view.deleteEnabled === undefined || view.deleteEnabled;

                return (
                <Box
                    style={{ height: "500px" }}
                    hidden={selectedView !== view}>

                    {subcollectionPath ?
                        <CollectionTable collectionPath={subcollectionPath}
                                         title={title}
                                         onEntityDelete={deleteEnabled ? onEntityDelete : undefined}
                                         schema={view.schema}
                                         onEntityEdit={onSubcollectionEntityEdit}
                                         onEntityClick={onSubcollectionEntityClick}
                                         includeToolbar={true}
                                         paginationEnabled={false}
                                         additionalColumns={view.additionalColumns}
                                         defaultSize={view.defaultSize}
                                         actions={
                                             <Button
                                                 component={ReactLink}
                                                 to={getRouterNewEntityPath(subcollectionPath)}
                                                 size="medium"
                                                 variant="outlined"
                                                 color="primary"
                                             >
                                                 Add {selectedView.schema.name}
                                             </Button>
                                         }
                        />
                        :
                        <Box m={3}
                             display={"flex"}
                             alignItems={"center"}
                             justifyContent={"center"}>
                            <Box>
                                You need to save your entity before adding
                                additional collections
                            </Box>
                        </Box>
                    }

                    <DeleteEntityDialog entity={deleteEntityClicked}
                                        schema={view.schema}
                                        open={!!deleteEntityClicked}
                                        onClose={() => setDeleteEntityClicked(undefined)}/>
                </Box>
                );
            })}

        </Paper>
    );
}

