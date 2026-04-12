import React, { useLayoutEffect } from "react";
import { useRebaseRegistryDispatch } from "@rebasepro/core";
import type { RebaseCMSConfig } from "@rebasepro/types";

/**
 * Declarative component to configure the CMS in Rebase.
 * Renders nothing — purely registers config into the RebaseRegistry.
 *
 * When `collectionEditor` is provided, the built-in visual schema editor
 * is auto-wired as a native feature (slots, provider, Studio view) without
 * needing any external plugin.
 */
export function RebaseCMS({ collections, homePage, entityViews, entityActions, plugins, collectionEditor }: RebaseCMSConfig) {
    const dispatch = useRebaseRegistryDispatch();

    useLayoutEffect(() => {
        dispatch.registerCMS({ collections, homePage, entityViews, entityActions, plugins, collectionEditor });
        return () => dispatch.unregisterCMS();
    }, [dispatch, collections, homePage, entityViews, entityActions, plugins, collectionEditor]);

    return null;
}
