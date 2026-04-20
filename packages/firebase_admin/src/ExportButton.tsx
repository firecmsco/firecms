import React, { useCallback, useState } from "react";
import {
    Menu,
    MenuItem,
    IconButton,
    Tooltip,
    Typography,
    FileDownloadIcon,
} from "@firecms/ui";
import { useSnackbarController } from "@firecms/core";
import { useAdminApi } from "./api/AdminApiProvider";
import { AdminDocument } from "./api/admin_api";
import {
    documentsToCSV,
    documentsToJSON,
    downloadFile,
    collectionFilename,
    ExportFormat,
} from "./export_utils";

export function ExportButton({
    projectId,
    path,
    databaseId,
    documents,
    count,
    filters,
    orderBy,
    orderDirection,
}: {
    projectId: string;
    path: string;
    databaseId?: string;
    /** Currently loaded page of documents */
    documents: AdminDocument[];
    /** Total document count (if known) */
    count?: number;
    filters?: Array<{ field: string; op: string; value: any }>;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
}) {
    const adminApi = useAdminApi();
    const snackbar = useSnackbarController();
    const [exporting, setExporting] = useState(false);

    // ── Export current page ──────────────────────────────────────
    const exportPage = useCallback((format: ExportFormat) => {
        if (documents.length === 0) {
            snackbar.open({ type: "warning", message: "No documents to export" });
            return;
        }

        const filename = collectionFilename(path, format);
        if (format === "csv") {
            downloadFile(documentsToCSV(documents, path), filename, "text/csv;charset=utf-8");
        } else {
            downloadFile(documentsToJSON(documents), filename, "application/json");
        }
        snackbar.open({
            type: "success",
            message: `Exported ${documents.length} documents as ${format.toUpperCase()}`,
        });
    }, [documents, path, snackbar]);

    // ── Export ALL documents (paginate through entire collection) ─
    const exportAll = useCallback(async (format: ExportFormat) => {
        setExporting(true);
        snackbar.open({
            type: "info",
            message: `Fetching all documents from ${path}…`,
        });

        try {
            const allDocs: AdminDocument[] = [];
            let startAfter: string | undefined;
            const batchSize = 500;
            let hasMore = true;

            while (hasMore) {
                const result = await adminApi.listDocuments(projectId, path, {
                    limit: batchSize,
                    databaseId,
                    startAfter,
                    orderBy,
                    orderDirection,
                    filters,
                });
                allDocs.push(...result.documents);
                hasMore = result.hasMore ?? false;
                if (result.documents.length > 0) {
                    startAfter = result.documents[result.documents.length - 1].id;
                } else {
                    hasMore = false;
                }
            }

            if (allDocs.length === 0) {
                snackbar.open({ type: "warning", message: "No documents to export" });
                setExporting(false);
                return;
            }

            const filename = collectionFilename(path, format);
            if (format === "csv") {
                downloadFile(documentsToCSV(allDocs, path), filename, "text/csv;charset=utf-8");
            } else {
                downloadFile(documentsToJSON(allDocs), filename, "application/json");
            }
            snackbar.open({
                type: "success",
                message: `Exported ${allDocs.length} documents as ${format.toUpperCase()}`,
            });
        } catch (e: any) {
            snackbar.open({
                type: "error",
                message: `Export failed: ${e.message}`,
            });
        } finally {
            setExporting(false);
        }
    }, [projectId, path, databaseId, filters, orderBy, orderDirection, snackbar, adminApi]);

    return (
        <Menu
            trigger={
                <Tooltip title="Export">
                    <IconButton
                        size="small"
                        disabled={exporting}
                        className={exporting ? "animate-pulse" : ""}
                    >
                        <FileDownloadIcon size="small" />
                    </IconButton>
                </Tooltip>
            }
        >
            {/* ── Current page ───────── */}
            <div className="px-4 py-1.5">
                <Typography variant="caption" color="secondary"
                    className="text-xs uppercase tracking-wider font-semibold">
                    Current page ({documents.length})
                </Typography>
            </div>
            <MenuItem dense onClick={() => exportPage("csv")}>
                <FileDownloadIcon size="smallest" />
                Export page as CSV
            </MenuItem>
            <MenuItem dense onClick={() => exportPage("json")}>
                <FileDownloadIcon size="smallest" />
                Export page as JSON
            </MenuItem>

            {/* ── All documents ───────── */}
            <div className="px-4 py-1.5 mt-1 border-t border-surface-200 dark:border-surface-700">
                <Typography variant="caption" color="secondary"
                    className="text-xs uppercase tracking-wider font-semibold">
                    All documents{count !== undefined ? ` (${count.toLocaleString()})` : ""}
                </Typography>
            </div>
            <MenuItem dense onClick={() => exportAll("csv")} disabled={exporting}>
                <FileDownloadIcon size="smallest" />
                Export all as CSV
            </MenuItem>
            <MenuItem dense onClick={() => exportAll("json")} disabled={exporting}>
                <FileDownloadIcon size="smallest" />
                Export all as JSON
            </MenuItem>
        </Menu>
    );
}
