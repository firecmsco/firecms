import React, { useMemo } from "react";
import {
    Entity,
    EntityAction,
    EntityActionClickProps,
    EntityCollection,
    EntityFormActionsProps,
    FireCMSContext,
    FormContext,
    SideEntityController
} from "@firecms/types";

import { copyEntityAction, deleteEntityAction } from "../components";
import { canCreateEntity, canDeleteEntity, mergeEntityActions, resolveEntityAction } from "@firecms/common";
import {
    Button,
    CircularProgress,
    cls,
    defaultBorderMixin,
    DialogActions,
    ErrorIcon,
    IconButton,
    LoadingButton,
    Tooltip,
    Typography
} from "@firecms/ui";
import {
    useAuthController,
    useCustomizationController,
    useFireCMSContext,
    useSideEntityController,
    useSnackbarController
} from "../hooks";
import { SideDialogController, useSideDialogContext } from "./SideDialogs";
import { FormexController } from "@firecms/formex";
import { ErrorTooltip } from "../components/ErrorTooltip";

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
            disabled,
            status,
            sideDialogContext,
            pluginActions,
            openEntityMode,
            navigateBack,
            formContext,
            formex
        })
        : buildSideActions({
            savingError,
            entity,
            formActions,
            collection,
            context,
            sideEntityController,
            sideDialogContext,
            disabled,
            status,
            pluginActions,
            openEntityMode,
            navigateBack,
            formContext,
            formex
        });
}

type ActionsViewProps<M extends object> = {
    savingError: Error | undefined,
    entity: Entity<M> | undefined,
    formActions: EntityAction[],
    collection: EntityCollection,
    context: FireCMSContext,
    sideEntityController: SideEntityController,
    disabled: boolean,
    status: "new" | "existing" | "copy",
    sideDialogContext: SideDialogController,
    pluginActions?: React.ReactNode[],
    openEntityMode: "side_panel" | "full_screen";
    navigateBack: () => void;
    formContext: FormContext,
    formex: FormexController<any>;
};

function buildBottomActions<M extends object>({
                                                  savingError,
                                                  entity,
                                                  formActions,
                                                  collection,
                                                  context,
                                                  sideEntityController,
                                                  disabled,
                                                  status,
                                                  sideDialogContext,
                                                  pluginActions,
                                                  openEntityMode,
                                                  navigateBack,
                                                  formContext,
                                                  formex
                                              }: ActionsViewProps<M>) {

    const hasErrors = Object.keys(formex.errors).length > 0 && formex.submitCount > 0;
    const canClose = openEntityMode === "side_panel";
    return <DialogActions
        position={"absolute"}>
        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }

        {formActions.length > 0 && <div className="grow flex overflow-auto no-scrollbar">
            {formActions.map(action => {

                const props = {
                    view: "form",
                    entity,
                    path: collection.slug,
                    collection: collection,
                    context,
                    sideEntityController,
                    openEntityMode,
                    navigateBack,
                    formContext
                } satisfies EntityActionClickProps<any>;

                const isEnabled = !action.isEnabled || action.isEnabled(props);
                return (
                    <EntityActionButton
                        key={action.key}
                        action={action}
                        enabled={isEnabled}
                        props={props}
                    />
                );
            })}
        </div>}

        {pluginActions}

        {hasErrors ?
            <ErrorTooltip title={"This form has errors"}>
                <ErrorIcon className="ml-4" color="error" size={"smallest"}/>
            </ErrorTooltip> : null}
        <Button variant="text"
                color="primary"
                disabled={disabled || formex.isSubmitting}
                type="reset">
            {status === "existing" ? "Discard" : "Clear"}
        </Button>
        <Button variant={canClose ? "text" : "filled"}
                color="primary"
                type="submit"
                disabled={disabled || formex.isSubmitting}
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
                                    loading={formex.isSubmitting}
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
                                                disabled,
                                                status,
                                                sideDialogContext,
                                                pluginActions,
                                                openEntityMode,
                                                navigateBack,
                                                formContext,
                                                formex
                                            }: ActionsViewProps<M>) {

    const hasErrors = Object.keys(formex.errors).length > 0 && formex.submitCount > 0;
    return <div
        className={cls("overflow-auto h-full flex flex-col gap-2 w-80 2xl:w-96 px-4 py-16 sticky top-0 border-l", defaultBorderMixin)}>
        <LoadingButton fullWidth={true}
                       variant="filled"
                       color="primary"
                       type="submit"
                       size={"large"}
                       startIcon={hasErrors ? <ErrorIcon/> : undefined}
                       disabled={disabled || formex.isSubmitting}
                       onClick={() => {
                           sideDialogContext.setPendingClose?.(false);
                       }}>
            {status === "existing" && "Save"}
            {status === "copy" && "Create copy"}
            {status === "new" && "Create"}
        </LoadingButton>

        <Button fullWidth={true} variant="text" disabled={disabled || formex.isSubmitting} type="reset">
            {status === "existing" ? "Discard" : "Clear"}
        </Button>

        {pluginActions}

        {formActions.length > 0 && <div className="flex flex-row flex-wrap mt-2">
            {formActions.map(action => {
                const props = {
                    view: "form",
                    entity,
                    path: collection.slug,
                    collection: collection,
                    context,
                    sideEntityController,
                    openEntityMode,
                    navigateBack,
                    formContext
                } satisfies EntityActionClickProps<any>;
                const isEnabled = !action.isEnabled || action.isEnabled(props);
                return (
                    <EntityActionButton key={action.key} action={action} enabled={isEnabled} props={props}/>
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

function EntityActionButton({
                                action,
                                enabled,
                                props
                            }: {
    action: EntityAction,
    enabled: boolean,
    props: EntityActionClickProps<any, any>
}) {
    const snackbarController = useSnackbarController();
    const [loading, setLoading] = React.useState(false);
    return <Tooltip
        title={action.name}>
        <IconButton
            color="primary"
            disabled={!enabled}
            onClick={(event) => {
                console.debug("Executing action", action.key, props);
                try {
                    event.stopPropagation();
                    if (props.entity) {
                        const onClick = action.onClick(props);
                        // If the action returns a promise, we can handle it
                        if (onClick instanceof Promise) {
                            setLoading(true);
                            onClick
                                .catch((error) => {
                                    console.error("Error executing action", action.key, error);
                                    snackbarController.open({
                                        message: `Error executing action: ${error.message}`,
                                        type: "error"
                                    })
                                })
                                .finally(() => setLoading(false));
                        } else {
                            snackbarController.open({
                                message: `Action ${action.name} executed successfully`,
                                type: "success"
                            });
                        }

                    }
                } catch (e: any) {
                    console.error("Error executing action", action.key, e);
                    snackbarController.open({
                        message: `Error executing action: ${e.message}`,
                        type: "error"
                    });
                }
            }}>
            {loading ? <CircularProgress size={"smallest"}/> : action.icon}
        </IconButton>
    </Tooltip>;
}
