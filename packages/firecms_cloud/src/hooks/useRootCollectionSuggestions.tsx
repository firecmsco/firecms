import React, { useEffect, useRef } from "react";
import { useCollectionRegistryController } from "@firecms/core";
import { useFireCMSBackend, useProjectConfig } from "../hooks";
import { RootCollectionInfo } from "../api/projects";

export function useRootCollectionSuggestions({ projectId }: { projectId: string }) {
    const collectionRegistry = useCollectionRegistryController();

    const fireCMSBackend = useFireCMSBackend();

    const existingPaths = (collectionRegistry.collections ?? []).map(c => c.dbPath);
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
            .then((paths: RootCollectionInfo[]) => {
                setRootPathSuggestions(paths.filter((p: RootCollectionInfo) => !existingPaths.includes(p.path.trim().toLowerCase())));
            })
            .finally(() => setLoading(false));
    }, []);

    return {
        rootPathSuggestions: loading ? undefined : filteredRootPathSuggestions,
    };
}
