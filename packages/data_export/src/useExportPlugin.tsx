import React, { useMemo } from "react";
import { EntityCollection, RebasePlugin } from "@rebasepro/types";
import { ExportCollectionAction } from "./export";

/**
 * Use this plugin to be able to export collections data as JSON or CSV
 */
export function useExportPlugin(props?: ExportPluginProps): RebasePlugin {

    return useMemo(() => ({
        key: "export",
        slots: [
            {
                slot: "collection.actions",
                Component: ExportCollectionAction,
                props: props,
                order: 70,
            },
        ],
    }), [props]);
}

export type ExportPluginProps = {
    exportAllowed?: (props: ExportAllowedParams) => boolean;
    notAllowedView?: React.ReactNode;
    onAnalyticsEvent?: (event: string, params?: any) => void;
}

export type ExportAllowedParams = { collectionEntitiesCount: number, path: string, collection: EntityCollection };
