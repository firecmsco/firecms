import React, { useState } from "react";
import { EntityCollection, useNavigationController, useSnackbarController } from "@firecms/core";
import {
    AutoAwesomeIcon,
    Button,
    CircularProgress,
    IconButton,
    Menu,
    SendIcon,
    TextField,
    Typography
} from "@firecms/ui";
import {
    generateCollection,
    modifyCollectionDelta,
    CollectionGenerationApiError,
    CollectionOperation
} from "../../api/generateCollectionApi";
import { PersistedCollection } from "../../types/persisted_collection";

export interface AICollectionGeneratorPopoverProps {
    /**
     * Current collection being edited (if modifying an existing collection)
     */
    existingCollection?: PersistedCollection;

    /**
     * Callback when a collection is generated or modified.
     * Includes the collection and optionally the operations that were applied (for modify_delta).
     */
    onGenerated: (collection: EntityCollection, operations?: CollectionOperation[]) => void;

    /**
     * Function to get the auth token for API calls
     */
    getAuthToken: () => Promise<string>;

    /**
     * API endpoint base URL (e.g., "https://api.firecms.co")
     */
    apiEndpoint: string;

    /**
     * Optional custom trigger button. If not provided, a default AI button is used.
     */
    trigger?: React.ReactNode;

    /**
     * Size of the button
     */
    size?: "small" | "medium" | "large";

    /**
     * Whether to show the label text
     */
    showLabel?: boolean;
}

export function AICollectionGeneratorPopover({
    existingCollection,
    onGenerated,
    getAuthToken,
    apiEndpoint,
    trigger,
    size = "small",
    showLabel = true
}: AICollectionGeneratorPopoverProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigation = useNavigationController();
    const snackbarController = useSnackbarController();

    const existingCollections = navigation.collections ?? [];

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);

        try {
            let resultCollection: EntityCollection;
            let resultOperations: CollectionOperation[] | undefined;

            const collectionsContext = existingCollections.map(c => ({
                path: c.path,
                id: c.id,
                name: c.name,
                properties: c.properties,
                propertiesOrder: c.propertiesOrder
            }));

            if (existingCollection) {
                // Modify existing collection using delta endpoint (faster)
                const result = await modifyCollectionDelta({
                    prompt: prompt.trim(),
                    existingCollection: {
                        path: existingCollection.path,
                        id: existingCollection.id,
                        name: existingCollection.name,
                        properties: existingCollection.properties,
                        propertiesOrder: existingCollection.propertiesOrder
                    },
                    existingCollections: collectionsContext,
                    getAuthToken,
                    apiEndpoint
                });
                resultCollection = result.collection;
                resultOperations = result.operations;
            } else {
                // Generate new collection - returns full collection
                resultCollection = await generateCollection({
                    prompt: prompt.trim(),
                    existingCollections: collectionsContext,
                    getAuthToken,
                    apiEndpoint
                });
            }

            onGenerated(resultCollection, resultOperations);
            setMenuOpen(false);
            setPrompt("");
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

    const defaultTrigger = showLabel ? (
        <Button
            variant="text"
            size={size}
            disabled={loading}
            startIcon={loading
                ? <CircularProgress size="smallest" />
                : <AutoAwesomeIcon size="small" />
            }
        >
            AI Assist
        </Button>
    ) : (
        <IconButton
            size={size}
            disabled={loading}
            aria-label="AI Assist"
        >
            {loading
                ? <CircularProgress size="smallest" />
                : <AutoAwesomeIcon size="small" />
            }
        </IconButton>
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
                    <AutoAwesomeIcon size="small" className="text-primary" />
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
