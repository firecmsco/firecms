import React from "react";
import {
    ConfirmationDialog,
    EntityCollection,
    EntityCustomView, getSubcollections,
    resolveEntityView,
    useCustomizationController,
    User
} from "@firecms/core";
import {
    AddIcon,
    Alert,
    Button,
    Container,
    DeleteIcon,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
} from "@firecms/ui";
import { CollectionEditorDialog } from "./CollectionEditorDialog";
import { CollectionsConfigController } from "../../types/config_controller";
import { PersistedCollection } from "../../types/persisted_collection";
import { CollectionInference } from "../../types/collection_inference";
import { EntityCustomViewsSelectDialog } from "./EntityCustomViewsSelectDialog";
import { useFormex } from "@firecms/formex";

export function SubcollectionsEditTab({
                                          collection,
                                          parentCollection,
                                          configController,
                                          collectionInference,
                                          getUser,
                                          parentCollectionIds
                                      }: {
    collection: PersistedCollection,
    parentCollection?: EntityCollection,
    configController: CollectionsConfigController;
    collectionInference?: CollectionInference;
    getUser?: (uid: string) => User | null;
    parentCollectionIds?: string[];
}) {

    const { entityViews: contextEntityViews } = useCustomizationController();

    const [subcollectionToDelete, setSubcollectionToDelete] = React.useState<string | undefined>();
    const [addEntityViewDialogOpen, setAddEntityViewDialogOpen] = React.useState<boolean>(false);
    const [viewToDelete, setViewToDelete] = React.useState<string | undefined>();

    const [currentDialog, setCurrentDialog] = React.useState<{
        isNewCollection: boolean,
        editedCollectionId?: string,
    }>();

    const {
        values,
        setFieldValue,
    } = useFormex<EntityCollection>();

    const [subcollections, setSubcollections] = React.useState<EntityCollection[]>(getSubcollections(collection) ?? []);
    const resolvedEntityViews = values.entityViews?.filter(e => typeof e === "string")
        .map(e => resolveEntityView(e, contextEntityViews))
        .filter(Boolean) as EntityCustomView[] ?? [];
    const hardCodedEntityViews = collection.entityViews?.filter(e => typeof e !== "string") as EntityCustomView[] ?? [];
    const totalEntityViews = resolvedEntityViews.length + hardCodedEntityViews.length;

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"2xl"} className={"flex flex-col gap-4 p-8 m-auto"}>
                <div className={"flex  flex-col gap-16"}>

                    <div className={"grow flex flex-col gap-4 items-start"}>
                        <Typography variant={"h5"}>
                            Subcollections of {values.name}
                        </Typography>

                        <Paper className={"flex flex-col gap-4 p-2 w-full"}>
                            {subcollections && subcollections.length > 0 && <Table>
                                <TableBody>
                                    {subcollections.map((subcollection) => (
                                        <TableRow key={subcollection.slug}
                                                  onClick={() => setCurrentDialog({
                                                      isNewCollection: false,
                                                      editedCollectionId: subcollection.slug
                                                  })}>
                                            <TableCell
                                                align="left">
                                                <Typography variant={"subtitle2"} className={"grow"}>
                                                    {subcollection.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                align="right">
                                                <Tooltip title={"Remove"}
                                                         asChild={true}>
                                                    <IconButton size="small"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setSubcollectionToDelete(subcollection.slug);
                                                                }}
                                                                color="inherit">
                                                        <DeleteIcon size={"small"}/>
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>}

                            <Button
                                onClick={() => {
                                    setCurrentDialog({
                                        isNewCollection: true
                                    });
                                }}
                                variant={"text"}
                                startIcon={<AddIcon/>}>
                                Add subcollection
                            </Button>

                        </Paper>

                    </div>

                    <div className={"grow  flex flex-col gap-4 items-start"}>
                        <Typography variant={"h5"}>
                            Custom views
                        </Typography>

                        {totalEntityViews === 0 &&
                            <Alert action={<Button variant="text"
                                                   size={"small"}
                                                   href={"https://firecms.co/docs/cloud/quickstart"}
                                                   component={"a"}
                                                   rel="noopener noreferrer"
                                                   target="_blank">More info</Button>}>
                                Define your own custom views by uploading them with the CLI.
                            </Alert>
                        }

                        {<>
                            <Paper className={"flex flex-col gap-4 p-2 w-full"}>
                                <Table>
                                    <TableBody>
                                        {resolvedEntityViews.map((view) => (
                                            <TableRow key={view.key}>
                                                <TableCell
                                                    align="left">
                                                    <Typography variant={"subtitle2"} className={"grow"}>
                                                        {view.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell
                                                    align="right">
                                                    <Tooltip title={"Remove"}
                                                             asChild={true}>
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
                                                    <Typography variant={"subtitle2"} className={"grow"}>
                                                        {view.name}
                                                    </Typography>
                                                    <Typography variant={"caption"} className={"grow"}>
                                                        This view is defined in code with
                                                        key <code>{view.key}</code>
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Button
                                    onClick={() => {
                                        setAddEntityViewDialogOpen(true);
                                    }}
                                    variant={"text"}
                                    startIcon={<AddIcon/>}>
                                    Add custom entity view
                                </Button>
                            </Paper>

                        </>}


                    </div>

                </div>
            </Container>

            <div style={{ height: "52px" }}/>

            {subcollectionToDelete &&
                <ConfirmationDialog open={Boolean(subcollectionToDelete)}
                                    onAccept={() => {
                                              const props = {
                                                  id: subcollectionToDelete,
                                                  parentCollectionIds: [...(parentCollectionIds ?? []), collection.slug]
                                              };
                                              console.debug("Deleting subcollection", props)
                                              configController.deleteCollection(props).then(() => {
                                                  setSubcollectionToDelete(undefined);
                                                  setSubcollections(subcollections?.filter(e => e.slug !== subcollectionToDelete))
                                              });
                                          }}
                                    onCancel={() => setSubcollectionToDelete(undefined)}
                                    title={<>Delete this subcollection?</>}
                                    body={<> This will <b>not
                                              delete any data</b>, only
                                              the collection in the CMS</>}/>}
            {viewToDelete &&
                <ConfirmationDialog open={Boolean(viewToDelete)}
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
                parentCollectionIds={[...parentCollectionIds ?? [], values.slug]}
                isNewCollection={false}
                {...currentDialog}
                getUser={getUser}
                handleClose={(updatedCollection) => {
                    if (updatedCollection && !subcollections.map(e => e.slug).includes(updatedCollection.slug)) {
                        setSubcollections([...subcollections, updatedCollection]);
                    }
                    setCurrentDialog(undefined);
                }}/>

            <EntityCustomViewsSelectDialog
                open={addEntityViewDialogOpen}
                onClose={(selectedViewKey) => {
                    if (selectedViewKey) {
                        setFieldValue("entityViews", [...(values.entityViews ?? []), selectedViewKey]);
                    }
                    setAddEntityViewDialogOpen(false);
                }}/>
        </div>
    );
}
