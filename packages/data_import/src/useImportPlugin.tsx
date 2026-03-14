import { useMemo } from "react";
import { RebasePlugin } from "@rebasepro/core";
import { ImportCollectionAction } from "./import";

/**
 *
 */
export function useImportPlugin(props?: ImportPluginProps): RebasePlugin<any, any, any, ImportPluginProps> {

    return useMemo(() => ({
        key: "import",
        collectionView: {
            CollectionActions: [ImportCollectionAction],
            collectionActionsProps: props
        }
    }), [props]);
}

export type ImportPluginProps = {
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
