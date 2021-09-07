import { Entity, EntityCollection, EntityCustomView } from "../models";
import { getNavigationEntriesFromPathInternal } from "../core/navigation";
import { useEffect, useState } from "react";
import { CMSAppContext, useCMSAppContext } from "../contexts/CMSAppContext";

/**
 * @ignore
 */
export type NavigationEntry<M> =
    | NavigationEntity<M>
    | NavigationCollection<M>
    | NavigationCustom<M>;

/**
 * @ignore
 */
export type NavigationEntity<M> = {
    type: "entity";
    entity: Entity<M>;
    entityId: string;
    relativePath: string;
    path: string;
    parentCollection: EntityCollection<M>;
};

/**
 * @ignore
 */
export type NavigationCollection<M> = {
    type: "collection";
    path: string;
    collection: EntityCollection<M>;
};

/**
 * @ignore
 */
interface NavigationCustom<M> {
    type: "custom_view";
    path: string;
    view: EntityCustomView<M>;
}

/**
 * Use this function to retrieve an array of navigation entries (resolved
 * collection, entity or entity custom_view) for the given path. You need to pass the app context
 * that you receive in different callbacks, such as the save hooks.
 *
 * It will take into account the `navigation` provided at the `CMSApp` level, as
 * well as a `schemaResolver` if provided.
 *
 * @param path
 * @param context
 * @category Hooks and utilities
 */
export function getNavigationFrom<M>({
                                         path,
                                         context
                                     }: { path: string, context: CMSAppContext }): Promise<NavigationEntry<M>[]> {


    const dataSource = context.dataSource;
    const navigation = context.navigation;
    const schemaRegistryController = context.schemaRegistryController;

    if (!navigation) {
        throw Error("Calling getNavigationFrom, but main navigation has not yet been initialised");
    }

    if (!schemaRegistryController) {
        throw Error("Calling getNavigationFrom, but main schemaRegistryController has not yet been initialised");
    }

    const navigationEntries = getNavigationEntriesFromPathInternal({
        path,
        allCollections: navigation.collections
    });

    const resultPromises: Promise<NavigationEntry<any>>[] = navigationEntries.map((entry) => {
        if (entry.type === "collection") {
            return Promise.resolve(entry);
        } else if (entry.type === "entity") {
            const schemaConfig = schemaRegistryController.getSchemaConfig(entry.relativePath, entry.entityId);
            if (!schemaConfig?.schema) {
                throw Error(`No schema defined in the navigation for the entity with path ${entry.relativePath}`);
            }
            return dataSource.fetchEntity({
                path: entry.relativePath,
                entityId: entry.entityId,
                schema: schemaConfig?.schema
            })
                .then((entity) => {
                    return { ...entry, entity };
                });
        } else if (entry.type === "custom_view") {
            return Promise.resolve(entry);
        } else {
            throw Error("Unmapped element in useEntitiesFromPath");
        }
    });

    return Promise.all(resultPromises);
}

/**
 * @category Hooks and utilities
 */
export interface NavigationFromProps {
    path: string;
}

/**
 * @category Hooks and utilities
 */
export type NavigationFrom<M> = {
    data?: NavigationEntry<M>[]
    dataLoading: boolean,
    dataLoadingError?: Error
}

/**
 * Use this hook to retrieve an array of navigation entries (resolved
 * collection or entity) for the given path. You can use this hook
 * in any React component that lives under `CMSApp`
 * @category Hooks and utilities
 */
export function useNavigationFrom<M>(
    {
        path
    }: NavigationFromProps): NavigationFrom<M> {

    const context: CMSAppContext = useCMSAppContext();

    const [data, setData] = useState<NavigationEntry<M>[] | undefined>();
    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();

    useEffect(() => {

        const navigation = context.navigation;
        if (navigation) {
            setDataLoading(true);
            setDataLoadingError(undefined);
            getNavigationFrom<M>({ path, context })
                .then((res) => {
                    setData(res);
                })
                .catch((e) => setDataLoadingError(e))
                .finally(() => setDataLoading(false));
        }

    }, [path, context]);

    if (!context.navigation) {
        return { dataLoading: true };
    }

    return { data, dataLoading, dataLoadingError };
}
