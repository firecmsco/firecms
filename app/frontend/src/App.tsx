import React from "react";
import "@fontsource/jetbrains-mono";
import "typeface-rubik";

import { useRebaseAuthController, useBackendUserManagement, RebaseAuth } from "@rebasepro/auth";
import { Rebase } from "@rebasepro/core";
import { RebaseCMS, RebaseShell } from "@rebasepro/cms";
import { useDataEnhancementPlugin } from "@rebasepro/plugin-data-enhancement";
import { RebaseStudio } from "@rebasepro/studio";
import { createRebaseClient } from "@rebasepro/client";
import { collections } from "virtual:rebase-collections";

// Configuration from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function App() {
    const rebaseClient = React.useMemo(() => createRebaseClient({
        baseUrl: API_URL
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

    return (
        <Rebase
            client={rebaseClient}
            authController={authController}
            userManagement={userManagement}
            plugins={[dataEnhancementPlugin]}
        >
            <RebaseAuth />
            <RebaseCMS
                collections={collections}
                collectionEditor={{
                    getAuthToken: authController.getAuthToken
                }}
            />
            <RebaseStudio />
            <RebaseShell title="Rebase" />
        </Rebase>
    );
}
