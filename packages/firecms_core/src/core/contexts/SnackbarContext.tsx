import React, { PropsWithChildren } from "react";
import { SnackbarProvider as NotistackSnackbarProvider } from "notistack";

export const SnackbarProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {

    return (
        <NotistackSnackbarProvider maxSnack={3}
                                   autoHideDuration={3500}>
            {children}
        </NotistackSnackbarProvider>
    );
};
