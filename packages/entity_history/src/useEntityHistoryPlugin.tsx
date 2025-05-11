import { useCallback, useMemo } from "react";
import { EntityCollection, FireCMSPlugin, mergeCallbacks, User } from "@firecms/core";
import { EntityHistoryView } from "./components/EntityHistoryView";
import { HistoryIcon } from "@firecms/ui";
import { entityHistoryCallbacks } from "./entity_history_callbacks";
import { HistoryControllerProvider } from "./HistoryControllerProvider";

/**
 *
 */
export function useEntityHistoryPlugin(props?: EntityHistoryPluginProps): FireCMSPlugin<any, any, any, EntityHistoryPluginProps> {

    const { defaultEnabled = false } = props ?? {};

    const modifyCollection = useCallback((collection: EntityCollection) => {
        if (collection.history === true || defaultEnabled) {
            return {
                ...collection,
                history: true,
                entityViews: [
                    ...(collection.entityViews ?? []),
                    {
                        key: "__history",
                        name: "History",
                        tabComponent: <HistoryIcon size={"small"}/>,
                        Builder: EntityHistoryView,
                        position: "start"
                    }
                ],
                callbacks: mergeCallbacks(collection.callbacks, entityHistoryCallbacks)
            } satisfies EntityCollection;
        }
        return collection;
    }, []);

    return useMemo(() => ({
        key: "entity_history",
        provider: {
            Component: HistoryControllerProvider,
            props: {
                getUser: props?.getUser
            }
        },
        collection: {
            modifyCollection
        }
    } satisfies FireCMSPlugin), [props]);
}

export type EntityHistoryPluginProps = {
    /**
     * If true, the history view will be enabled to all collections by default.
     * Each collection can override this value by setting the `history` property.
     */
    defaultEnabled?: boolean;

    /**
     * Function to get the user object from the uid.
     * @param uid
     */
    getUser?: (uid: string) => User | null;
}
