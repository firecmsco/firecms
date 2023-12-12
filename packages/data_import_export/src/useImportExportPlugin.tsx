import React from "react";
import { EntityCollection, FireCMSPlugin } from "@firecms/core";
import { ImportCollectionAction } from "./export_import/ImportCollectionAction";
import { ExportCollectionAction } from "./export_import/ExportCollectionAction";

/**
 *
 */
export function useImportExportPlugin(props?: ImportExportPluginProps): FireCMSPlugin<any, any, any, ImportExportPluginProps> {

    return {
        name: "Import/Export",
        collections: {
            CollectionActions: [ImportCollectionAction, ExportCollectionAction],
            collectionActionsProps: props
        }
    };
}

export type ImportExportPluginProps = {
    exportAllowed?: (props: { collectionEntitiesCount: number, path: string, collection: EntityCollection }) => boolean;
    notAllowedView: React.ReactNode;
}
