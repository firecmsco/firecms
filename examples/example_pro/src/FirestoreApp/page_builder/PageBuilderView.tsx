import React, { useState, useCallback, useEffect } from "react";
import { Puck, Render, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import {
    Button,
    TextField,
    Select,
    SelectItem,
    Dialog,
    DialogContent,
    DialogActions,
    Typography,
    CircularProgress,
    cls,
    IconButton,
    Tooltip,
    Container,
    AddIcon,
    DeleteIcon,
    SaveIcon,
    OpenInNewIcon
} from "@firecms/ui";
import { useLandingPage } from "./hooks/useLandingPage";
import { puckConfig } from "./puck-config";
import "./puck-overrides.css";

export function PageBuilderView() {
    const [selectedPageId, setSelectedPageId] = useState<string | undefined>();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newPageName, setNewPageName] = useState("");
    const [puckData, setPuckData] = useState<Data | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const {
        page,
        pages,
        loading,
        saving,
        savePage,
        createPage,
        deletePage,
        loadPage
    } = useLandingPage(selectedPageId);

    // Sync puckData with loaded page
    useEffect(() => {
        if (page?.puckData) {
            setPuckData(page.puckData as Data);
            setHasUnsavedChanges(false);
        }
    }, [page]);

    const handlePageSelect = useCallback((pageId: string) => {
        if (hasUnsavedChanges) {
            if (!confirm("You have unsaved changes. Are you sure you want to switch pages?")) {
                return;
            }
        }
        setSelectedPageId(pageId);
    }, [hasUnsavedChanges]);

    const handleCreatePage = useCallback(async () => {
        if (!newPageName.trim()) return;
        const newPage = await createPage(newPageName.trim());
        if (newPage) {
            setSelectedPageId(newPage.id);
            setNewPageName("");
            setIsCreateDialogOpen(false);
        }
    }, [newPageName, createPage]);

    const handleSave = useCallback(async () => {
        if (!selectedPageId || !puckData) return;
        await savePage(selectedPageId, {
            ...page,
            puckData
        });
        setHasUnsavedChanges(false);
    }, [selectedPageId, puckData, page, savePage]);

    const handleDataChange = useCallback((data: Data) => {
        setPuckData(data);
        setHasUnsavedChanges(true);
    }, []);

    const handleDeletePage = useCallback(async () => {
        if (!selectedPageId) return;
        if (!confirm("Are you sure you want to delete this page?")) return;
        await deletePage(selectedPageId);
        setSelectedPageId(undefined);
        setPuckData(null);
    }, [selectedPageId, deletePage]);

    // Show page selector when no page is selected
    if (!selectedPageId) {
        return (
            <Container className="py-8">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Typography variant="h4" className="font-bold">
                                Page Builder
                            </Typography>
                            <Typography variant="body2" color="secondary">
                                Create and edit landing pages with a visual drag-and-drop editor
                            </Typography>
                        </div>
                        <Button
                            variant="filled"
                            onClick={() => setIsCreateDialogOpen(true)}
                            startIcon={<AddIcon />}
                        >
                            Create New Page
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <CircularProgress />
                        </div>
                    ) : pages.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Typography variant="h6" color="secondary">
                                No pages yet
                            </Typography>
                            <Typography variant="body2" color="secondary" className="mb-4">
                                Create your first landing page to get started
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                Create Page
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pages.map((p) => (
                                <div
                                    key={p.id}
                                    className={cls(
                                        "p-4 border rounded-lg cursor-pointer transition-all",
                                        "hover:border-primary-500 hover:shadow-md",
                                        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                    )}
                                    onClick={() => handlePageSelect(p.id)}
                                >
                                    <Typography variant="subtitle1" className="font-medium">
                                        {p.name}
                                    </Typography>
                                    <Typography variant="caption" color="secondary">
                                        /{p.slug}
                                    </Typography>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={cls(
                                            "px-2 py-0.5 text-xs rounded",
                                            p.status === "published"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                        )}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Page Dialog */}
                <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                >
                    <DialogContent>
                        <Typography variant="h6" className="mb-4">
                            Create New Page
                        </Typography>
                        <TextField
                            value={newPageName}
                            onChange={(e) => setNewPageName(e.target.value)}
                            label="Page Name"
                            placeholder="Enter page name..."
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="text"
                            onClick={() => {
                                setIsCreateDialogOpen(false);
                                setNewPageName("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            onClick={handleCreatePage}
                            disabled={!newPageName.trim()}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        );
    }

    // Show loading state
    if (loading || !puckData) {
        return (
            <div className="flex items-center justify-center h-full">
                <CircularProgress />
            </div>
        );
    }

    // Show editor
    return (
        <div className="h-full flex flex-col firecms-puck-editor">
            {/* Custom Header */}
            <div className={cls(
                "flex items-center justify-between px-4 py-2",
                "border-b border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-gray-900"
            )}>
                <div className="flex items-center gap-4">
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => {
                            if (hasUnsavedChanges) {
                                if (!confirm("You have unsaved changes. Are you sure you want to go back?")) {
                                    return;
                                }
                            }
                            setSelectedPageId(undefined);
                            setPuckData(null);
                        }}
                    >
                        ← Back to Pages
                    </Button>
                    <div className="flex items-center gap-2">
                        <Typography variant="subtitle1" className="font-medium">
                            {page?.name}
                        </Typography>
                        {hasUnsavedChanges && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 px-2 py-0.5 rounded">
                                Unsaved
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip title="Preview">
                        <IconButton
                            onClick={() => setIsPreviewOpen(true)}
                        >
                            <OpenInNewIcon size="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Page">
                        <IconButton
                            onClick={handleDeletePage}
                            color="error"
                        >
                            <DeleteIcon size="small" />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant="filled"
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges || saving}
                        startIcon={saving ? <CircularProgress size="smallest" /> : <SaveIcon />}
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>

            {/* Puck Editor */}
            <div className="flex-1 overflow-hidden">
                <Puck
                    config={puckConfig}
                    data={puckData}
                    onChange={handleDataChange}
                    iframe={{ enabled: false }}
                />
            </div>

            {/* Preview Dialog */}
            <Dialog
                open={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                maxWidth="xl"
            >
                <DialogContent className="p-0 min-h-[80vh]">
                    <Render
                        config={puckConfig}
                        data={puckData}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="text"
                        onClick={() => setIsPreviewOpen(false)}
                    >
                        Close Preview
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default PageBuilderView;
