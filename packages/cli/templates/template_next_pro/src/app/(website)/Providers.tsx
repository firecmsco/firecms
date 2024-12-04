"use client";

import React from "react";
import { SnackbarProvider } from "@firecms/core";

export function Providers({ children }: React.PropsWithChildren): JSX.Element {
    return (
        <SnackbarProvider>
            {children}
        </SnackbarProvider>
    );
}
