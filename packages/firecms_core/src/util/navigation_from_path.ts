import { EntityCollection, EntityCustomView } from "../types";
import { getCollectionPathsCombinations, removeInitialAndTrailingSlashes } from "./navigation_utils";
import { resolveEntityView } from "./resolutions";

export type NavigationViewInternal<M extends Record<string, any> = any> =
    | NavigationViewEntityInternal<M>
    | NavigationViewCollectionInternal<M>
    | NavigationViewEntityCustomInternal<M>;

export interface NavigationViewEntityInternal<M extends Record<string, any>> {
    type: "entity";
    entityId: string;
    path: string;
    fullPath: string;
    parentCollection: EntityCollection<M>;
}

export interface NavigationViewCollectionInternal<M extends Record<string, any>> {
    type: "collection";
    id: string;
    path: string;
    fullPath: string;
    collection: EntityCollection<M>;
}

export interface NavigationViewEntityCustomInternal<M extends Record<string, any>> {
    type: "custom_view";
    path: string;
    fullPath: string;
    view: EntityCustomView<M>;
}

export function getNavigationEntriesFromPath(props: {
    path: string,
    collections: EntityCollection[] | undefined,
    currentFullPath?: string,
    contextEntityViews?: EntityCustomView<any>[]
}): NavigationViewInternal [] {

    const {
        path,
        collections = [],
        currentFullPath
    } = props;

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    const result: NavigationViewInternal[] = [];
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];

        const collection: EntityCollection<any> | undefined = collections && collections.find((entry) => entry.id === subpathCombination || entry.path === subpathCombination);

        if (collection) {
            const pathOrAlias = collection.id ?? collection.path;
            const collectionPath = currentFullPath && currentFullPath.length > 0
                ? (currentFullPath + "/" + pathOrAlias)
                : pathOrAlias;

            result.push({
                type: "collection",
                id: collection.id,
                path: collectionPath,
                fullPath: collectionPath,
                collection
            });
            const restOfThePath = removeInitialAndTrailingSlashes(removeInitialAndTrailingSlashes(path).replace(subpathCombination, ""));
            const nextSegments = restOfThePath.length > 0 ? restOfThePath.split("/") : [];
            if (nextSegments.length > 0) {
                const entityId = nextSegments[0];
                const fullPath = collectionPath + "/" + entityId;
                result.push({
                    type: "entity",
                    entityId,
                    path: collectionPath,
                    fullPath: fullPath,
                    parentCollection: collection
                });
                if (nextSegments.length > 1) {
                    const newPath = nextSegments.slice(1).join("/");
                    if (!collection) {
                        throw Error("collection not found resolving path: " + collection);
                    }
                    const entityViews = collection.entityViews;
                    const customView = entityViews && entityViews
                        .map((entry) => resolveEntityView(entry, props.contextEntityViews))
                        .filter(Boolean)
                        .find((entry) => entry!.key === newPath);
                    if (customView) {
                        const path = currentFullPath && currentFullPath.length > 0
                            ? (currentFullPath + "/" + customView.key)
                            : customView.key;
                        result.push({
                            type: "custom_view",
                            path,
                            fullPath: fullPath + "/" + path,
                            view: customView
                        });
                    } else if (collection.subcollections) {
                        result.push(...getNavigationEntriesFromPath({
                            path: newPath,
                            collections: collection.subcollections,
                            currentFullPath: fullPath,
                            contextEntityViews: props.contextEntityViews
                        }));
                    }
                }
            }
            break;
        }

    }
    return result;
}
