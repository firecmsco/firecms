import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    cls,
    Typography,
    TextField,
    IconButton,
    Tooltip,
    Button,
    Chip,
    defaultBorderMixin,
    FolderIcon,
    DescriptionIcon,
    OpenInNewIcon,
    LinkIcon,
    CloseIcon,
} from "@firecms/ui";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a Firestore reference path into alternating collection / document
 * segments.
 * e.g. "users/abc/posts/xyz" → [
 *   { type: "collection", value: "users" },
 *   { type: "document",   value: "abc"   },
 *   { type: "collection", value: "posts" },
 *   { type: "document",   value: "xyz"   },
 * ]
 */
export type PathSegment = { type: "collection" | "document"; value: string };

export function parseRefPath(path: string): PathSegment[] {
    if (!path) return [];
    return path
        .split("/")
        .filter(Boolean)
        .map((value, i) => ({
            type: i % 2 === 0 ? "collection" : "document",
            value,
        }));
}

function isValidRefPath(path: string): boolean {
    if (!path) return false;
    const segments = path.split("/").filter(Boolean);
    // Must have an even number of segments (collection/document pairs)
    return segments.length >= 2 && segments.length % 2 === 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Reference Display (for table cells & inline display)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compact, read-only reference display for table cells.
 * Shows collection + document ID with a link icon.
 */
export function ReferencePreview({ path }: { path: string }) {
    const segments = parseRefPath(path);
    if (segments.length === 0) {
        return (
            <span className="text-surface-400 dark:text-surface-500 italic">
                empty reference
            </span>
        );
    }

    // Show last collection + document
    const docId = segments[segments.length - 1]?.value ?? "";
    const collection = segments[segments.length - 2]?.value ?? "";

    return (
        <span className="inline-flex items-center gap-1 max-w-full">
            <LinkIcon size="smallest" className="text-indigo-400 flex-shrink-0" />
            <span className="text-surface-500 dark:text-surface-400 text-xs truncate">
                {collection}
            </span>
            <span className="text-surface-300 dark:text-surface-600">/</span>
            <span className="font-medium truncate" style={{ color: "#6366f1" }}>{docId}</span>
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Reference Editor (for form panel & popover editor)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A purpose-built editor for Firestore document references.
 *
 * Displays the reference path visually split into collection/document
 * segments with breadcrumb-like chips, and allows editing the full
 * path via a text field.
 */
export function ReferenceEditor({
    value,
    onChange,
    autoFocus = false,
    compact = false,
}: {
    /** The reference value, e.g. { _ref: "users/abc123" } */
    value: { _ref: string };
    /** Called when the path changes */
    onChange: (value: { _ref: string }) => void;
    /** Auto-focus the input */
    autoFocus?: boolean;
    /** Compact mode for inline use */
    compact?: boolean;
}) {
    const [editing, setEditing] = useState(autoFocus || !value._ref);
    const [editPath, setEditPath] = useState(value._ref ?? "");

    const segments = useMemo(() => parseRefPath(value._ref ?? ""), [value._ref]);
    const valid = useMemo(() => isValidRefPath(editPath), [editPath]);

    // Sync when external value changes
    useEffect(() => {
        setEditPath(value._ref ?? "");
    }, [value._ref]);

    const handleCommit = useCallback(() => {
        const trimmed = editPath.trim().replace(/^\/|\/$/g, "");
        onChange({ _ref: trimmed });
        setEditing(false);
    }, [editPath, onChange]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleCommit();
            }
            if (e.key === "Escape") {
                setEditPath(value._ref ?? "");
                setEditing(false);
            }
        },
        [handleCommit, value._ref]
    );

    // ─── Compact mode (inline in field rows) ───────────────────────
    if (compact) {
        return (
            <div className="flex items-center gap-1.5 w-full min-h-[28px]">
                <LinkIcon
                    size="smallest"
                    className="text-rose-400 flex-shrink-0"
                />
                {editing || !value._ref ? (
                    <input
                        type="text"
                        value={editPath}
                        onChange={(e) => {
                            setEditPath(e.target.value);
                            onChange({ _ref: e.target.value });
                        }}
                        onBlur={handleCommit}
                        onKeyDown={handleKeyDown}
                        autoFocus={autoFocus}
                        placeholder="collection/documentId"
                        className={cls(
                            "flex-grow min-w-0 bg-transparent text-sm outline-none",
                            "border-b py-0.5 font-mono",
                            "text-text-primary dark:text-white",
                            valid || !editPath
                                ? "border-surface-300 dark:border-surface-600 focus:border-primary"
                                : "border-red-400 dark:border-red-500"
                        )}
                    />
                ) : (
                    <div
                        className="flex items-center gap-0.5 min-w-0 flex-grow cursor-text overflow-hidden"
                        onClick={() => setEditing(true)}
                    >
                        {segments.map((seg, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && (
                                    <span className="text-surface-300 dark:text-surface-600 text-xs flex-shrink-0">
                                        /
                                    </span>
                                )}
                                <span
                                    className={cls(
                                        "truncate text-sm",
                                        seg.type === "collection"
                                            ? "text-surface-500 dark:text-surface-400"
                                            : "font-medium text-text-primary dark:text-white"
                                    )}
                                >
                                    {seg.value}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ─── Full mode (popover / panel editor) ─────────────────────────
    return (
        <div className="flex flex-col gap-2 p-2 w-full">
            {/* Path segments visual */}
            {segments.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                    {segments.map((seg, i) => (
                        <React.Fragment key={i}>
                            {i > 0 && (
                                <span className="text-surface-300 dark:text-surface-600">
                                    /
                                </span>
                            )}
                            <div
                                className={cls(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-sm",
                                    seg.type === "collection"
                                        ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                                        : "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                                )}
                            >
                                {seg.type === "collection" ? (
                                    <FolderIcon
                                        size="smallest"
                                        className="text-amber-400 dark:text-amber-500"
                                    />
                                ) : (
                                    <DescriptionIcon
                                        size="smallest"
                                        className="text-blue-400 dark:text-blue-500"
                                    />
                                )}
                                <span className="font-mono text-xs">
                                    {seg.value}
                                </span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Editable input */}
            <div className="flex items-center gap-2">
                <LinkIcon
                    size="smallest"
                    className="text-rose-400 flex-shrink-0"
                />
                <input
                    type="text"
                    value={editPath}
                    onChange={(e) => {
                        setEditPath(e.target.value);
                        onChange({ _ref: e.target.value });
                    }}
                    onKeyDown={handleKeyDown}
                    autoFocus={autoFocus}
                    placeholder="Enter path: collection/documentId"
                    className={cls(
                        "flex-grow min-w-0 bg-transparent text-sm outline-none",
                        "border-b py-1 font-mono",
                        "text-text-primary dark:text-white",
                        valid || !editPath
                            ? "border-surface-300 dark:border-surface-600 focus:border-primary"
                            : "border-red-400 dark:border-red-500"
                    )}
                />
            </div>

            {/* Validation hint */}
            {editPath && !valid && (
                <Typography
                    variant="caption"
                    className="text-red-500 dark:text-red-400 text-xs"
                >
                    Path must have an even number of segments (collection/document pairs)
                </Typography>
            )}
            {!editPath && (
                <Typography
                    variant="caption"
                    className="text-surface-400 dark:text-surface-500 text-xs"
                >
                    Enter a document path, e.g.{" "}
                    <span className="font-mono">users/abc123</span> or{" "}
                    <span className="font-mono">
                        orders/order1/items/item1
                    </span>
                </Typography>
            )}
        </div>
    );
}
