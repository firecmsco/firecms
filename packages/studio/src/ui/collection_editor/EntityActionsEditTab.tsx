import React from "react";
import {
    ConfirmationDialog,
    EntityAction,
    EntityCollection,
    resolveEntityAction,
    useCustomizationController
} from "@rebasepro/core";
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
} from "@rebasepro/ui";
import { PersistedCollection } from "../../types/persisted_collection";
import { useFormex } from "@rebasepro/formex";
import { EntityActionsSelectDialog } from "./EntityActionsSelectDialog";

export function EntityActionsEditTab({
    collection,
    embedded = false
}: {
    collection: PersistedCollection,
    embedded?: boolean;
}) {

    const { entityActions: contextEntityActions } = useCustomizationController();

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
        <div className={"flex flex-col gap-12"}>
            <div className={"flex-grow flex flex-col gap-4 items-start w-full"}>
                <Typography variant={"h6"}>
                    Custom actions
                </Typography>

                {<>
                    <div className={"flex flex-col gap-4 w-full"}>
                        {totalEntityActions > 0 && <Table>
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
                                            <Tooltip title={"Remove"}
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
                                                This action is defined in code with
                                                key <code>{action.key}</code>
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>}

                        <Button
                            onClick={() => {
                                setAddEntityActionDialogOpen(true);
                            }}
                            variant="filled"
                            color="neutral"
                            startIcon={<AddIcon />}>
                            Add custom entity action
                        </Button>
                    </div>

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
                    title={<>Remove this action?</>}
                    body={<>This will <b>not
                        delete any data</b>, only
                        the action in the CMS</>} />}

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
