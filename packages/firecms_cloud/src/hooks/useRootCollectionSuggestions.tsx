import React, { useEffect, useRef } from "react";
import { useNavigationController } from "@firecms/core";
import { useFireCMSBackend, useProjectConfig } from "../hooks";

export function useRootCollectionSuggestions({ projectId }: { projectId: string }) {
    const navigationController = useNavigationController();

    const fireCMSBackend = useFireCMSBackend();

    const existingPaths = (navigationController.collections ?? []).map(c => c.path);
    const [loading, setLoading] = React.useState(true);
    const [rootPathSuggestions, setRootPathSuggestions] = React.useState<string[] | undefined>();
    const filteredRootPathSuggestions = (rootPathSuggestions ?? []).filter((path) => !existingPaths.includes(path));

    const requested = useRef(false);

    useEffect(() => {
        if (requested.current)
            return;
        const googleAccessToken = fireCMSBackend.googleCredential?.accessToken;
        requested.current = true;
        fireCMSBackend.projectsApi.getRootCollections(projectId, googleAccessToken)
            .then((paths) => {
                setRootPathSuggestions(paths.filter(p => !existingPaths.includes(p.trim().toLowerCase())));
            })
            .finally(() => setLoading(false));
    }, []);

    return {
        rootPathSuggestions: loading ? undefined : filteredRootPathSuggestions,
    };
}
