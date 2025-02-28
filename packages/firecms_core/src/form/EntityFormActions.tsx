import React from "react";
import { Entity, EntityAction, FireCMSContext, ResolvedEntityCollection, SideEntityController } from "../types";
import { Button, cls, defaultBorderMixin, DialogActions, IconButton, LoadingButton, Typography } from "@firecms/ui";
import { FormexController } from "@firecms/formex";
import { useFireCMSContext, useSideEntityController } from "../hooks";

export interface EntityFormActionsProps {
    collection: ResolvedEntityCollection;
    path: string;
    entity?: Entity;
    layout: "bottom" | "side";
    savingError?: Error;
    formex: FormexController<any>;
    disabled: boolean;
    status: "new" | "existing" | "copy";
    pluginActions: React.ReactNode[];
    openEntityMode: "side_panel" | "full_screen";
    showDefaultActions?: boolean;
}

export function EntityFormActions({
                                      collection,
                                      entity,
                                      layout,
                                      savingError,
                                      formex,
                                      disabled,
                                      status,
                                      pluginActions,
                                      openEntityMode
                                  }: EntityFormActionsProps) {

    const context = useFireCMSContext();
    const sideEntityController = useSideEntityController();

    return layout === "bottom"
        ? buildBottomActions({
            savingError,
            entity,
            collection,
            context,
            sideEntityController,
            isSubmitting: formex.isSubmitting,
            disabled,
            status,
            pluginActions,
            openEntityMode
        })
        : buildSideActions({
            savingError,
            entity,
            collection,
            context,
            sideEntityController,
            isSubmitting: formex.isSubmitting,
            disabled,
            status,
            pluginActions,
            openEntityMode
        });
}

type ActionsViewProps<M extends object> = {
    savingError: Error | undefined,
    entity: Entity<M> | undefined,
    formActions?: EntityAction[],
    collection: ResolvedEntityCollection,
    context: FireCMSContext,
    sideEntityController: SideEntityController,
    isSubmitting: boolean,
    disabled: boolean,
    status: "new" | "existing" | "copy",
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
                                                  pluginActions,
                                                  openEntityMode
                                              }: ActionsViewProps<M>) {

    return <DialogActions position={"absolute"}>
        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }
        {entity && (formActions ?? []).length > 0 && <div className="flex-grow flex overflow-auto no-scrollbar">
            {(formActions ?? []).map(action => (
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
        <Button variant={"filled"} color="primary" type="submit"
                disabled={disabled || isSubmitting}>
            {status === "existing" && "Save"}
            {status === "copy" && "Create copy"}
            {status === "new" && "Create"}
        </Button>

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
                                                pluginActions
                                            }: ActionsViewProps<M>) {

    return <div
        className={cls("overflow-auto h-full flex flex-col gap-2 w-80 2xl:w-96 px-4 py-16 sticky top-0 border-l", defaultBorderMixin)}>
        <LoadingButton fullWidth={true}
                       variant="filled"
                       color="primary"
                       type="submit"
                       size={"large"}
                       disabled={disabled || isSubmitting}>
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
