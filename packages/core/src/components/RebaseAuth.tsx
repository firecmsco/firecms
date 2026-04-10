import React, { useLayoutEffect, useRef } from "react";
import { useRebaseRegistryDispatch } from "../hooks";
import type { RebaseAuthConfig } from "@rebasepro/types";

/**
 * Declarative component to configure authentication in Rebase.
 * Renders nothing — purely registers config into the RebaseRegistry.
 *
 * This is a framework-level component that lives in core since
 * authentication is cross-cutting (CMS, Studio, any app area).
 * @group Core
 */
export function RebaseAuth({ loginView }: RebaseAuthConfig) {
    const dispatch = useRebaseRegistryDispatch();
    const registeredRef = useRef(false);

    useLayoutEffect(() => {
        dispatch.registerAuth({ loginView });
        registeredRef.current = true;
        return () => {
            registeredRef.current = false;
            dispatch.unregisterAuth();
        };
    }, [dispatch, loginView]);

    return null;
}
