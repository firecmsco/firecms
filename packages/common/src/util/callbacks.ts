import { EntityCallbacks } from "@firecms/types";
import { mergeDeep } from "./objects";

export const mergeCallbacks = (
    baseCallbacks: EntityCallbacks = {},
    pluginCallbacks: EntityCallbacks = {}
): EntityCallbacks | undefined => {

    if (!baseCallbacks && !pluginCallbacks) {
        return undefined;
    }

    const mergedCallbacks: EntityCallbacks = {};

    // Handle onFetch - returns Entity<M> or Promise<Entity<M>>
    if (baseCallbacks.onFetch || pluginCallbacks.onFetch) {
        mergedCallbacks.onFetch = async (props) => {
            let entity = props.entity;
            if (baseCallbacks.onFetch) {
                entity = await Promise.resolve(baseCallbacks.onFetch(props));
            }
            if (pluginCallbacks.onFetch) {
                entity = await Promise.resolve(pluginCallbacks.onFetch({
                    ...props,
                    entity
                }));
            }
            return entity;
        };
    }

    // Handle onSaveSuccess - returns void or Promise<void>
    if (baseCallbacks.onSaveSuccess || pluginCallbacks.onSaveSuccess) {
        mergedCallbacks.onSaveSuccess = async (props) => {
            if (baseCallbacks.onSaveSuccess) {
                await Promise.resolve(baseCallbacks.onSaveSuccess(props));
            }
            if (pluginCallbacks.onSaveSuccess) {
                await Promise.resolve(pluginCallbacks.onSaveSuccess(props));
            }
        };
    }

    // Handle onSaveFailure - returns void or Promise<void>
    if (baseCallbacks.onSaveFailure || pluginCallbacks.onSaveFailure) {
        mergedCallbacks.onSaveFailure = async (props) => {
            if (baseCallbacks.onSaveFailure) {
                await Promise.resolve(baseCallbacks.onSaveFailure(props));
            }
            if (pluginCallbacks.onSaveFailure) {
                await Promise.resolve(pluginCallbacks.onSaveFailure(props));
            }
        };
    }

    // Handle onPreSave - returns Partial<EntityValues<M>> or Promise<Partial<EntityValues<M>>>
    if (baseCallbacks.onPreSave || pluginCallbacks.onPreSave) {
        mergedCallbacks.onPreSave = async (props) => {
            let values = props.values;
            if (baseCallbacks.onPreSave) {
                const baseValues = await Promise.resolve(baseCallbacks.onPreSave(props));
                // Use mergeDeep to preserve class instances like EntityReference, GeoPoint
                values = mergeDeep(values, baseValues);
            }
            if (pluginCallbacks.onPreSave) {
                const pluginValues = await Promise.resolve(pluginCallbacks.onPreSave({
                    ...props,
                    values
                }));
                // Use mergeDeep to preserve class instances like EntityReference, GeoPoint
                values = mergeDeep(values, pluginValues);
            }
            return values;
        };
    }

    // Handle onPreDelete - returns void
    if (baseCallbacks.onPreDelete || pluginCallbacks.onPreDelete) {
        mergedCallbacks.onPreDelete = (props) => {
            if (baseCallbacks.onPreDelete) {
                baseCallbacks.onPreDelete(props);
            }
            if (pluginCallbacks.onPreDelete) {
                pluginCallbacks.onPreDelete(props);
            }
        };
    }

    // Handle onDelete - returns void
    if (baseCallbacks.onDelete || pluginCallbacks.onDelete) {
        mergedCallbacks.onDelete = (props) => {
            if (baseCallbacks.onDelete) {
                baseCallbacks.onDelete(props);
            }
            if (pluginCallbacks.onDelete) {
                pluginCallbacks.onDelete(props);
            }
        };
    }

    // Handle onIdUpdate - returns string or Promise<string>
    if (baseCallbacks.onIdUpdate || pluginCallbacks.onIdUpdate) {
        mergedCallbacks.onIdUpdate = async (props) => {
            let id = props.entityId || "";

            if (baseCallbacks.onIdUpdate) {
                id = await Promise.resolve(baseCallbacks.onIdUpdate(props));
            }

            if (pluginCallbacks.onIdUpdate) {
                id = await Promise.resolve(pluginCallbacks.onIdUpdate({
                    ...props,
                    entityId: id
                }));
            }

            return id;
        };
    }

    return Object.keys(mergedCallbacks).length > 0 ? mergedCallbacks : undefined;
};
