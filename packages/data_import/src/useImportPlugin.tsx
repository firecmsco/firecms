import { useMemo } from "react";
import { FireCMSPlugin } from "@firecms/core";
import { ImportCollectionAction } from "./import";

/**
 *
 */
export function useImportPlugin(props?: ImportPluginProps): FireCMSPlugin<any, any, any, ImportPluginProps> {

    return useMemo(() => ({
        key: "import_export",
        collectionView: {
            CollectionActions: [ImportCollectionAction],
            collectionActionsProps: props
        }
    }), [props]);
}

export type ImportPluginProps = {
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
