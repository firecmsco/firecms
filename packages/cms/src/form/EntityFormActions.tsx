import type { EntityCollection } from "@rebasepro/types";
import type { FormContext } from "../types/fields";
import type { EntityAction, SideEntityController } from "@rebasepro/types";
import React from "react";
import { Entity, RebaseContext } from "@rebasepro/types";
import type { EntityFormActionsProps } from "../types/components/EntityFormActionsProps";
import {
    Button,
    cls,
    defaultBorderMixin,
    DialogActions,
    ErrorIcon,
    IconButton,
    LoadingButton,
    Typography
} from "@rebasepro/ui";
import { useRebaseContext, useSideEntityController, useTranslation } from "@rebasepro/core";
import { FormexController } from "@rebasepro/formex";

export function EntityFormActions({
    path,
    collection,
    entity,
    layout,
    savingError,
    formex,
    disabled,
    status,
    pluginActions,
    openEntityMode,
    navigateBack,
    formContext
}: EntityFormActionsProps) {

    const context = useRebaseContext();
    const sideEntityController = useSideEntityController();
    const { t } = useTranslation();

    return layout === "bottom"
        ? buildBottomActions({
            path,
            savingError,
            entity,
            collection,
            context,
            sideEntityController,
            disabled,
            status,
            pluginActions,
            openEntityMode,
            navigateBack,
            formContext,
            formex,
            t
        })
        : buildSideActions({
            path,
            savingError,
            entity,
            collection,
            context,
            sideEntityController,
            disabled,
            status,
            pluginActions,
            openEntityMode,
            navigateBack,
            formContext,
            formex,
            t
        });
}

type ActionsViewProps<M extends object> = {
    path: string,
    savingError: Error | undefined,
    entity: Entity<M> | undefined,
    formActions?: EntityAction[],
    collection: EntityCollection,
    context: RebaseContext,
    sideEntityController: SideEntityController,
    disabled: boolean,
    status: "new" | "existing" | "copy",
    pluginActions?: any[],
    openEntityMode: "side_panel" | "full_screen";
    navigateBack: () => void;
    formContext: FormContext,
    formex: FormexController<any>;
    t: (key: string) => string;
};

function buildBottomActions<M extends object>({
    savingError,
    entity,
    path,
    formActions,
    collection,
    context,
    sideEntityController,
    disabled,
    status,
    pluginActions,
    openEntityMode,
    navigateBack,
    formContext,
    formex,
    t
}: ActionsViewProps<M>) {

    const hasErrors = Object.keys(formex.errors).length > 0 && formex.submitCount > 0;

    return <DialogActions position={"absolute"}>
        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }
        {entity && (formActions ?? []).length > 0 && <div className="grow flex overflow-auto no-scrollbar">
            {(formActions ?? []).map(action => (
                <IconButton
                    key={action.name}
                    color="primary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        event.stopPropagation();
                        if (entity)
                            action.onClick({
                                view: "form",
                                entity,
                                path: path ?? collection.slug,
                                collection: collection,
                                context,
                                sideEntityController,
                                openEntityMode: openEntityMode,
                                navigateBack,
                                formContext
                            });
                    }}>
                    {action.icon}
                </IconButton>
            ))}
        </div>}
        {pluginActions}
        <Button variant="text" disabled={disabled || formex.isSubmitting}
            color={"primary"}
            type="reset">
            {status === "existing" ? t("discard") : t("clear")}
        </Button>
        <Button variant={"filled"}
            color="primary"
            type="submit"
            disabled={disabled || formex.isSubmitting}
            startIcon={hasErrors ? <ErrorIcon /> : undefined}>
            {status === "existing" && t("save")}
            {status === "copy" && t("create_copy")}
            {status === "new" && t("create")}
        </Button>

    </DialogActions>;
}

function buildSideActions<M extends object>({
    savingError,
    entity,
    formActions,
    path,
    openEntityMode,
    collection,
    context,
    sideEntityController,
    disabled,
    status,
    pluginActions,
    formex,
    t
}: ActionsViewProps<M>) {

    const hasErrors = Object.keys(formex.errors).length > 0 && formex.submitCount > 0;

    return <div
        className={cls("overflow-auto h-full flex flex-col gap-2 w-80 2xl:w-96 px-4 py-16 sticky top-0 border-l", defaultBorderMixin)}>
        <LoadingButton fullWidth={true}
            variant="filled"
            color="primary"
            type="submit"
            startIcon={hasErrors ? <ErrorIcon /> : undefined}
            disabled={disabled || formex.isSubmitting}>
            {status === "existing" && t("save")}
            {status === "copy" && t("create_copy")}
            {status === "new" && t("create")}
        </LoadingButton>
        <Button fullWidth={true} variant="text" disabled={disabled || formex.isSubmitting} type="reset">
            {status === "existing" ? t("discard") : t("clear")}
        </Button>

        {pluginActions}

        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }
    </div>;
}
