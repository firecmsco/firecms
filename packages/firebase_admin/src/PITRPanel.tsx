import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    cls,
    Typography,
    Button,
    IconButton,
    Tooltip,
    defaultBorderMixin,
    HistoryIcon,
    CloseIcon,
    RestoreIcon,
    Chip,
    DateTimeField,
} from "@firecms/ui";
import { ConfirmationDialog, jsonStringifyReplacer } from "@firecms/core";
import { useAdminApi } from "./api/AdminApiProvider";
import { AdminDocument } from "./api/admin_api";

// ─── Helpers ────────────────────────────────────────────────────────────────

function roundToMinute(date: Date): Date {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
}

function formatRelativeTime(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h ago`;
}

// ─── Presets ────────────────────────────────────────────────────────────────

interface TimePreset {
    label: string;
    getTime: () => Date;
}

const TIME_PRESETS: TimePreset[] = [
    { label: "5m", getTime: () => roundToMinute(new Date(Date.now() - 5 * 60 * 1000)) },
    { label: "15m", getTime: () => roundToMinute(new Date(Date.now() - 15 * 60 * 1000)) },
    { label: "1h", getTime: () => roundToMinute(new Date(Date.now() - 60 * 60 * 1000)) },
    { label: "6h", getTime: () => roundToMinute(new Date(Date.now() - 6 * 60 * 60 * 1000)) },
    { label: "1d", getTime: () => roundToMinute(new Date(Date.now() - 24 * 60 * 60 * 1000)) },
    { label: "3d", getTime: () => roundToMinute(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) },
    { label: "7d", getTime: () => roundToMinute(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) },
];

// ─── PITR Toolbar (Collection-level — rendered inline in the header) ────────

export function PITRToolbar({
    active,
    readTime,
    onActivate,
    onDeactivate,
    onTimeChange,
    loading,
    error,
}: {
    active: boolean;
    readTime: Date | null;
    onActivate: () => void;
    onDeactivate: () => void;
    onTimeChange: (time: Date) => void;
    loading?: boolean;
    error?: string | null;
}) {
    const handleTimeInput = useCallback((date: Date | null) => {
        if (date && !isNaN(date.getTime())) {
            const rounded = roundToMinute(date);
            onTimeChange(rounded);
        }
    }, [onTimeChange]);

    // Not active → render nothing. The icon button is rendered inline
    // in DocumentTable's toolbar instead.
    if (!active) return null;

    return (
        <div className={cls(
            "flex items-center gap-1.5 px-3 py-1.5",
            "border-b",
            defaultBorderMixin,
            "bg-surface-50 dark:bg-surface-900",
        )}>
            <HistoryIcon size="smallest" className="text-primary flex-shrink-0" />

            {/* Quick presets */}
            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
                {TIME_PRESETS.map((preset) => {
                    const isSelected = readTime && Math.abs(readTime.getTime() - preset.getTime().getTime()) < 60000;
                    return (
                        <button
                            key={preset.label}
                            onClick={() => onTimeChange(preset.getTime())}
                            className={cls(
                                "text-[11px] px-1.5 py-0.5 rounded transition-colors whitespace-nowrap",
                                isSelected
                                    ? "bg-primary text-white font-medium"
                                    : "text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
                            )}
                        >
                            {preset.label}
                        </button>
                    );
                })}
            </div>

            {/* Separator */}
            <div className="w-px h-4 bg-surface-200 dark:bg-surface-700 flex-shrink-0" />

            {/* Date-time picker */}
            <DateTimeField
                value={readTime}
                onChange={handleTimeInput}
                mode="date_time"
                size="smallest"
                invisible
                className="w-[170px] flex-shrink-0"
                inputClassName="!text-xs !py-1 !px-2"
            />

            {readTime && (
                <Typography
                    variant="caption"
                    className="text-[11px] text-surface-500 dark:text-surface-400 whitespace-nowrap"
                >
                    {formatRelativeTime(readTime)}
                </Typography>
            )}

            {loading && (
                <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
            )}

            {error && (
                <Typography
                    variant="caption"
                    className="text-[11px] text-red-500 dark:text-red-400 whitespace-nowrap truncate max-w-[200px]"
                    title={error}
                >
                    {error.length > 40 ? "PITR unavailable" : error}
                </Typography>
            )}

            <div className="flex-grow" />

            {/* Read-only indicator */}
            <Typography
                variant="caption"
                className="text-[10px] uppercase tracking-wider text-surface-400 dark:text-surface-500 font-medium whitespace-nowrap"
            >
                read-only
            </Typography>

            <Tooltip title="Exit time travel">
                <IconButton
                    size="smallest"
                    onClick={onDeactivate}
                >
                    <CloseIcon size="smallest" />
                </IconButton>
            </Tooltip>
        </div>
    );
}

// ─── PITR Document View (Single-document historical comparison) ─────────────

export function PITRDocumentView({
    projectId,
    document,
    databaseId,
}: {
    projectId: string;
    document: AdminDocument;
    databaseId?: string;
}) {
    const adminApi = useAdminApi();
    const [readTime, setReadTime] = useState<Date | null>(null);
    const [historicalDoc, setHistoricalDoc] = useState<AdminDocument | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [restoreError, setRestoreError] = useState<string | null>(null);

    const fetchHistorical = useCallback(async (time: Date) => {
        setLoading(true);
        setError(null);
        try {
            const parentPath = document.path.substring(0, document.path.lastIndexOf("/"));
            const result = await adminApi.readDocumentAtTime(
                projectId,
                parentPath,
                document.id,
                time.toISOString(),
                databaseId
            );
            setHistoricalDoc(result);
            if (!result) {
                setError("Document did not exist at this time");
            }
        } catch (e: any) {
            setError(e.message);
            setHistoricalDoc(null);
        } finally {
            setLoading(false);
        }
    }, [projectId, document, databaseId, adminApi]);

    const handleTimeSelect = useCallback((time: Date) => {
        setReadTime(time);
        fetchHistorical(time);
    }, [fetchHistorical]);

    const handleTimeInput = useCallback((date: Date | null) => {
        if (date && !isNaN(date.getTime())) {
            const rounded = roundToMinute(date);
            setReadTime(rounded);
            fetchHistorical(rounded);
        }
    }, [fetchHistorical]);

    // Compute diff between current and historical values
    const diff = useMemo(() => {
        if (!historicalDoc) return null;
        const current = document.values ?? {};
        const historical = historicalDoc.values ?? {};
        const allKeys = new Set([...Object.keys(current), ...Object.keys(historical)]);

        const changes: Array<{
            key: string;
            type: "added" | "removed" | "changed" | "unchanged";
            currentValue: any;
            historicalValue: any;
        }> = [];

        for (const key of allKeys) {
            const inCurrent = key in current;
            const inHistorical = key in historical;
            const currentVal = current[key];
            const historicalVal = historical[key];

            if (!inHistorical && inCurrent) {
                changes.push({ key, type: "added", currentValue: currentVal, historicalValue: undefined });
            } else if (inHistorical && !inCurrent) {
                changes.push({ key, type: "removed", currentValue: undefined, historicalValue: historicalVal });
            } else if (JSON.stringify(currentVal, jsonStringifyReplacer) !== JSON.stringify(historicalVal, jsonStringifyReplacer)) {
                changes.push({ key, type: "changed", currentValue: currentVal, historicalValue: historicalVal });
            } else {
                changes.push({ key, type: "unchanged", currentValue: currentVal, historicalValue: historicalVal });
            }
        }

        changes.sort((a, b) => {
            const order = { changed: 0, added: 1, removed: 2, unchanged: 3 };
            return order[a.type] - order[b.type];
        });

        return changes;
    }, [document, historicalDoc]);

    const changedCount = diff?.filter(d => d.type !== "unchanged").length ?? 0;

    const handleRestore = useCallback(async () => {
        if (!historicalDoc) return;
        setRestoring(true);
        setRestoreError(null);
        try {
            const parentPath = document.path.substring(0, document.path.lastIndexOf("/"));
            await adminApi.updateDocument(
                projectId,
                parentPath,
                document.id,
                historicalDoc.values,
                databaseId
            );
            setRestoreDialogOpen(false);
            window.location.reload();
        } catch (e: any) {
            setRestoreError(e.message);
        } finally {
            setRestoring(false);
        }
    }, [historicalDoc, document, projectId, databaseId, adminApi]);

    if (!expanded) {
        return (
            <div className={cls("px-4 py-1.5 border-b flex items-center", defaultBorderMixin)}>
                <button
                    onClick={() => setExpanded(true)}
                    className={cls(
                        "flex items-center gap-1.5 text-xs",
                        "text-surface-500 dark:text-surface-400",
                        "hover:text-primary dark:hover:text-primary transition-colors"
                    )}
                >
                    <HistoryIcon size="smallest" />
                    <span>History</span>
                </button>
            </div>
        );
    }

    return (
        <div className={cls("border-b", defaultBorderMixin)}>
            {/* Header */}
            <div className={cls(
                "flex items-center gap-2 px-4 py-1.5",
                "border-b",
                defaultBorderMixin,
                "bg-surface-50 dark:bg-surface-900",
            )}>
                <HistoryIcon size="smallest" className="text-primary" />
                <Typography variant="caption" className="font-medium text-xs">
                    Point-in-Time Recovery
                </Typography>
                <Typography variant="caption" className="text-[10px] text-surface-400 dark:text-surface-500">
                    up to 7 days
                </Typography>
                <div className="flex-grow" />
                <IconButton
                    size="smallest"
                    onClick={() => { setExpanded(false); setHistoricalDoc(null); setReadTime(null); }}
                >
                    <CloseIcon size="smallest" />
                </IconButton>
            </div>

            {/* Time selection */}
            <div className="px-4 py-2 space-y-2">
                {/* Quick presets */}
                <div className="flex items-center gap-1 flex-wrap">
                    {TIME_PRESETS.map((preset) => {
                        const isSelected = readTime && Math.abs(readTime.getTime() - preset.getTime().getTime()) < 60000;
                        return (
                            <button
                                key={preset.label}
                                onClick={() => handleTimeSelect(preset.getTime())}
                                className={cls(
                                    "text-[11px] px-2 py-1 rounded transition-colors",
                                    "border",
                                    isSelected
                                        ? "bg-primary text-white border-primary font-medium"
                                        : "border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                                )}
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>

                {/* Custom picker */}
                <div className="flex items-center gap-2">
                    <Typography variant="caption" color="secondary" className="flex-shrink-0 text-[11px]">
                        Custom:
                    </Typography>
                    <DateTimeField
                        value={readTime}
                        onChange={handleTimeInput}
                        mode="date_time"
                        size="smallest"
                        invisible
                        className="flex-grow"
                        inputClassName="!text-xs !py-1 !px-2"
                    />
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="px-4 py-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <Typography variant="caption" color="secondary" className="text-xs">Loading…</Typography>
                </div>
            )}

            {/* Error */}
            {error && !loading && (
                <div className="px-4 py-2">
                    <Typography variant="caption" color="error">{error}</Typography>
                </div>
            )}

            {/* Diff view */}
            {diff && !loading && historicalDoc && (
                <div className="px-4 py-2 space-y-2">
                    {/* Summary + restore */}
                    <div className="flex items-center gap-2">
                        <Typography variant="caption" color="secondary" className="text-xs">
                            {changedCount === 0
                                ? "No changes from this time"
                                : `${changedCount} field${changedCount > 1 ? "s" : ""} changed`
                            }
                        </Typography>
                        {changedCount > 0 && (
                            <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                startIcon={<RestoreIcon size="smallest" />}
                                onClick={() => setRestoreDialogOpen(true)}
                                className="text-xs"
                            >
                                Restore
                            </Button>
                        )}
                    </div>

                    {/* Field diffs */}
                    <div className={cls(
                        "max-h-[260px] overflow-y-auto rounded",
                        "border",
                        defaultBorderMixin,
                    )}>
                        {diff.filter(d => d.type !== "unchanged").map(({ key, type, currentValue, historicalValue }) => (
                            <div
                                key={key}
                                className={cls(
                                    "px-3 py-1.5 text-xs font-mono",
                                    "border-b last:border-b-0",
                                    defaultBorderMixin,
                                )}
                            >
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={cls(
                                        "inline-block w-1.5 h-1.5 rounded-full flex-shrink-0",
                                        type === "added" && "bg-green-500",
                                        type === "removed" && "bg-red-500",
                                        type === "changed" && "bg-primary"
                                    )} />
                                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{key}</span>
                                    <span className={cls(
                                        "text-[10px] uppercase font-medium px-1 rounded",
                                        type === "added" && "text-green-600 dark:text-green-400 bg-green-500/10",
                                        type === "removed" && "text-red-600 dark:text-red-400 bg-red-500/10",
                                        type === "changed" && "text-primary bg-primary/10"
                                    )}>
                                        {type}
                                    </span>
                                </div>
                                {type === "changed" && (
                                    <div className="ml-3.5 space-y-0.5">
                                        <div className="flex gap-1">
                                            <span className="text-red-500 dark:text-red-400 flex-shrink-0">−</span>
                                            <span className="text-surface-600 dark:text-surface-400 break-all">
                                                {formatDiffValue(historicalValue)}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <span className="text-green-500 dark:text-green-400 flex-shrink-0">+</span>
                                            <span className="text-surface-600 dark:text-surface-400 break-all">
                                                {formatDiffValue(currentValue)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {type === "added" && (
                                    <div className="ml-3.5">
                                        <span className="text-surface-600 dark:text-surface-400 break-all">
                                            {formatDiffValue(currentValue)}
                                        </span>
                                    </div>
                                )}
                                {type === "removed" && (
                                    <div className="ml-3.5">
                                        <span className="text-surface-600 dark:text-surface-400 break-all">
                                            {formatDiffValue(historicalValue)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {diff.filter(d => d.type === "unchanged").length > 0 && changedCount > 0 && (
                            <div className="px-3 py-1.5 text-xs text-surface-400 dark:text-surface-500">
                                {diff.filter(d => d.type === "unchanged").length} unchanged field(s)
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Restore confirmation */}
            <ConfirmationDialog
                open={restoreDialogOpen}
                title="Restore document"
                body={
                    <div className="space-y-2">
                        <Typography>
                            Are you sure you want to restore <strong>{document.id}</strong> to its state at{" "}
                            <strong>{readTime?.toLocaleString()}</strong>?
                        </Typography>
                        <Typography variant="caption" color="secondary">
                            This will overwrite the current document values with the historical version.
                            This action can be reverted using PITR again.
                        </Typography>
                        {restoreError && (
                            <Typography variant="caption" color="error">
                                {restoreError}
                            </Typography>
                        )}
                    </div>
                }
                loading={restoring}
                onAccept={handleRestore}
                onCancel={() => setRestoreDialogOpen(false)}
            />
        </div>
    );
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function formatDiffValue(val: any): string {
    if (val === null || val === undefined) return "null";
    if (typeof val === "boolean") return String(val);
    if (typeof val === "number") return String(val);
    if (typeof val === "string") return val.length > 200 ? `"${val.substring(0, 200)}…"` : `"${val}"`;
    if (val?._seconds !== undefined) {
        return new Date(val._seconds * 1000).toISOString();
    }
    try {
        const str = JSON.stringify(val, jsonStringifyReplacer, 2);
        return str.length > 500 ? str.substring(0, 500) + "…" : str;
    } catch {
        return String(val);
    }
}
