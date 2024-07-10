import React, { useMemo } from "react";
import { EntityCollection, FireCMSPlugin } from "@firecms/core";
import { ImportCollectionAction } from "@firecms/data_import";
import { ExportCollectionAction } from "@firecms/data_export";

/**
 * useImportExportPlugin is deprecated.
 * Please use useImportPlugin and useExportPlugin separately
 * @deprecated
 */
export function useImportExportPlugin(props?: ImportExportPluginProps): FireCMSPlugin<any, any, any, ImportExportPluginProps> {

    console.warn("useImportExportPlugin is deprecated. Please use useImportPlugin and useExportPlugin separately");

    return useMemo(() => ({
        key: "import_export",
        collectionView: {
            CollectionActions: [ImportCollectionAction, ExportCollectionAction],
            collectionActionsProps: props
        }
    }), [props]);
}

export type ImportExportPluginProps = {
    exportAllowed?: (props: ImportExportAllowedParams) => boolean;
    notAllowedView?: React.ReactNode;
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
export type ImportExportAllowedParams = { collectionEntitiesCount: number, path: string, collection: EntityCollection };
