import React, { useState } from "react";
import {
    useCollectionRegistryController,
    useSnackbarController,
    AIIcon
} from "@rebasepro/core";
import { EntityCollection } from "@rebasepro/types";
import {
    Button,
    CircularProgress,
    IconButton,
    Menu,
    SendIcon,
    TextField,
    Tooltip,
    Typography
} from "@rebasepro/ui";
import {
    CollectionGenerationCallback,
    CollectionGenerationApiError,
    CollectionOperation
} from "../../api/generateCollectionApi";
import { useCollectionsConfigController } from "../../useCollectionsConfigController";

export interface AICollectionGeneratorPopoverProps {
    /**
     * Current collection being edited (if modifying an existing collection)
     */
    existingCollection?: EntityCollection;

    /**
     * Callback when a collection is generated or modified.
     * Includes the collection and optionally the operations that were applied.
     */
    onGenerated: (collection: EntityCollection, operations?: CollectionOperation[]) => void;

    /**
     * Callback function for generating/modifying collections.
     * The plugin is API-agnostic - the consumer provides the implementation.
     */
    generateCollection: CollectionGenerationCallback;

    /**
     * Optional custom trigger button. If not provided, a default AI button is used.
     */
    trigger?: React.ReactNode | any;

    /**
     * Size of the button
     */
    size?: "small" | "medium" | "large";

    /**
     * Whether to show the label text
     */
    showLabel?: boolean;

    /**
     * Optional analytics callback
     */
    onAnalyticsEvent?: (event: string, params?: object) => void;
}

export function AICollectionGeneratorPopover({
    existingCollection,
    onGenerated,
    generateCollection,
    trigger,
    size = "small",
    showLabel = true,
    onAnalyticsEvent
}: AICollectionGeneratorPopoverProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const collectionRegistry = useCollectionRegistryController();
    const configController = useCollectionsConfigController();
    const snackbarController = useSnackbarController();

    const existingCollections = collectionRegistry.collections ?? [];

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);

        const mode = existingCollection ? "modify" : "create";
        onAnalyticsEvent?.("ai_collection_generate_start", { mode });

        try {
            const collectionsContext = existingCollections.map(c => ({
                dbPath: c.dbPath,
                slug: c.slug,
                name: c.name,
                properties: c.properties,
                propertiesOrder: c.propertiesOrder
            }));

            const result = await generateCollection({
                prompt: prompt.trim(),
                existingCollections: collectionsContext.slice(0, 30),
                ...(existingCollection && {
                    existingCollection: {
                        dbPath: existingCollection.dbPath,
                        slug: existingCollection.slug,
                        name: existingCollection.name,
                        properties: existingCollection.properties,
                        propertiesOrder: existingCollection.propertiesOrder
                    }
                })
            });

            onGenerated(result.collection, result.operations);
            setMenuOpen(false);
            setPrompt("");
            onAnalyticsEvent?.("ai_collection_generate_success", {
                mode,
                operationsCount: result.operations?.length
            });
            snackbarController.open({
                type: "success",
                message: existingCollection
                    ? "Collection updated with AI suggestions"
                    : "Collection generated successfully"
            });
        } catch (e) {
            console.error("Error generating collection:", e);
            const errorMessage = e instanceof CollectionGenerationApiError
                ? e.message
                : "Failed to generate collection. Please try again.";
            setError(errorMessage);
            onAnalyticsEvent?.("ai_collection_generate_error", {
                mode,
                error: errorMessage
            });
            snackbarController.open({
                type: "error",
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    const tooltipTitle = configController?.readOnly
        ? (configController.readOnlyReason || "Collection generation is disabled")
        : undefined;

    const defaultTrigger = showLabel ? (
        <Tooltip title={tooltipTitle} asChild={true}>
            <Button
                variant="text"
                size={size}
                disabled={loading || configController?.readOnly}
                startIcon={loading
                    ? <CircularProgress size="smallest" />
                    : <AIIcon size="small" />
                }
            >
                AI Assist
            </Button>
        </Tooltip>
    ) : (
        <Tooltip title={tooltipTitle} asChild={true}>
            <IconButton
                size={size}
                disabled={loading || configController?.readOnly}
                aria-label="AI Assist"
            >
                {loading
                    ? <CircularProgress size="smallest" />
                    : <AIIcon size="small" />
                }
            </IconButton>
        </Tooltip>
    );

    return (
        <Menu
            open={menuOpen}
            onOpenChange={(open) => {
                setMenuOpen(open);
                if (!open) {
                    setError(null);
                }
            }}
            trigger={trigger ?? defaultTrigger}
        >
            <div className="p-4 flex flex-col gap-3 min-w-[360px] max-w-[480px]">
                <div className="flex items-center gap-2">
                    <AIIcon size="small" />
                    <Typography variant="subtitle2">
                        {existingCollection ? "Modify Collection with AI" : "Generate Collection with AI"}
                    </Typography>
                </div>

                <Typography variant="caption" color="secondary">
                    {existingCollection
                        ? "Describe the changes you want to make to this collection."
                        : "Describe the collection you want to create."
                    }
                </Typography>

                <TextField
                    size="small"
                    multiline
                    autoFocus
                    className="w-full text-text-primary dark:text-text-primary-dark"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={existingCollection
                        ? "e.g., Add a thumbnail image field with storage, make price required..."
                        : "e.g., Create a products collection with name, price, description, and category..."
                    }
                    disabled={loading}
                />

                {error && (
                    <Typography variant="caption" className="text-red-500">
                        {error}
                    </Typography>
                )}

                <div className="flex justify-end gap-2">
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setMenuOpen(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        size="small"
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || loading}
                        startIcon={loading ? <CircularProgress size="smallest" /> : undefined}
                    >
                        {loading ? "Generating..." : "Generate"}
                    </Button>
                </div>
            </div>
        </Menu>
    );
}
