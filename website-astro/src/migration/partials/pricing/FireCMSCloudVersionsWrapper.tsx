import React from "react";
import { FireCMSCloudVersions } from "./FireCMSCloudVersions";
import { SnackbarProvider } from "@firecms/ui";

/**
 * Wrapper component that provides necessary React context for FireCMSCloudVersions
 */
export function FireCMSCloudVersionsWrapper() {
    return (
        <SnackbarProvider>
            <FireCMSCloudVersions />
        </SnackbarProvider>
    );
}

