import React, { useEffect, useRef } from "react";
import { useNavigationController } from "@firecms/core";
import { useFireCMSBackend, useProjectConfig } from "../hooks";
import { RootCollectionInfo } from "../api/projects";

export function useRootCollectionSuggestions({ projectId }: { projectId: string }) {
    const navigationController = useNavigationController();

    const fireCMSBackend = useFireCMSBackend();

    const existingPaths = (navigationController.collections ?? []).map(c => c.path);
    const [loading, setLoading] = React.useState(true);
    const [rootPathSuggestions, setRootPathSuggestions] = React.useState<RootCollectionInfo[] | undefined>();
    const filteredRootPathSuggestions = (rootPathSuggestions ?? []).filter((info) => !existingPaths.includes(info.path));

    const requested = useRef(false);

    useEffect(() => {
        if (requested.current)
            return;
        if (!fireCMSBackend.projectsApi) {
            setLoading(false);
            return;
        }
        const googleAccessToken = fireCMSBackend.googleCredential?.accessToken;
        requested.current = true;
        fireCMSBackend.projectsApi.getRootCollections(projectId, googleAccessToken)
            .then((collections) => {
                setRootPathSuggestions(collections.filter(c => !existingPaths.includes(c.path.trim().toLowerCase())));
            })
            // Suggestions are a convenience; a project whose collections cannot
            // be listed just gets none, not an unhandled rejection.
            .catch((error) => {
                console.warn("Could not load root collection suggestions", { projectId, error });
                setRootPathSuggestions([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return {
        rootPathSuggestions: loading ? undefined : filteredRootPathSuggestions,
    };
}
