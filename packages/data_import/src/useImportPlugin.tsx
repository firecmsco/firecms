import { useMemo } from "react";
import { RebasePlugin } from "@rebasepro/types";
import { ImportCollectionAction } from "./import";

/**
 * Plugin to import collection data from CSV, Excel or JSON files.
 */
export function useImportPlugin(props?: ImportPluginProps): RebasePlugin {

    return useMemo(() => ({
        key: "import",
        slots: [
            {
                slot: "collection.actions",
                Component: ImportCollectionAction,
                props: props,
                order: 60,
            },
        ],
    }), [props]);
}

export type ImportPluginProps = {
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
