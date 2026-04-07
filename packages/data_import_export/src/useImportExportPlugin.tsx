import React, { useMemo } from "react";
import { EntityCollection, RebasePlugin } from "@rebasepro/types";
import { ImportCollectionAction } from "@rebasepro/data_import";
import { ExportCollectionAction } from "@rebasepro/data_export";

/**
 * useImportExportPlugin is deprecated.
 * Please use useImportPlugin and useExportPlugin separately
 * @deprecated
 */
export function useImportExportPlugin(props?: ImportExportPluginProps): RebasePlugin {

    console.warn("useImportExportPlugin is deprecated. Please use useImportPlugin and useExportPlugin separately");

    return useMemo(() => ({
        key: "import_export",
        slots: [
            {
                slot: "collection.actions",
                Component: ImportCollectionAction,
                props: props,
                order: 60,
            },
            {
                slot: "collection.actions",
                Component: ExportCollectionAction,
                props: props,
                order: 70,
            },
        ],
    }), [props]);
}

export type ImportExportPluginProps = {
    exportAllowed?: (props: ImportExportAllowedParams) => boolean;
    notAllowedView?: React.ReactNode;
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
export type ImportExportAllowedParams = { collectionEntitiesCount: number, path: string, collection: EntityCollection };
