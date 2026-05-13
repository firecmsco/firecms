import React, { useEffect, useState } from "react";
import { EntityCustomViewParams, useSnackbarController } from "@firecms/core";
import { CircularProgress, Typography } from "@firecms/ui";
import { useAdminApi, useAdminProjectId } from "./api/AdminApiProvider";
import { AdminDocument } from "./api/admin_api";
import { DocumentPanel } from "./DocumentPanel";

/**
 * Thin wrapper that bridges the EntityCustomViewParams interface
 * to the existing DocumentPanel component.
 *
 * Fetches the raw AdminDocument and delegates all editing to DocumentPanel.
 */
export function RawDataView({
    entity,
}: EntityCustomViewParams) {
    const adminApi = useAdminApi();
    const projectId = useAdminProjectId();
    const snackbar = useSnackbarController();

    const [loading, setLoading] = useState(true);
    const [doc, setDoc] = useState<AdminDocument | null>(null);

    const collectionPath = entity?.path;

    useEffect(() => {
        if (!entity || !collectionPath) {
            setLoading(false);
            return;
        }

        setLoading(true);
        adminApi
            .getDocument(projectId, collectionPath, entity.id)
            .then((d) => setDoc(d))
            .catch((err: any) => {
                // Fallback: build an AdminDocument from entity values
                console.warn("[RawDataView] Failed to fetch raw document, using entity values:", err.message);
                setDoc({
                    id: entity.id,
                    path: `${entity.path}/${entity.id}`,
                    values: entity.values ?? {},
                });
            })
            .finally(() => setLoading(false));
    }, [entity?.id, collectionPath, projectId, adminApi]);

    if (!entity) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <Typography variant="body2" color="secondary">
                    Save the entity first to view raw data.
                </Typography>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <CircularProgress />
            </div>
        );
    }

    if (!doc) {
        return (
            <div className="flex items-center justify-center h-full p-8">
                <Typography variant="body2" color="secondary">
                    Could not load document.
                </Typography>
            </div>
        );
    }

    return (
        <DocumentPanel
            projectId={projectId}
            document={doc}
            onClose={() => {/* no-op: closing is handled by the entity view */}}
            onDocumentUpdated={(updated) => {
                setDoc(updated);
                snackbar.open({ type: "success", message: "Document saved" });
            }}
            onNavigateToSubcollection={() => {/* no-op in tab context */}}
            onDocumentDeleted={() => {
                snackbar.open({ type: "info", message: "Document deleted" });
            }}
        />
    );
}
