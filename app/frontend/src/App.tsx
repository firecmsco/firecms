import React from "react";
import "@fontsource/jetbrains-mono";
import "typeface-rubik";

import { useRebaseAuthController, useBackendUserManagement, RebaseAuth } from "@rebasepro/auth-rebase";
import { Rebase } from "@rebasepro/core";
import {
    RebaseCMS,
    RebaseShell,
    useCollectionEditorPlugin,
    useLocalCollectionsConfigController,
} from "@rebasepro/cms";
import { CollectionsStudioView } from "@rebasepro/cms/collection_editor_ui";
import { useDataEnhancementPlugin } from "@rebasepro/data_enhancement";
import { RebaseStudio } from "@rebasepro/studio";
import { createRebaseClient } from "@rebasepro/client-rebase";
import { collections } from "virtual:rebase-collections";
import type { AppView } from "@rebasepro/types";

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

    // Schema editor view: provided by CMS, injected into Studio
    const schemaView: AppView = React.useMemo(() => ({
        slug: "schema",
        name: "Edit collections",
        group: "Schema",
        icon: "view_list",
        nestedRoutes: true,
        view: <CollectionsStudioView configController={collectionConfigController} />,
    }), [collectionConfigController]);

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
            <RebaseStudio
                configController={collectionConfigController}
                additionalViews={[schemaView]}
            />
            <RebaseShell title="Rebase" />
        </Rebase>
    );
}
