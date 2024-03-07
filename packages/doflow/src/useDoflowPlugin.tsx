import { useMemo } from "react";
import { FireCMSPlugin } from "@firecms/core";
import { DoFlowCollectionAction } from "./action/DoFlowCollectionAction";

/**
 *
 */
export function useDoflowPlugin(props?: DoFlowPluginProps): FireCMSPlugin<any, any, any, DoFlowPluginProps> {

    return useMemo(() => ({
        name: "Doflow",
        collections: {
            CollectionActions: [DoFlowCollectionAction],
            collectionActionsProps: props
        }
    }), [props]);
}

export type DoFlowPluginProps = {
    apiKey?: string; // sample prop to pass to the plugin
}
