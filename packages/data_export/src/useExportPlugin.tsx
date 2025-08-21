import React, { useMemo } from "react";
import { EntityCollection, FireCMSPlugin } from "@firecms/types";
import { ExportCollectionAction } from "./export";

/**
 * Use this plugin to be able to export collections data as JSON or CSV
 */
export function useExportPlugin(props?: ExportPluginProps): FireCMSPlugin<any, any, any, ExportPluginProps> {

    return useMemo(() => ({
        key: "export",
        collectionView: {
            CollectionActions: [ExportCollectionAction],
            collectionActionsProps: props
        }
    }), [props]);
}

export type ExportPluginProps = {
    exportAllowed?: (props: ExportAllowedParams) => boolean;
    notAllowedView?: React.ReactNode;
    onAnalyticsEvent?: (event: string, params?: any) => void;
}

export type ExportAllowedParams = { collectionEntitiesCount: number, path: string, collection: EntityCollection };
