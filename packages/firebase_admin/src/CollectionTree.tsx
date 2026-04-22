import React, { useEffect, useRef, useState } from "react";
import {
    cls,
    Typography,
    Skeleton,
    FolderIcon,
    DescriptionIcon,
    AddIcon,
    IconButton,
    Tooltip,
    CloseIcon,
} from "@firecms/ui";
import { useAdminApi } from "./api/AdminApiProvider";

// Deterministic skeleton widths — avoids Math.random() which causes layout shifts on re-render
const SKELETON_WIDTHS = [65, 82, 55, 74, 90, 48];

/**
 * Tree list of Firestore collections.
 *
 * Root collections are shown always.
 * Subcollections are fetched and shown ONLY for documents that are in the
 * current navigation path (effective path).
 */
export function CollectionTree({
    projectId,
    databaseId,
    selectedPath,
    selectedDocId,
    onSelectCollection,
    onSelectDocument,
}: {
    projectId: string;
    databaseId?: string;
    selectedPath: string | null;
    selectedDocId: string | null;
    onSelectCollection: (path: string) => void;
    onSelectDocument?: (path: string, docId: string) => void;
}) {
    const adminApi = useAdminApi();
    const [rootCollections, setRootCollections] = useState<string[]>([]);
    const [loading, setLoading] = useState(true); // start true so skeletons show from frame 0
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setRootCollections([]);
        setLoading(true);
        setError(null);
        adminApi
            .listCollections(projectId, undefined, databaseId)
            .then(({ collections }) => {
                setRootCollections(
                    collections
                        .filter(name => !["__FIRECMS", "**", "*"].includes(name))
                        .sort()
                );
            })
            .catch(e => setError(e.message))
            .finally(() => {
                setLoading(false);
            });
    }, [projectId, databaseId]);

    const effectivePathParts = React.useMemo(() => {
        if (!selectedPath) return [];
        const parts = selectedPath.split("/").filter(Boolean);
        if (selectedDocId) {
            parts.push(selectedDocId);
        }
        return parts;
    }, [selectedPath, selectedDocId]);

    if (loading && rootCollections.length === 0) {
        return (
            <div className="space-y-1 p-2">
                {SKELETON_WIDTHS.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 px-3">
                        <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
                        <div style={{ width: `${w}%` }}><Skeleton className="h-4 w-full" /></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <Typography color="error" variant="body2">
                    {error}
                </Typography>
            </div>
        );
    }

    if (rootCollections.length === 0 && !loading) {
        return (
            <div className="p-4">
                <Typography color="secondary" variant="body2">
                    No collections found
                </Typography>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {rootCollections.map(collectionId => (
                <CollectionNode
                    key={collectionId}
                    collectionId={collectionId}
                    parentPath={null}
                    effectivePathParts={effectivePathParts}
                    partIndex={0}
                    selectedPath={selectedPath}
                    onSelectCollection={onSelectCollection}
                    onSelectDocument={onSelectDocument}
                    projectId={projectId}
                    databaseId={databaseId}
                />
            ))}
        </div>
    );
}

function CollectionNode({
    collectionId,
    parentPath,
    effectivePathParts,
    partIndex,
    selectedPath,
    onSelectCollection,
    onSelectDocument,
    projectId,
    databaseId,
}: {
    collectionId: string;
    parentPath: string | null;
    effectivePathParts: string[];
    partIndex: number;
    selectedPath: string | null;
    onSelectCollection: (path: string) => void;
    onSelectDocument?: (path: string, docId: string) => void;
    projectId: string;
    databaseId?: string;
}) {
    const fullPath = parentPath ? `${parentPath}/${collectionId}` : collectionId;
    const isSelected = selectedPath === fullPath;

    // Is this collection in the navigation path?
    const inNavigationPath = effectivePathParts[partIndex] === collectionId;
    const docIdInPath = inNavigationPath && effectivePathParts.length > partIndex + 1 ? effectivePathParts[partIndex + 1] : null;

    return (
        <div className="flex flex-col">
            <div
                className={cls(
                    "flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer transition-colors",
                    "hover:bg-surface-200 dark:hover:bg-surface-800",
                    isSelected && "bg-primary-bg dark:bg-primary/10"
                )}
                onClick={() => onSelectCollection(fullPath)}
            >
                <FolderIcon
                    size="smallest"
                    className={cls(
                        "flex-shrink-0",
                        isSelected || inNavigationPath ? "text-primary" : "text-amber-500 dark:text-amber-400"
                    )}
                />
                <Typography
                    variant="body2"
                    className={cls(
                        "flex-grow truncate text-sm",
                        (isSelected || inNavigationPath) && "text-primary font-medium"
                    )}
                >
                    {collectionId}
                </Typography>
            </div>

            {docIdInPath && (
                <div className="ml-4 pl-2 border-l border-surface-200 dark:border-surface-800 my-1">
                    <DocumentNode
                        docId={docIdInPath}
                        parentPath={fullPath}
                        effectivePathParts={effectivePathParts}
                        partIndex={partIndex + 1}
                        selectedPath={selectedPath}
                        onSelectCollection={onSelectCollection}
                        onSelectDocument={onSelectDocument}
                        projectId={projectId}
                        databaseId={databaseId}
                    />
                </div>
            )}
        </div>
    );
}

function DocumentNode({
    docId,
    parentPath,
    effectivePathParts,
    partIndex,
    selectedPath,
    onSelectCollection,
    onSelectDocument,
    projectId,
    databaseId,
}: {
    docId: string;
    parentPath: string;
    effectivePathParts: string[];
    partIndex: number;
    selectedPath: string | null;
    onSelectCollection: (path: string) => void;
    onSelectDocument?: (path: string, docId: string) => void;
    projectId: string;
    databaseId?: string;
}) {
    const adminApi = useAdminApi();
    const [subcollections, setSubcollections] = useState<string[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const docPath = `${parentPath}/${docId}`;

    // Only depend on the subcollection expected at this level, not the entire
    // effectivePathParts array (which changes on every navigation).
    const navSubcol = effectivePathParts[partIndex + 1] ?? null;

    useEffect(() => {
        // Only show skeleton on the very first load — subsequent re-fetches
        // keep existing items visible to avoid UI flashing.
        let cancelled = false;
        adminApi
            .listCollections(projectId, docPath, databaseId)
            .then(({ collections }) => {
                if (cancelled) return;
                const filtered = collections
                    .filter(name => !["__FIRECMS", "**", "*"].includes(name));
                // If the navigation path expects a subcollection under this doc
                // that wasn't returned by the API (e.g. newly created, still empty),
                // include it so the tree can display it.
                if (navSubcol && !filtered.includes(navSubcol)) {
                    filtered.push(navSubcol);
                }
                setSubcollections(filtered.sort());
            })
            .catch(console.error)
            .finally(() => {
                if (!cancelled) setInitialLoading(false);
            });
        return () => { cancelled = true; };
    }, [projectId, docPath, databaseId, navSubcol]);

    // If navSubcol changed and isn't in the list yet, add it immediately
    // so the tree shows it without waiting for the refetch.
    useEffect(() => {
        if (navSubcol && !subcollections.includes(navSubcol)) {
            setSubcollections(prev =>
                prev.includes(navSubcol) ? prev : [...prev, navSubcol].sort()
            );
        }
    }, [navSubcol, subcollections]);

    const isSelected = docId === effectivePathParts[effectivePathParts.length - 1];

    return (
        <div className="flex flex-col">
            <div
                className="flex items-center gap-2 py-1 px-3 mb-1 text-surface-500 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md transition-colors"
                onClick={() => onSelectDocument?.(parentPath, docId)}
            >
                <DescriptionIcon size="smallest" className="text-primary" />
                <Typography variant="caption" className={cls("font-mono text-xs truncate text-primary font-medium")}>
                    {docId}
                </Typography>
            </div>

            <div className="ml-2">
                {initialLoading && subcollections.length === 0 && (
                    <div className="py-1 px-3 flex items-center">
                        <Skeleton className="h-3 w-16" />
                    </div>
                )}
                {subcollections.map(subId => (
                    <CollectionNode
                        key={subId}
                        collectionId={subId}
                        parentPath={docPath}
                        effectivePathParts={effectivePathParts}
                        partIndex={partIndex + 1}
                        selectedPath={selectedPath}
                        onSelectCollection={onSelectCollection}
                        onSelectDocument={onSelectDocument}
                        projectId={projectId}
                        databaseId={databaseId}
                    />
                ))}
                {!initialLoading && (
                    <AddSubcollectionRow
                        docPath={docPath}
                        onSelectCollection={onSelectCollection}
                        onCreated={(name) => {
                            setSubcollections(prev => [...prev, name].sort());
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function AddSubcollectionRow({
    docPath,
    onSelectCollection,
    onCreated,
}: {
    docPath: string;
    onSelectCollection: (path: string) => void;
    onCreated: (name: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
        }
    }, [editing]);

    const handleSubmit = () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setEditing(false);
            setName("");
            return;
        }
        onCreated(trimmed);
        onSelectCollection(`${docPath}/${trimmed}`);
        setEditing(false);
        setName("");
    };

    if (editing) {
        return (
            <div className="flex items-center gap-1 py-0.5 px-3">
                <FolderIcon size="smallest" className="text-surface-400 flex-shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter") handleSubmit();
                        if (e.key === "Escape") { setEditing(false); setName(""); }
                    }}
                    onBlur={handleSubmit}
                    placeholder="collection name"
                    className="flex-grow min-w-0 bg-transparent border-b border-surface-300 dark:border-surface-600 text-sm text-text-primary dark:text-white outline-none py-0.5 font-mono"
                />
            </div>
        );
    }

    return (
        <Tooltip title="Add subcollection" side="right">
            <div
                className="flex items-center gap-2 py-1 px-3 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md transition-colors text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
                onClick={() => setEditing(true)}
            >
                <AddIcon size="smallest" />
                <Typography variant="caption" className="text-xs" color="secondary">
                    Add subcollection
                </Typography>
            </div>
        </Tooltip>
    );
}
