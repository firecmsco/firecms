import {
    Entity,
    EntityCollection,
    EntityCustomView,
    FireCMSContext
} from "../models";
import { useEffect, useState } from "react";
import { getNavigationEntriesFromPathInternal } from "../core/util/navigation_from_path";
import { useFireCMSContext } from "./useFireCMSContext";

/**
 * @see resolveNavigationFrom
 * @category Hooks and utilities
 */
export type ResolvedNavigationEntry<M> =
    | ResolvedNavigationEntity<M>
    | ResolvedNavigationCollection<M>
    | ResolvedNavigationEntityCustom<M>;

/**
 * @see resolveNavigationFrom
 * @category Hooks and utilities
 */
export interface ResolvedNavigationEntity<M> {
    type: "entity";
    entity: Entity<M>;
    entityId: string;
    path: string;
    parentCollection: EntityCollection<M>;
}

/**
 * @see resolveNavigationFrom
 * @category Hooks and utilities
 */
export interface ResolvedNavigationCollection<M> {
    type: "collection";
    path: string;
    collection: EntityCollection<M>;
}

/**
 * @see resolveNavigationFrom
 * @category Hooks and utilities
 */
interface ResolvedNavigationEntityCustom<M> {
    type: "custom_view";
    path: string;
    view: EntityCustomView<M>;
}

/**
 * Use this function to retrieve an array of navigation entries (resolved
 * collection, entity or entity custom_view) for the given path. You need to pass the app context
 * that you receive in different callbacks, such as the save hooks.
 *
 * It will take into account the `navigation` provided at the `FireCMS` level, as
 * well as a `schemaResolver` if provided.
 *
 * @param path
 * @param context
 * @category Hooks and utilities
 */
export function resolveNavigationFrom<M, UserType>({
                                             path,
                                             context
                                         }: { path: string, context: FireCMSContext<UserType> }): Promise<ResolvedNavigationEntry<M>[]> {


    const dataSource = context.dataSource;
    const navigation = context.navigationContext.navigation;
    const schemaRegistryController = context.schemaRegistryController;

    if (!navigation) {
        throw Error("Calling getNavigationFrom, but main navigation has not yet been initialised");
    }

    if (!schemaRegistryController) {
        throw Error("Calling getNavigationFrom, but main schemaRegistryController has not yet been initialised");
    }

    const navigationEntries = getNavigationEntriesFromPathInternal({
        path,
        collections: navigation.collections
    });

    const resultPromises: Promise<ResolvedNavigationEntry<any>>[] = navigationEntries.map((entry) => {
        if (entry.type === "collection") {
            return Promise.resolve(entry);
        } else if (entry.type === "entity") {
            const schemaConfig = schemaRegistryController.getSchemaConfig(entry.path, entry.entityId);
            if (!schemaConfig?.schema) {
                throw Error(`No schema defined in the navigation for the entity with path ${entry.path}`);
            }
            return dataSource.fetchEntity({
                path: entry.path,
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
export interface NavigationFrom<M> {
    data?: ResolvedNavigationEntry<M>[]
    dataLoading: boolean,
    dataLoadingError?: Error
}

/**
 * Use this hook to retrieve an array of navigation entries (resolved
 * collection or entity) for the given path. You can use this hook
 * in any React component that lives under `FireCMS`
 * @category Hooks and utilities
 */
export function useResolvedNavigationFrom<M, UserType>(
    {
        path
    }: NavigationFromProps): NavigationFrom<M> {

    const context: FireCMSContext<UserType> = useFireCMSContext();

    const [data, setData] = useState<ResolvedNavigationEntry<M>[] | undefined>();
    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();

    useEffect(() => {

        const navigation = context.navigationContext.navigation;
        if (navigation) {
            setDataLoading(true);
            setDataLoadingError(undefined);
            resolveNavigationFrom<M,UserType>({ path, context })
                .then((res) => {
                    setData(res);
                })
                .catch((e) => setDataLoadingError(e))
                .finally(() => setDataLoading(false));
        }

    }, [path, context]);

    if (!context.navigationContext.navigation) {
        return { dataLoading: true };
    }

    return { data, dataLoading, dataLoadingError };
}
