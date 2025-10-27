import React, { useState } from "react";
import {
    Button, CancelIcon, CheckIcon,
    defaultBorderMixin,
    Dialog,
    DialogActions,
    DialogContent,
    KeyboardArrowDownIcon,
    Menu,
    MenuItem,
    Typography, VisibilityIcon,
    WarningIcon
} from "@firecms/ui";
import { flattenKeys, FormexController } from "@firecms/formex";
import { useSnackbarController } from "../../hooks";
import { mergeDeep } from "../../util";
import { removeEntityFromCache } from "../../util/entity_cache";

interface LocalChangesMenuProps<M extends object> {
    cacheKey: string;
    localChangesData: Partial<M>;
    formex: FormexController<M>;
    onClearLocalChanges?: () => void;
}

export function LocalChangesMenu<M extends object>({
                                                       localChangesData,
                                                       formex,
                                                       onClearLocalChanges,
                                                       cacheKey
                                                   }: LocalChangesMenuProps<M>) {

    const snackbarController = useSnackbarController();
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const handleOpenMenu = () => {
        setOpen(true)
    };

    const handleCloseMenu = () => {
        setOpen(false)
    };

    const handlePreview = () => {
        setPreviewDialogOpen(true);
        handleCloseMenu();
    };

    const handleApply = () => {
        const mergedValues = mergeDeep(formex.values, localChangesData);
        const touched = { ...formex.touched };
        const newTouched: string[] = flattenKeys(localChangesData);
        newTouched.forEach((key) => {
            touched[key] = true;
        });

        formex.setTouched(touched);
        formex.setValues(mergedValues);
        snackbarController.open({
            type: "info",
            message: "Local changes applied to the form"
        });
        handleCloseMenu();
        onClearLocalChanges?.();
    };

    const handleDiscard = () => {
        removeEntityFromCache(cacheKey);
        snackbarController.open({
            type: "info",
            message: "Local changes discarded"
        });
        handleCloseMenu();
        onClearLocalChanges?.();
    };

    return (
        <>

            <Menu
                trigger={<Button
                    size={"small"}
                    className={"font-semibold text-xs rounded-full px-4 py-1 bg-yellow-200 dark:bg-yellow-900 hover:bg-yellow-300 dark:hover:bg-yellow-800 text-yellow-800 dark:text-yellow-200"}
                    onClick={handleOpenMenu}>
                    <WarningIcon
                        size={"smallest"}
                        className={"mr-1 text-yellow-600 dark:text-yellow-400"}/>
                    Unsaved Local changes
                    <KeyboardArrowDownIcon size={"smallest"}/>
                </Button>}
                open={open}
                onOpenChange={setOpen}
            >
                <div className={"max-w-xs px-4 py-4 text-sm text-gray-700 dark:text-gray-300"}>
                    This document was edited locally and has unsaved changes.
                </div>
                <MenuItem dense onClick={handlePreview}><VisibilityIcon size={"small"}/>Preview Changes</MenuItem>
                <MenuItem dense onClick={handleApply}><CheckIcon size={"small"}/>Apply Changes</MenuItem>
                <MenuItem dense onClick={handleDiscard}><CancelIcon size={"small"}/>Discard Local Changes</MenuItem>
            </Menu>

            <Dialog
                open={previewDialogOpen}
                onOpenChange={setPreviewDialogOpen}
                maxWidth={"4xl"}
            >
                <DialogContent>
                    <h3 className={"text-2xl mb-4"}>Preview Local Changes</h3>
                    <p className={"mb-4"}>
                        These are the local changes that will be applied to the form.
                    </p>
                    <div
                        className={`border rounded-lg divide-y divide-surface-200 divide-surface-opacity-40 dark:divide-surface-700 dark:divide-opacity-40 ${defaultBorderMixin}`}>
                        {Object.entries(localChangesData).map(([key, value]) => (
                            <div key={key}
                                 className="grid grid-cols-12 gap-x-4 px-4 py-3 items-center">
                                <div
                                    className="col-span-3">
                                    <Typography variant="caption"
                                                className="text-gray-500 dark:text-gray-400 break-words">{key}</Typography>
                                </div>
                                <div className="col-span-9">
                                    <Typography component="div" variant="body2"
                                                className="text-gray-800 dark:text-gray-200">
                                        <div
                                            className="whitespace-pre-wrap break-words text-sm">
                                            {typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : String(value)}
                                        </div>
                                    </Typography>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
                    <Button
                        variant={"filled"}
                        onClick={() => {
                            handleApply();
                            setPreviewDialogOpen(false);
                        }}>Apply changes</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
