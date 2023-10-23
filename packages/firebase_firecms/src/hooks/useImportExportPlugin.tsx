import { FireCMSPlugin } from "@firecms/core";
import { ExportColectionAction } from "../export_import/ExportColectionAction";
import { ImportCollectionAction } from "../export_import/ImportCollectionAction";

/**
 *
 */
export function useImportExportPlugin(): FireCMSPlugin {

    return {
        name: "Import/Export",
        collections: {
            CollectionActions: [ImportCollectionAction , ExportColectionAction]
        },
    };
}
