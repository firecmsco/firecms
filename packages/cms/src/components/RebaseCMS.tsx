import React, { useLayoutEffect, useRef } from "react";
import { useRebaseRegistryDispatch } from "@rebasepro/core";
import type { RebaseCMSConfig } from "@rebasepro/types";

/**
 * Declarative component to configure the CMS in Rebase.
 * Renders nothing — purely registers config into the RebaseRegistry.
 */
export function RebaseCMS({ collections, homePage, entityViews, entityActions, plugins }: RebaseCMSConfig) {
    const dispatch = useRebaseRegistryDispatch();

    useLayoutEffect(() => {
        dispatch.registerCMS({ collections, homePage, entityViews, entityActions, plugins });
        return () => dispatch.unregisterCMS();
    }, [dispatch, collections, homePage, entityViews, entityActions, plugins]);

    return null;
}
