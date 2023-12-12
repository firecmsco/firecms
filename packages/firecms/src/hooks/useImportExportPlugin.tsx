import { FireCMSPlugin } from "@firecms/core";
import { ExportCollectionAction } from "../export_import/ExportCollectionAction";
import { ImportCollectionAction } from "../export_import/ImportCollectionAction";

/**
 *
 */
export function useImportExportPlugin(): FireCMSPlugin<any, any, any> {

    return {
        name: "Import/Export",
        collections: {
            CollectionActions: [ImportCollectionAction, ExportCollectionAction]
        }
    };
}
