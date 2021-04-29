import { Entity, EntityCollection, fetchEntity } from "../models";
import { getNavigationEntriesFromPathInternal } from "../routes/navigation";
import { useEffect, useState } from "react";
import { CMSAppContext, useCMSAppContext } from "../contexts/CMSAppContext";

export type NavigationEntry = NavigationEntity | NavigationCollection;

export type NavigationEntity = {
    type: "entity";
    entity: Entity<any>;
    entityId: string;
    collectionPath: string;
    fullPath: string;
    parentCollection: EntityCollection;
};

export type NavigationCollection = {
    type: "collection";
    fullPath: string;
    collection: EntityCollection;
};

/**
 * Use this function to retrieve an array of navigation entries (resolved
 * collection or entity) for the given path. You need to pass the app context
 * that you receive in different callbacks, such as the save hooks.
 *
 * It will take into account the `navigation` provided at the `CMSApp` level, as
 * well as a `schemaResolver` if provided.
 *
 * @param path
 * @param cmsAppContext
 */
export function getNavigationFrom({path, context} : { path: string, context: CMSAppContext }): Promise<NavigationEntry[]> {

    const navigation = context.navigation;
    const schemasRegistryController = context.schemasRegistryController;

    if (!navigation) {
        throw Error("Calling getNavigationFrom, but main navigation has not yet been initialised");
    }

    if (!schemasRegistryController) {
        throw Error("Calling getNavigationFrom, but main schemasRegistryController has not yet been initialised");
    }

    const navigationEntries = getNavigationEntriesFromPathInternal(path, navigation.collections);

    const resultPromises: Promise<NavigationEntry>[] = navigationEntries.map((entry) => {
        if (entry.type === "collection") {
            return Promise.resolve(entry);
        } else if (entry.type === "entity") {
            const schemaConfig = schemasRegistryController.getSchemaConfig(entry.collectionPath, entry.entityId);
            if (!schemaConfig?.schema) {
                throw Error(`No schema defined in the navigation for the entity with path ${entry.collectionPath}`);
            }
            return fetchEntity(entry.collectionPath, entry.entityId, schemaConfig?.schema)
                .then((entity) => {
                    return { ...entry, entity };
                });
        } else {
            throw Error("Unmapped element in useEntitiesFromPath");
        }
    });

    return Promise.all(resultPromises);
}

export interface NavigationFromProps {
    path: string;
}

export type NavigationFrom = {
    data?: NavigationEntry[]
    dataLoading: boolean,
    dataLoadingError?: Error
}

/**
 * Use this hook to retrieve an array of navigation entries (resolved
 * collection or entity) for the given path. You can use this hook
 * in any React component that lives under `CMSApp`
 */
export function useNavigationFrom(
    {
        path
    }: NavigationFromProps): NavigationFrom {

    const context: CMSAppContext = useCMSAppContext();

    const [data, setData] = useState<NavigationEntry[] | undefined>();
    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();

    useEffect(() => {

        if (context.navigationLoadingError) {
            setDataLoadingError(context.navigationLoadingError);
        }

        const navigation = context.navigation;
        if (navigation) {
            setDataLoading(true);
            setDataLoadingError(undefined);
            getNavigationFrom({ path, context })
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
