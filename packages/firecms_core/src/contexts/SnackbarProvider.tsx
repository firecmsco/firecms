"use client";

import React, { PropsWithChildren, useEffect, useState } from "react";
import { SnackbarProvider as NotistackSnackbarProvider } from "notistack";

export const SnackbarProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {

    // Notistack renders the snackbars inline, right where this provider sits in the
    // tree, unless it is given a `domRoot`. Dialogs and side dialogs, on the other
    // hand, are portalled to the body, so any ancestor of this provider that creates
    // a stacking context (a transform, a filter, an `isolate`, a positioned element
    // with a z-index...) traps the snackbars underneath them. Portalling the
    // snackbars to the body as well puts them in the same stacking context as the
    // dialogs, where their z-index actually wins.
    const [domRoot, setDomRoot] = useState<HTMLElement | undefined>(undefined);
    useEffect(() => {
        setDomRoot(document.body);
    }, []);

    return (
        <NotistackSnackbarProvider maxSnack={3}
                                   domRoot={domRoot}
                                   autoHideDuration={3500}>
            {children}
        </NotistackSnackbarProvider>
    );
};
