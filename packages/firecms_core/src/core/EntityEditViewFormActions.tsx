import React, { useMemo } from "react";
import {
    Entity,
    EntityAction,
    FireCMSContext,
    FormContext,
    ResolvedEntityCollection,
    SideEntityController
} from "../types";

import { copyEntityAction, deleteEntityAction } from "../components";
import { canCreateEntity, canDeleteEntity, mergeEntityActions, resolveEntityAction } from "../util";
import {
    Button,
    cls,
    defaultBorderMixin,
    DialogActions,
    IconButton,
    LoadingButton,
    Tooltip,
    Typography
} from "@firecms/ui";
import { useAuthController, useCustomizationController, useFireCMSContext, useSideEntityController } from "../hooks";
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
                                              showDefaultActions = true,
                                              navigateBack,
                                              formContext
                                          }: EntityFormActionsProps) {

    const authController = useAuthController();
    const context = useFireCMSContext();
    const sideEntityController = useSideEntityController();
    const sideDialogContext = useSideDialogContext();
    const customizationController = useCustomizationController();

    const entityActions = useMemo((): EntityAction[] => {
        const customEntityActions = (collection.entityActions ?? [])
            .map(action => resolveEntityAction(action, customizationController.entityActions))
            .filter(Boolean) as EntityAction[];
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
    }, [authController, collection, path, customizationController.entityActions?.length]);

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
            navigateBack,
            formContext
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
            navigateBack,
            formContext
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
    navigateBack: () => void;
    formContext: FormContext
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
                                                  navigateBack,
                                                  formContext
                                              }: ActionsViewProps<M>) {

    const canClose = openEntityMode === "side_panel";
    return <DialogActions position={"absolute"}>
        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }

        {formActions.length > 0 && <div className="flex-grow flex overflow-auto no-scrollbar">
            {formActions.map(action => {
                const props = {
                    entity,
                    fullPath: collection.path,
                    collection: collection,
                    context,
                    sideEntityController,
                    openEntityMode,
                    navigateBack,
                    formContext
                };
                const isEnabled = !action.isEnabled || action.isEnabled(props);
                return (
                    <Tooltip
                        key={action.key}
                        title={action.name}>
                        <IconButton
                            color="primary"
                            disabled={!isEnabled}
                            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                event.stopPropagation();
                                if (entity) {
                                    action.onClick(props);
                                }
                            }}>
                            {action.icon}
                        </IconButton>
                    </Tooltip>
                );
            })}
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
                                                pluginActions,
                                                openEntityMode,
                                                navigateBack,
                                                formContext
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

        {formActions.length > 0 && <div className="flex flex-row flex-wrap mt-2">
            {formActions.map(action => {
                const props = {
                    entity,
                    fullPath: collection.path,
                    collection: collection,
                    context,
                    sideEntityController,
                    openEntityMode,
                    navigateBack,
                    formContext
                };
                const isEnabled = !action.isEnabled || action.isEnabled(props);
                return (
                    <Tooltip
                        key={action.key}
                        title={action.name}>
                        <IconButton
                            color="primary"
                            disabled={!isEnabled}
                            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                event.stopPropagation();
                                if (entity) {
                                    action.onClick(props);
                                }
                            }}>
                            {action.icon}
                        </IconButton>
                    </Tooltip>
                );
            })}
        </div>}

        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }
    </div>;
}
