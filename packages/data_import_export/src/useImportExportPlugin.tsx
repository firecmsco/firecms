import React, { useMemo } from "react";
import { EntityCollection, FireCMSPlugin } from "@firecms/core";
import { ImportCollectionAction } from "./export_import/ImportCollectionAction";
import { ExportCollectionAction } from "./export_import/ExportCollectionAction";

/**
 *
 */
export function useImportExportPlugin(props?: ImportExportPluginProps): FireCMSPlugin<any, any, any, ImportExportPluginProps> {

    return useMemo(() => ({
        name: "Import/Export",
        collections: {
            CollectionActions: [ImportCollectionAction, ExportCollectionAction],
            collectionActionsProps: props
        }
    }), [props]);
}

export type ImportExportPluginProps = {
    exportAllowed?: (props: ExportAllowedParams) => boolean;
    notAllowedView: React.ReactNode;
}
export type ExportAllowedParams = { collectionEntitiesCount: number, path: string, collection: EntityCollection };
