"use client";

import React from "react";
import { SnackbarProvider } from "@firecms/core";

export function Providers({ children }: React.PropsWithChildren): React.ReactElement {
    return (
        <SnackbarProvider>
            {children}
        </SnackbarProvider>
    );
}
