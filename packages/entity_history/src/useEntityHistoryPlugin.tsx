import { useCallback, useMemo } from "react";
import { EntityCollection, RebasePlugin, User } from "@rebasepro/core";
import { EntityHistoryView } from "./components/EntityHistoryView";
import { HistoryIcon } from "@rebasepro/ui";
import { entityHistoryCallbacks } from "./entity_history_callbacks";
import { HistoryControllerProvider } from "./HistoryControllerProvider";
import { LastEditedByFormAction } from "./components/LastEditedByPluginComponents";

/**
 * This plugin adds a history view to the entity side panel.
 */
export function useEntityHistoryPlugin(props?: EntityHistoryPluginProps): RebasePlugin<any, any, any, EntityHistoryPluginProps> {

    const { defaultEnabled = false } = props ?? {};

    const modifyCollection = useCallback((collection: EntityCollection) => {
        if (collection.history === true || (defaultEnabled && collection.history !== false)) {
            return {
                ...collection,
                history: true,
                entityViews: [
                    ...(collection.entityViews ?? []),
                    {
                        key: "__history",
                        name: "History",
                        tabComponent: <HistoryIcon size={"small"} />,
                        Builder: EntityHistoryView,
                        position: "start"
                    }
                ],
                callbacks: {
                    ...collection.callbacks,
                    beforeSave: async (props) => {
                        let values = props.values;
                        if (collection.callbacks?.beforeSave) {
                            values = await Promise.resolve(collection.callbacks.beforeSave(props)) ?? values;
                        }
                        if (entityHistoryCallbacks.beforeSave) {
                            values = await Promise.resolve(entityHistoryCallbacks.beforeSave({ ...props, values })) ?? values;
                        }
                        return values;
                    },
                    afterSave: async (props) => {
                        if (collection.callbacks?.afterSave) {
                            await Promise.resolve(collection.callbacks.afterSave(props));
                        }
                        if (entityHistoryCallbacks.afterSave) {
                            await Promise.resolve(entityHistoryCallbacks.afterSave(props));
                        }
                    },
                    afterRead: async (props) => {
                        let entity = props.entity;
                        if (collection.callbacks?.afterRead) {
                            entity = await Promise.resolve(collection.callbacks.afterRead(props)) ?? entity;
                        }
                        if (entityHistoryCallbacks.afterRead) {
                            entity = await Promise.resolve(entityHistoryCallbacks.afterRead({ ...props, entity })) ?? entity;
                        }
                        return entity;
                    },
                    afterSaveError: async (props) => {
                        if (collection.callbacks?.afterSaveError) {
                            await Promise.resolve(collection.callbacks.afterSaveError(props));
                        }
                        if (entityHistoryCallbacks.afterSaveError) {
                            await Promise.resolve(entityHistoryCallbacks.afterSaveError(props));
                        }
                    },
                    beforeDelete: (props) => {
                        if (collection.callbacks?.beforeDelete) {
                            collection.callbacks.beforeDelete(props);
                        }
                        if (entityHistoryCallbacks.beforeDelete) {
                            entityHistoryCallbacks.beforeDelete(props);
                        }
                    },
                    afterDelete: (props) => {
                        if (collection.callbacks?.afterDelete) {
                            collection.callbacks.afterDelete(props);
                        }
                        if (entityHistoryCallbacks.afterDelete) {
                            entityHistoryCallbacks.afterDelete(props);
                        }
                    }
                }
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
        form: {
            BeforeTitle: LastEditedByFormAction
        },
        collection: {
            modifyCollection
        }
    } satisfies RebasePlugin), [props]);
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
