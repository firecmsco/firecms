import React from "react";
import {
    AddIcon,
    Button,
    Container,
    DeleteConfirmationDialog,
    DeleteIcon,
    EntityCollection,
    EntityCustomView,
    IconButton,
    InfoLabel,
    Paper,
    resolveEntityView,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
    useFireCMSContext,
    User
} from "@firecms/core";
import { useFormikContext } from "formik";
import { CollectionEditorDialog } from "./CollectionEditorDialog";
import { CollectionsConfigController } from "../../types/config_controller";
import { PersistedCollection } from "../../types/persisted_collection";
import { CollectionInference } from "../../types/collection_inference";
import { EntityCustomViewsSelectDialog } from "./EntityCustomViewsSelectDialog";

export function SubcollectionsEditTab({
                                          collection,
                                          parentCollection,
                                          configController,
                                          collectionInference,
                                          getUser,
                                          parentPathSegments
                                      }: {
    collection: PersistedCollection,
    parentCollection?: EntityCollection,
    configController: CollectionsConfigController;
    collectionInference?: CollectionInference;
    getUser: (uid: string) => User | null;
    parentPathSegments?: string[];
}) {

    const { entityViews: contextEntityViews } = useFireCMSContext();

    const [subcollectionToDelete, setSubcollectionToDelete] = React.useState<string | undefined>();
    const [addEntityViewDialogOpen, setAddEntityViewDialogOpen] = React.useState<boolean>(false);
    const [viewToDelete, setViewToDelete] = React.useState<string | undefined>();

    const [currentDialog, setCurrentDialog] = React.useState<{
        isNewCollection: boolean,
        editedCollectionPath?: string,
    }>();

    const {
        values,
        setFieldValue,
    } = useFormikContext<EntityCollection>();

    const subcollections = collection.subcollections ?? [];
    const resolvedEntityViews = values.entityViews?.filter(e => typeof e === "string")
        .map(e => resolveEntityView(e, contextEntityViews))
        .filter(Boolean) as EntityCustomView[] ?? [];
    const hardCodedEntityViews = collection.entityViews?.filter(e => typeof e !== "string") as EntityCustomView[] ?? [];
    const totalEntityViews = resolvedEntityViews.length + hardCodedEntityViews.length;

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"2xl"} className={"flex flex-col gap-4 p-8 m-auto"}>
                <div className={"flex  flex-col gap-16"}>

                    <div className={"flex-grow flex flex-col gap-4 items-start"}>
                        <Typography variant={"h5"}>
                            Subcollections of {values.name}
                        </Typography>

                        {subcollections && subcollections.length > 0 &&
                            <Paper className={"flex flex-col gap-4 p-2 w-full"}>
                                <Table>
                                    <TableBody>
                                        {subcollections.map((subcollection) => (
                                            <TableRow key={subcollection.path}
                                                      onClick={() => setCurrentDialog({
                                                          isNewCollection: false,
                                                          editedCollectionPath: subcollection.path,
                                                      })}>
                                                <TableCell
                                                    align="left">
                                                    <Typography variant={"subtitle2"} className={"flex-grow"}>
                                                        {subcollection.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    align="right">
                                                    <Tooltip title={"Remove"}>
                                                        <IconButton size="small"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setSubcollectionToDelete(subcollection.path);
                                                                    }}
                                                                    color="inherit">
                                                            <DeleteIcon size={"small"}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>}

                        <Button
                            onClick={() => {
                                setCurrentDialog({
                                    isNewCollection: true
                                });
                            }}
                            variant={"outlined"}
                            startIcon={<AddIcon/>}>
                            Add subcollection
                        </Button>
                    </div>

                    <div className={"flex-grow  flex flex-col gap-4 items-start"}>
                        <Typography variant={"h5"}>
                            Custom views
                        </Typography>

                        {totalEntityViews > 0 && <>
                            <Paper className={"flex flex-col gap-4 p-2 w-full"}>
                                <Table>
                                    <TableBody>
                                        {resolvedEntityViews.map((view) => (
                                            <TableRow key={view.key}>
                                                <TableCell
                                                    align="left">
                                                    <Typography variant={"subtitle2"} className={"flex-grow"}>
                                                        {view.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    align="right">
                                                    <Tooltip title={"Remove"}>
                                                        <IconButton size="small"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        setViewToDelete(view.key);
                                                                    }}
                                                                    color="inherit">
                                                            <DeleteIcon size={"small"}/>
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {hardCodedEntityViews.map((view) => (
                                            <TableRow key={view.key}>
                                                <TableCell
                                                    align="left">
                                                    <Typography variant={"subtitle2"} className={"flex-grow"}>
                                                        {view.name}
                                                    </Typography>
                                                    <Typography variant={"caption"} className={"flex-grow"}>
                                                        This view is defined in code with
                                                        key <code>{view.key}</code>
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>

                        </>}

                        {totalEntityViews === 0 &&
                            <InfoLabel>
                                <b>COMING SOON</b> Define your own custom views by uploading it with the CLI
                            </InfoLabel>
                        }

                        <Button
                            onClick={() => {
                                setAddEntityViewDialogOpen(true);
                            }}
                            variant={"outlined"}
                            startIcon={<AddIcon/>}>
                            Add custom entity view
                        </Button>

                    </div>

                </div>
            </Container>

            {subcollectionToDelete &&
                <DeleteConfirmationDialog open={Boolean(subcollectionToDelete)}
                                          onAccept={() => {
                                              configController.deleteCollection({
                                                  path: subcollectionToDelete,
                                                  parentPathSegments: [...(parentPathSegments ?? []), collection.path]
                                              });
                                              setSubcollectionToDelete(undefined);
                                          }}
                                          onCancel={() => setSubcollectionToDelete(undefined)}
                                          title={<>Delete this subcollection?</>}
                                          body={<> This will <b>not
                                              delete any data</b>, only
                                              the collection in the CMS</>}/>}
            {viewToDelete &&
                <DeleteConfirmationDialog open={Boolean(viewToDelete)}
                                          onAccept={() => {
                                              setFieldValue("entityViews", values.entityViews?.filter(e => e !== viewToDelete));
                                              setViewToDelete(undefined);
                                          }}
                                          onCancel={() => setViewToDelete(undefined)}
                                          title={<>Remove this view?</>}
                                          body={<>This will <b>not
                                              delete any data</b>, only
                                              the view in the CMS</>}/>}

            <CollectionEditorDialog
                open={Boolean(currentDialog)}
                configController={configController}
                parentCollection={collection}
                collectionInference={collectionInference}
                parentPathSegments={[...parentPathSegments ?? [], values.path]}
                isNewCollection={false}
                {...currentDialog}
                getUser={getUser}
                handleClose={() => {
                    setCurrentDialog(undefined);
                }}/>

            <EntityCustomViewsSelectDialog
                open={addEntityViewDialogOpen}
                onClose={(selectedViewKey) => {
                    if (selectedViewKey) {
                        console.log("selectedViewKey", selectedViewKey);
                        setFieldValue("entityViews", [...(values.entityViews ?? []), selectedViewKey]);
                    }
                    setAddEntityViewDialogOpen(false);
                }}/>
        </div>
    );
}
