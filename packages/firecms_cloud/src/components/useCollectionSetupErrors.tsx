import React, { useCallback, useState } from "react";
import { useSnackbarController, useTranslation } from "@firecms/core";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@firecms/ui";
import { CloudError, CloudErrorView } from "./CloudErrorView";
import { useFireCMSBackend } from "../hooks";
import { collectionSetupErrorDetail, collectionSetupErrorKind } from "../utils/collection_setup_errors";

/**
 * Tell the user why a collection setup failed, and offer the fix where there is one.
 *
 * Every setup entry point used to show the same "Error setting up collections"
 * toast, whatever the cause. A service account that was deleted, revoked or
 * disabled in the customer's Google Cloud project is fixed by recreating it,
 * which `CloudErrorView` already offers elsewhere; here it opens in a dialog
 * and, once fixed, runs the setup again.
 */
export function useCollectionSetupErrors(projectId: string): {
    reportSetupError: (error: unknown, retry?: () => void) => void,
    setupErrorDialog: React.ReactNode
} {
    const snackbarController = useSnackbarController();
    const fireCMSBackend = useFireCMSBackend();
    const { t } = useTranslation();

    const [dialog, setDialog] = useState<{ error: CloudError, retry?: () => void } | undefined>();

    const reportSetupError = useCallback((error: unknown, retry?: () => void) => {
        const kind = collectionSetupErrorKind(error);
        const detail = collectionSetupErrorDetail(error);
        if (kind === "service-account") {
            const apiError = error as CloudError & { projectId?: string };
            setDialog({
                error: {
                    code: apiError.code,
                    message: apiError.message,
                    projectId: apiError.projectId ?? projectId,
                    data: apiError.data
                },
                retry
            });
            return;
        }
        snackbarController.open({
            type: kind === "not-ready" ? "info" : "error",
            message: kind === "not-ready" || !detail
                ? (detail ?? t("error_setting_up_collections"))
                : <>{t("error_setting_up_collections")}<br/>{detail}</>
        });
    }, [projectId, snackbarController, t]);

    const close = () => setDialog(undefined);

    const setupErrorDialog = <Dialog open={Boolean(dialog)}
                                     onOpenChange={(open) => !open && close()}
                                     maxWidth={"xl"}>
        <DialogTitle variant={"h6"}>{t("error_setting_up_collections")}</DialogTitle>
        <DialogContent>
            {dialog && <CloudErrorView error={dialog.error}
                                       fireCMSBackend={fireCMSBackend}
                                       onFixed={() => {
                                           const retry = dialog.retry;
                                           close();
                                           retry?.();
                                       }}/>}
        </DialogContent>
        <DialogActions>
            <Button variant={"text"} onClick={close}>{t("close")}</Button>
        </DialogActions>
    </Dialog>;

    return { reportSetupError, setupErrorDialog };
}
