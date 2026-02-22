import React, { useEffect, useRef } from "react";
import { useCollectionRegistryController } from "@firecms/core";
import { useFireCMSBackend, useProjectConfig } from "../hooks";

export function useRootCollectionSuggestions({ projectId }: { projectId: string }) {
    const collectionRegistry = useCollectionRegistryController();

    const fireCMSBackend = useFireCMSBackend();

    const existingPaths = (collectionRegistry.collections ?? []).map(c => c.dbPath);
    const [loading, setLoading] = React.useState(true);
    const [rootPathSuggestions, setRootPathSuggestions] = React.useState<string[] | undefined>();
    const filteredRootPathSuggestions = (rootPathSuggestions ?? []).filter((path) => !existingPaths.includes(path));

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
            .then((paths: string[]) => {
                setRootPathSuggestions(paths.filter((p: string) => !existingPaths.includes(p.trim().toLowerCase())));
            })
            .finally(() => setLoading(false));
    }, []);

    return {
        rootPathSuggestions: loading ? undefined : filteredRootPathSuggestions,
    };
}
