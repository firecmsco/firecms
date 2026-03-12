import React, { useState } from "react";
import {
    Button,
    CancelIcon,
    CheckIcon,
    defaultBorderMixin,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    KeyboardArrowDownIcon,
    Menu,
    MenuItem,
    Typography,
    VisibilityIcon,
    WarningIcon
} from "@firecms/ui";
import { FormexController } from "@firecms/formex";
import { useSnackbarController, useTranslation } from "../../hooks";
import { mergeDeep } from "../../util";
import { flattenKeys, removeEntityFromCache } from "../../util/entity_cache";
import { ResolvedProperties } from "../../types";
import { PropertyCollectionView } from "../../components/PropertyCollectionView";

interface LocalChangesMenuProps<M extends object> {
    cacheKey: string;
    cachedData: Partial<M>;
    formex: FormexController<M>;
    onClearLocalChanges?: () => void;
    properties: ResolvedProperties<M>;
}

export function LocalChangesMenu<M extends object>({
                                                       cachedData,
                                                       formex,
                                                       onClearLocalChanges,
                                                       cacheKey,
                                                       properties
                                                   }: LocalChangesMenuProps<M>) {

    const snackbarController = useSnackbarController();
    const { t } = useTranslation();
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [open, setOpen] = useState(false);

    const handleOpenMenu = () => setOpen(true);
    const handleCloseMenu = () => setOpen(false);

    const handlePreview = () => {
        setPreviewDialogOpen(true);
        handleCloseMenu();
    };

    const handleApply = () => {
        const mergedValues = mergeDeep(formex.values, cachedData);
        const touched = { ...formex.touched };
        const cachedKeys = flattenKeys(cachedData);
        cachedKeys.forEach((key) => {
            touched[key] = true;
        });

        formex.setTouched(touched);
        formex.setValues(mergedValues);
        snackbarController.open({
            type: "info",
            message: t("local_changes_applied")
        });
        handleCloseMenu();
        onClearLocalChanges?.();
    };

    const handleDiscard = () => {
        removeEntityFromCache(cacheKey);
        snackbarController.open({
            type: "info",
            message: t("local_changes_discarded")
        });
        handleCloseMenu();
        onClearLocalChanges?.();
    };

    return (
        <>
            <Menu
                trigger={
                    <Button
                        size={"small"}
                        className={
                            "font-semibold text-xs rounded-full px-4 py-1 bg-yellow-200 dark:bg-yellow-900 hover:bg-yellow-300 dark:hover:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                        }
                        onClick={handleOpenMenu}
                    >
                        <WarningIcon size={"smallest"} className={"mr-1 text-yellow-600 dark:text-yellow-400"}/>
                        {t("unsaved_local_changes")}
                        <KeyboardArrowDownIcon size={"smallest"}/>
                    </Button>
                }
                open={open}
                onOpenChange={setOpen}
            >
                <div className={"max-w-xs px-4 py-4 text-sm text-gray-700 dark:text-gray-300"}>
                    {t("unsaved_local_changes_description")}
                </div>
                <MenuItem dense onClick={handlePreview}><VisibilityIcon size={"small"}/>{t("preview_changes")}</MenuItem>
                <MenuItem dense onClick={handleApply}><CheckIcon size={"small"}/>{t("apply_changes")}</MenuItem>
                <MenuItem dense onClick={handleDiscard}><CancelIcon size={"small"}/>{t("discard_local_changes")}</MenuItem>
            </Menu>

            <Dialog
                open={previewDialogOpen}
                onOpenChange={setPreviewDialogOpen}
                maxWidth={"4xl"}
            >
                <DialogTitle variant={"h6"}>{t("preview_local_changes")}</DialogTitle>
                <DialogContent className={"my-4"}>
                    <Typography variant={"body2"} className={"mb-4"}>
                        {t("preview_local_changes_description")}
                    </Typography>
                    <div className={`border rounded-lg ${defaultBorderMixin}`} style={{
                        maxHeight: 520,
                        overflow: "auto"
                    }}>
                        <div className="p-4">
                            <PropertyCollectionView data={cachedData}
                                                    properties={properties as ResolvedProperties}/>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)}>{t("close")}</Button>
                    <Button
                        variant={"filled"}
                        onClick={() => {
                            handleApply();
                            setPreviewDialogOpen(false);
                        }}
                    >
                        {t("apply_changes")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
