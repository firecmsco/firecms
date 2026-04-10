import React from "react";
import "@fontsource/jetbrains-mono";
import "typeface-rubik";

import { useRebaseAuthController, useBackendUserManagement, RebaseAuth } from "@rebasepro/auth";
import { Rebase } from "@rebasepro/core";
import { RebaseCMS, RebaseShell } from "@rebasepro/cms";
import { useDataEnhancementPlugin } from "@rebasepro/data_enhancement";
import { RebaseStudio, useCollectionEditorPlugin, useLocalCollectionsConfigController } from "@rebasepro/studio";
import { createRebaseClient } from "@rebasepro/client";
import { collections } from "virtual:rebase-collections";

// Configuration from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
    const rebaseClient = React.useMemo(() => createRebaseClient({
        baseUrl: API_URL,
        websocketUrl: API_URL.replace(/^http/, "ws")
    }), []);

    const authController = useRebaseAuthController({
        client: rebaseClient,
        googleClientId: GOOGLE_CLIENT_ID
    });

    const userManagement = useBackendUserManagement({
        client: rebaseClient,
        currentUser: authController.user
    });

    const dataEnhancementPlugin = useDataEnhancementPlugin();
    const collectionConfigController = useLocalCollectionsConfigController(
        rebaseClient,
        collections,
        {
            getAuthToken: authController.getAuthToken
        }
    );
    const collectionEditorPlugin = useCollectionEditorPlugin({
        collectionConfigController
    });

    const plugins = React.useMemo(() => [dataEnhancementPlugin, collectionEditorPlugin], [dataEnhancementPlugin, collectionEditorPlugin]);

    return (
        <Rebase
            apiUrl={API_URL}
            client={rebaseClient}
            authController={authController}
            userManagement={userManagement}
            plugins={plugins}
        >
            <RebaseAuth />
            <RebaseCMS collections={collections} />
            <RebaseStudio configController={collectionConfigController} />
            <RebaseShell title="Rebase" />
        </Rebase>
    );
}
