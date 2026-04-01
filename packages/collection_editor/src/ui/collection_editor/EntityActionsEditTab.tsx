import React from "react";
import {
    ConfirmationDialog,
    EntityAction,
    EntityCollection,
    resolveEntityAction,
    useCustomizationController,
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
import { PersistedCollection } from "../../types/persisted_collection";
import { useFormex } from "@firecms/formex";
import { EntityActionsSelectDialog } from "./EntityActionsSelectDialog";

export function EntityActionsEditTab({
    collection,
    embedded = false
}: {
    collection: PersistedCollection,
    embedded?: boolean;
}) {

    const { entityActions: contextEntityActions } = useCustomizationController();
    const { t } = useTranslation();

    const [addEntityActionDialogOpen, setAddEntityActionDialogOpen] = React.useState<boolean>(false);
    const [actionToDelete, setActionToDelete] = React.useState<string | undefined>();

    const {
        values,
        setFieldValue
    } = useFormex<EntityCollection>();

    const resolvedEntityActions = values.entityActions?.filter((e): e is string => typeof e === "string")
        .map(e => resolveEntityAction(e, contextEntityActions))
        .filter(Boolean) as EntityAction<any>[] ?? [];
    const hardCodedEntityActions = collection.entityActions?.filter((e): e is EntityAction<any> => typeof e !== "string") ?? [];
    const totalEntityActions = resolvedEntityActions.length + hardCodedEntityActions.length;

    const content = (
        <div className={"flex flex-col gap-16"}>
            <div className={"flex-grow flex flex-col gap-4 items-start"}>
                <Typography variant={"h6"}>
                    {t("custom_actions")}
                </Typography>

                {totalEntityActions === 0 &&
                    <Alert action={<Button variant="text"
                        size={"small"}
                        href={"https://firecms.co/docs/custom_actions"}
                        component={"a"}
                        rel="noopener noreferrer"
                        target="_blank">{t("more_info")}</Button>}>
                        {t("define_custom_actions_cli")}
                    </Alert>
                }

                {<>
                    <Paper className={"flex flex-col gap-4 p-2 w-full"}>
                        <Table>
                            <TableBody>
                                {resolvedEntityActions.map((action) => (
                                    <TableRow key={action.key}>
                                        <TableCell
                                            align="left">
                                            <Typography variant={"subtitle2"} className={"flex-grow"}>
                                                {action.name}
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
                                                        setActionToDelete(action.key);
                                                    }}
                                                    color="inherit">
                                                    <DeleteIcon size={"small"} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {hardCodedEntityActions.map((action) => (
                                    <TableRow key={action.key}>
                                        <TableCell
                                            align="left">
                                            <Typography variant={"subtitle2"} className={"flex-grow"}>
                                                {action.name}
                                            </Typography>
                                            <Typography variant={"caption"} className={"flex-grow"}>
                                                {t("action_defined_in_code")} <code>{action.key}</code>
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Button
                            onClick={() => {
                                setAddEntityActionDialogOpen(true);
                            }}
                            startIcon={<AddIcon />}>
                            {t("add_custom_entity_action")}
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

            {actionToDelete &&
                <ConfirmationDialog open={Boolean(actionToDelete)}
                    onAccept={() => {
                        setFieldValue("entityActions", values.entityActions?.filter(e => e !== actionToDelete));
                        setActionToDelete(undefined);
                    }}
                    onCancel={() => setActionToDelete(undefined)}
                    title={<>{t("remove_this_action")}</>}
                    body={<>{t("remove_action_warning")}</>} />}

            <EntityActionsSelectDialog
                open={addEntityActionDialogOpen}
                onClose={(selectedActionKey) => {
                    if (selectedActionKey) {
                        console.log("Selected action key:", selectedActionKey);
                        const value = [...(values.entityActions ?? []), selectedActionKey]
                            // only actions that are defined in the registry
                            .filter((e): e is string => typeof e === "string" && (contextEntityActions ?? []).some(action => action.key === e));
                        ;
                        setFieldValue("entityActions", value);
                    }
                    setAddEntityActionDialogOpen(false);
                }} />
        </>
    );
}
