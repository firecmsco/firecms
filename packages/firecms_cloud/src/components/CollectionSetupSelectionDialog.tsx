import React from "react";
import { useNavigationController, useSnackbarController, useTranslation } from "@firecms/core";
import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LoadingButton,
    Typography
} from "@firecms/ui";
import { ProjectsApi, RootCollectionInfo } from "../api/projects";

export function CollectionSetupSelectionDialog({
    open,
    onClose,
    suggestions,
    projectsApi,
    projectId,
    onSuccess,
    onError
}: {
    open: boolean;
    onClose: () => void;
    suggestions: RootCollectionInfo[];
    projectsApi: ProjectsApi;
    projectId: string;
    onSuccess?: () => void;
    onError?: () => void;
}) {
    const { t } = useTranslation();
    const snackbarController = useSnackbarController();
    const navigationController = useNavigationController();

    const [selectedPaths, setSelectedPaths] = React.useState<Set<string>>(new Set());
    const [loading, setLoading] = React.useState(false);

    // Reset selection when dialog opens
    React.useEffect(() => {
        if (open) {
            setSelectedPaths(new Set(suggestions.map(s => s.path)));
        }
    }, [open, suggestions]);

    const togglePath = (path: string) => {
        setSelectedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const selectAll = () => {
        setSelectedPaths(new Set(suggestions.map(s => s.path)));
    };

    const deselectAll = () => {
        setSelectedPaths(new Set());
    };

    const selectedCount = selectedPaths.size;
    const allSelected = selectedCount === suggestions.length;
    const noneSelected = selectedCount === 0;

    const handleSetup = async () => {
        const pathsToSetup = suggestions.filter(s => selectedPaths.has(s.path));
        if (pathsToSetup.length === 0) return;

        setLoading(true);
        snackbarController.open({
            message: t("setting_up_collections"),
            type: "info"
        });

        try {
            const collections = await projectsApi.setupCollections(projectId, pathsToSetup);
            if (!collections || collections.length === 0) {
                snackbarController.open({
                    message: t("no_collections_found_to_setup"),
                    type: "info"
                });
            } else {
                snackbarController.open({
                    message: <>{t("collections_have_been_setup")}<br />{collections.map(c => c.name).join(", ")}</>,
                    type: "success"
                });
                navigationController.refreshNavigation();
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error setting up collections", error);
            snackbarController.open({
                message: t("error_setting_up_collections"),
                type: "error"
            });
            onError?.();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(open) => !open && !loading ? onClose() : undefined}
            maxWidth={"lg"}
        >
            <DialogTitle variant={"h6"} className={"mb-2"}>
                {t("setup_collections_title")}
            </DialogTitle>
            <DialogContent>
                <Typography variant={"body2"} color={"secondary"} className={"mb-4"}>
                    {t("setup_collections_select_desc")}
                </Typography>

                <div className={"flex flex-row gap-2 mb-3"}>
                    <Button
                        variant={"text"}
                        size={"small"}
                        disabled={allSelected || loading}
                        onClick={selectAll}>
                        {t("select_all")}
                    </Button>
                    <Button
                        variant={"text"}
                        size={"small"}
                        disabled={noneSelected || loading}
                        onClick={deselectAll}>
                        {t("deselect_all")}
                    </Button>
                </div>

                <div className={"flex flex-col gap-1"}>
                    {suggestions.map((info) => (
                        <label
                            key={info.path}
                            className={"flex flex-row items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-surface-accent-100 dark:hover:bg-surface-accent-800 transition-colors"}
                        >
                            <Checkbox
                                checked={selectedPaths.has(info.path)}
                                disabled={loading}
                                size={"small"}
                                onCheckedChange={() => togglePath(info.path)}
                            />
                            <Typography variant={"body2"}>
                                {info.path}
                            </Typography>
                            {info.databaseId && (
                                <Typography variant={"caption"} color={"secondary"}>
                                    ({info.databaseId})
                                </Typography>
                            )}
                        </label>
                    ))}
                </div>
            </DialogContent>

            <DialogActions>
                <Button
                    variant={"text"}
                    disabled={loading}
                    onClick={onClose}>
                    {t("cancel")}
                </Button>

                <LoadingButton
                    loading={loading}
                    disabled={noneSelected}
                    onClick={handleSetup}>
                    {t("setup_collections_confirm", { count: String(selectedCount) })}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
