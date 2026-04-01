import React from "react";
import {
    ConfirmationDialog,
    EntityCollection,
    EntityCustomView,
    resolveEntityView,
    useCustomizationController,
    User,
    useTranslation
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
    parentCollectionIds,
    embedded = false
}: {
    collection: PersistedCollection,
    parentCollection?: EntityCollection,
    configController: CollectionsConfigController;
    collectionInference?: CollectionInference;
    getUser?: (uid: string) => User | null;
    parentCollectionIds?: string[];
    embedded?: boolean;
}) {

    const { entityViews: contextEntityViews } = useCustomizationController();
    const { t } = useTranslation();

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

    const [subcollections, setSubcollections] = React.useState<EntityCollection[]>(collection.subcollections ?? []);
    const resolvedEntityViews = values.entityViews?.filter(e => typeof e === "string")
        .map(e => resolveEntityView(e, contextEntityViews))
        .filter(Boolean) as EntityCustomView[] ?? [];
    const hardCodedEntityViews = collection.entityViews?.filter(e => typeof e !== "string") as EntityCustomView[] ?? [];
    const totalEntityViews = resolvedEntityViews.length + hardCodedEntityViews.length;

    const content = (
        <div className={"flex flex-col gap-16"}>

            <div className={"flex-grow flex flex-col gap-4 items-start"}>
                <Typography variant={"h6"}>
                    {t("subcollections_of")} {values.name}
                </Typography>

                <Paper className={"flex flex-col gap-4 p-2 w-full"}>
                    {subcollections && subcollections.length > 0 && <Table>
                        <TableBody>
                            {subcollections.map((subcollection) => (
                                <TableRow key={subcollection.path}
                                    onClick={() => setCurrentDialog({
                                        isNewCollection: false,
                                        editedCollectionId: subcollection.id
                                    })}>
                                    <TableCell
                                        align="left">
                                        <Typography variant={"subtitle2"} className={"flex-grow"}>
                                            {subcollection.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell
                                        align="right">
                                        <Tooltip title={t("remove")}
                                            asChild={true}>
                                            <IconButton size="small"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSubcollectionToDelete(subcollection.id);
                                                }}
                                                color="inherit">
                                                <DeleteIcon size={"small"} />
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
                        startIcon={<AddIcon />}>
                        {t("add_subcollection")}
                    </Button>

                </Paper>

            </div>

            <div className={"flex-grow  flex flex-col gap-4 items-start"}>
                <Typography variant={"h6"}>
                    {t("custom_views")}
                </Typography>

                {totalEntityViews === 0 &&
                    <Alert action={<Button variant="text"
                        size={"small"}
                        href={"https://firecms.co/docs/cloud/quickstart"}
                        component={"a"}
                        rel="noopener noreferrer"
                        target="_blank">{t("more_info")}</Button>}>
                        {t("define_custom_views_cli")}
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
                                            <Typography variant={"subtitle2"} className={"flex-grow"}>
                                                {view.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            align="right">
                                            <Tooltip title={t("remove")}
                                                asChild={true}>
                                                <IconButton size="small"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setViewToDelete(view.key);
                                                    }}
                                                    color="inherit">
                                                    <DeleteIcon size={"small"} />
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
                                                {t("view_defined_in_code")} <code>{view.key}</code>
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
                            startIcon={<AddIcon />}>
                            {t("add_custom_entity_view")}
                        </Button>
                    </Paper>

                </>}


            </div>

        </div>
    );

    return (
        <>
            {embedded ? (
                content
            ) : (
                <div className={"overflow-auto my-auto"}>
                    <Container maxWidth={"2xl"} className={"flex flex-col gap-4 p-8 m-auto"}>
                        {content}
                    </Container>
                    <div style={{ height: "52px" }} />
                </div>
            )}

            {subcollectionToDelete &&
                <ConfirmationDialog open={Boolean(subcollectionToDelete)}
                    onAccept={() => {
                        const props = {
                            id: subcollectionToDelete,
                            parentCollectionIds: [...(parentCollectionIds ?? []), collection.id]
                        };
                        console.debug("Deleting subcollection", props)
                        configController.deleteCollection(props).then(() => {
                            setSubcollectionToDelete(undefined);
                            setSubcollections(subcollections?.filter(e => e.id !== subcollectionToDelete))
                        });
                    }}
                    onCancel={() => setSubcollectionToDelete(undefined)}
                    title={<>{t("delete_this_subcollection")}</>}
                    body={<>{t("remove_collection_warning")}</>} />}
            {viewToDelete &&
                <ConfirmationDialog open={Boolean(viewToDelete)}
                    onAccept={() => {
                        setFieldValue("entityViews", values.entityViews?.filter(e => e !== viewToDelete));
                        setViewToDelete(undefined);
                    }}
                    onCancel={() => setViewToDelete(undefined)}
                    title={<>{t("remove_this_view")}</>}
                    body={<>{t("remove_view_warning")}</>} />}

            <CollectionEditorDialog
                open={Boolean(currentDialog)}
                configController={configController}
                parentCollection={collection}
                collectionInference={collectionInference}
                parentCollectionIds={[...parentCollectionIds ?? [], values.id]}
                isNewCollection={false}
                {...currentDialog}
                getUser={getUser}
                handleClose={(updatedCollection) => {
                    if (updatedCollection && !subcollections.map(e => e.id).includes(updatedCollection.id)) {
                        setSubcollections([...subcollections, updatedCollection]);
                    }
                    setCurrentDialog(undefined);
                }} />

            <EntityCustomViewsSelectDialog
                open={addEntityViewDialogOpen}
                onClose={(selectedViewKey) => {
                    if (selectedViewKey) {
                        setFieldValue("entityViews", [...(values.entityViews ?? []), selectedViewKey]);
                    }
                    setAddEntityViewDialogOpen(false);
                }} />
        </>
    );
}
