import React from "react";
import { ExplorerView } from "./components/ExplorerView";
import { SubscriptionTier } from "./types";
import { useSubscriptionCheck } from "./hooks/useSubscriptionCheck";
import { Alert, Typography } from "@firecms/ui";
import { ProjectsApi } from "./services/collectionDiscovery";

interface ExplorerPluginProps {
    subscriptionTier: SubscriptionTier;
    projectsApi?: ProjectsApi;
    projectId?: string;
}

/**
 * Explorer Plugin Component
 * Provides schema-less Firestore data inspection for Cloud Plus and Pro tiers
 */
export const ExplorerPlugin: React.FC<ExplorerPluginProps> = ({ 
    subscriptionTier,
    projectsApi,
    projectId
}) => {
    const { hasAccess } = useSubscriptionCheck({ subscriptionTier });

    if (!hasAccess) {
        return (
            <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
                <Alert color="warning">
                    <Typography variant="h6" style={{ marginBottom: '8px' }}>
                        Explorer Access Required
                    </Typography>
                    <Typography variant="body2">
                        Explorer is available for Cloud Plus and Pro subscribers. 
                        Upgrade your subscription to access schema-less data inspection features.
                    </Typography>
                </Alert>
            </div>
        );
    }

    return <ExplorerView projectsApi={projectsApi} projectId={projectId} />;
};
