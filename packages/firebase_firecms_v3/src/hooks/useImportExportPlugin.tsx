import { FireCMSPlugin } from "firecms";
import { ExportButton } from "../export_import/ExportButton";

/**
 *
 */
export function useImportExportPlugin(): FireCMSPlugin {

    return {
        name: "Import/Export",
        collections: {
            CollectionActions: ExportButton
        },
    };
}
