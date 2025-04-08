import React, { useMemo } from "react";
import { Entity, EntityAction, FireCMSContext, ResolvedEntityCollection, SideEntityController } from "../types";

import { copyEntityAction, deleteEntityAction } from "../components";
import { canCreateEntity, canDeleteEntity, mergeEntityActions } from "../util";
import { Button, cls, defaultBorderMixin, DialogActions, IconButton, LoadingButton, Typography } from "@firecms/ui";
import { useAuthController, useFireCMSContext, useSideEntityController } from "../hooks";
import { EntityFormActionsProps } from "../form/EntityFormActions";
import { SideDialogController, useSideDialogContext } from "./SideDialogs";

export function EntityEditViewFormActions({
                                              collection,
                                              path,
                                              entity,
                                              layout,
                                              savingError,
                                              formex,
                                              disabled,
                                              status,
                                              pluginActions,
                                              openEntityMode,
                                              showDefaultActions = true
                                          }: EntityFormActionsProps) {

    const authController = useAuthController();
    const context = useFireCMSContext();
    const sideEntityController = useSideEntityController();
    const sideDialogContext = useSideDialogContext();

    const entityActions = useMemo((): EntityAction[] => {
        const customEntityActions = collection.entityActions
        const createEnabled = canCreateEntity(collection, authController, path, null);
        const deleteEnabled = entity ? canDeleteEntity(collection, authController, path, entity) : false;
        const actions: EntityAction[] = [];
        if (createEnabled)
            actions.push(copyEntityAction);
        if (deleteEnabled)
            actions.push(deleteEntityAction);
        if (customEntityActions)
            return mergeEntityActions(actions, customEntityActions);
        return actions;
    }, [authController, collection, path]);

    const formActions = showDefaultActions ? entityActions.filter(a => a.includeInForm === undefined || a.includeInForm) : [];

    return layout === "bottom"
        ? buildBottomActions({
            savingError,
            entity,
            formActions,
            collection,
            context,
            sideEntityController,
            isSubmitting: formex.isSubmitting,
            disabled,
            status,
            sideDialogContext,
            pluginActions,
            openEntityMode,
        })
        : buildSideActions({
            savingError,
            entity,
            formActions,
            collection,
            context,
            sideEntityController,
            isSubmitting: formex.isSubmitting,
            sideDialogContext,
            disabled,
            status,
            pluginActions,
            openEntityMode,
        });
}

type ActionsViewProps<M extends object> = {
    savingError: Error | undefined,
    entity: Entity<M> | undefined,
    formActions: EntityAction[],
    collection: ResolvedEntityCollection,
    context: FireCMSContext,
    sideEntityController: SideEntityController,
    isSubmitting: boolean,
    disabled: boolean,
    status: "new" | "existing" | "copy",
    sideDialogContext: SideDialogController,
    pluginActions?: React.ReactNode[],
    openEntityMode: "side_panel" | "full_screen";
};

function buildBottomActions<M extends object>({
                                                  savingError,
                                                  entity,
                                                  formActions,
                                                  collection,
                                                  context,
                                                  sideEntityController,
                                                  isSubmitting,
                                                  disabled,
                                                  status,
                                                  sideDialogContext,
                                                  pluginActions,
                                                  openEntityMode,
                                              }: ActionsViewProps<M>) {

    const canClose = openEntityMode === "side_panel";
    return <DialogActions position={"absolute"}>
        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }
        {entity && formActions.length > 0 && <div className="grow flex overflow-auto no-scrollbar">
            {formActions.map(action => (
                <IconButton
                    key={action.name}
                    color="primary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        event.stopPropagation();
                        if (entity)
                            action.onClick({
                                entity,
                                fullPath: collection.path,
                                collection: collection,
                                context,
                                sideEntityController,
                                openEntityMode: openEntityMode
                            });
                    }}>
                    {action.icon}
                </IconButton>
            ))}
        </div>}
        {pluginActions}
        <Button variant="text" disabled={disabled || isSubmitting} type="reset">
            {status === "existing" ? "Discard" : "Clear"}
        </Button>
        <Button variant={canClose ? "text" : "filled"} color="primary" type="submit"
                disabled={disabled || isSubmitting}
                onClick={() => {
                    sideDialogContext.setPendingClose(false);
                }}>
            {status === "existing" && "Save"}
            {status === "copy" && "Create copy"}
            {status === "new" && "Create"}
        </Button>
        {canClose && <LoadingButton variant="filled"
                                    color="primary"
                                    type="submit"
                                    loading={isSubmitting}
                                    disabled={disabled}
                                    onClick={() => {
                                        sideDialogContext.setPendingClose?.(true);
                                    }}>
            {status === "existing" && "Save and close"}
            {status === "copy" && "Create copy and close"}
            {status === "new" && "Create and close"}
        </LoadingButton>}
    </DialogActions>;
}

function buildSideActions<M extends object>({
                                                savingError,
                                                entity,
                                                formActions,
                                                collection,
                                                context,
                                                sideEntityController,
                                                isSubmitting,
                                                disabled,
                                                status,
                                                sideDialogContext,
                                                pluginActions
                                            }: ActionsViewProps<M>) {

    return <div
        className={cls("overflow-auto h-full flex flex-col gap-2 w-80 2xl:w-96 px-4 py-16 sticky top-0 border-l", defaultBorderMixin)}>
        <LoadingButton fullWidth={true} variant="filled" color="primary" type="submit" size={"large"}
                       disabled={disabled || isSubmitting} onClick={() => {
            sideDialogContext.setPendingClose?.(false);
        }}>
            {status === "existing" && "Save"}
            {status === "copy" && "Create copy"}
            {status === "new" && "Create"}
        </LoadingButton>
        <Button fullWidth={true} variant="text" disabled={disabled || isSubmitting} type="reset">
            {status === "existing" ? "Discard" : "Clear"}
        </Button>

        {pluginActions}

        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }
    </div>;
}
