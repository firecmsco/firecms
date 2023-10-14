import { FireCMSPlugin } from "firecms";
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
