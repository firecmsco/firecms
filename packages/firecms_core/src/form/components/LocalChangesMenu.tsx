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
import { useSnackbarController } from "../../hooks";
import { mergeDeep } from "../../util";
import { flattenKeys, removeEntityFromCache } from "../../util/entity_cache";
import { ResolvedProperties } from "../../types";
import { PropertyCollectionView } from "../../components/PropertyCollectionView";

interface LocalChangesMenuProps<M extends object> {
    cacheKey: string;
    localChangesData: Partial<M>;
    formex: FormexController<M>;
    onClearLocalChanges?: () => void;
    properties: ResolvedProperties<M>;
}

export function LocalChangesMenu<M extends object>({
                                                       localChangesData,
                                                       formex,
                                                       onClearLocalChanges,
                                                       cacheKey,
                                                       properties
                                                   }: LocalChangesMenuProps<M>) {

    const snackbarController = useSnackbarController();
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [open, setOpen] = useState(false);

    const handleOpenMenu = () => setOpen(true);
    const handleCloseMenu = () => setOpen(false);

    const handlePreview = () => {
        setPreviewDialogOpen(true);
        handleCloseMenu();
    };

    const handleApply = () => {
        const mergedValues = mergeDeep(formex.values, localChangesData);
        const touched = { ...formex.touched };
        const previewKeys = flattenKeys(localChangesData);
        previewKeys.forEach((key) => {
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
                trigger={
                    <Button
                        size={"small"}
                        className={
                            "font-semibold text-xs rounded-full px-4 py-1 bg-yellow-200 dark:bg-yellow-900 hover:bg-yellow-300 dark:hover:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                        }
                        onClick={handleOpenMenu}
                    >
                        <WarningIcon size={"smallest"} className={"mr-1 text-yellow-600 dark:text-yellow-400"}/>
                        Unsaved Local changes
                        <KeyboardArrowDownIcon size={"smallest"}/>
                    </Button>
                }
                open={open}
                onOpenChange={setOpen}
            >
                <div className={"max-w-xs px-4 py-4 text-sm text-gray-700 dark:text-gray-300"}>
                    This document was edited locally and has unsaved changes. These local changes will be lost if you
                    don't apply them.
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
                <DialogTitle variant={"h6"}>Preview Local Changes</DialogTitle>
                <DialogContent className={"my-4"}>
                    <Typography variant={"body2"} className={"mb-4"}>
                        These are the local changes that will be applied to the form.
                    </Typography>
                    <div className={`border rounded-lg ${defaultBorderMixin}`} style={{
                        maxHeight: 520,
                        overflow: "auto"
                    }}>
                        <div className="p-4">
                            <PropertyCollectionView data={localChangesData}
                                                    properties={properties as ResolvedProperties}/>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
                    <Button
                        variant={"filled"}
                        onClick={() => {
                            handleApply();
                            setPreviewDialogOpen(false);
                        }}
                    >
                        Apply changes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
