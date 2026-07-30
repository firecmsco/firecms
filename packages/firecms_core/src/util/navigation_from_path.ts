import { EntityCollection, EntityCustomView } from "../types";
import { decodeEntityId, getCollectionPathsCombinations, removeInitialAndTrailingSlashes } from "./navigation_utils";
import { resolveEntityView } from "./resolutions";

export type NavigationViewInternal<M extends Record<string, any> = any> =
    | NavigationViewEntityInternal<M>
    | NavigationViewCollectionInternal<M>
    | NavigationViewEntityCustomInternal<M>;

export interface NavigationViewEntityInternal<M extends Record<string, any>> {
    type: "entity";
    entityId: string;
    path: string;
    fullIdPath: string;
    fullPath: string;
    parentCollection: EntityCollection<M>;
}

export interface NavigationViewCollectionInternal<M extends Record<string, any>> {
    type: "collection";
    id: string;
    path: string;
    fullIdPath: string;
    fullPath: string;
    collection: EntityCollection<M>;
}

export interface NavigationViewEntityCustomInternal<M extends Record<string, any>> {
    type: "custom_view";
    path: string;
    fullIdPath: string;
    fullPath: string;
    entityId: string;
    view: EntityCustomView<M>;
}

/**
 * Note on encoding: `path` arrives from the URL, so any entity id in it is escaped (see
 * `encodeEntityId`). Two chains are threaded through the recursion:
 *
 *  - `currentFullPath` carries RAW ids and feeds the `path` / `fullPath` used to address
 *    the datasource.
 *  - `currentFullUrlPath` carries ESCAPED ids and feeds `fullPath`, which is handed back
 *    to `buildUrlCollectionPath` for breadcrumbs and links.
 */
export function getNavigationEntriesFromPath(props: {
    path: string,
    collections: EntityCollection[] | undefined,
    currentFullPath?: string,
    currentFullIdPath?: string,
    currentFullUrlPath?: string,
    contextEntityViews?: EntityCustomView<any>[]
}): NavigationViewInternal [] {

    const {
        path,
        collections = [],
        currentFullPath,
        currentFullIdPath,
        currentFullUrlPath
    } = props;

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    const result: NavigationViewInternal[] = [];
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];

        let collection: EntityCollection<any> | undefined;
        collection = collections && collections.find((entry) => entry.id === subpathCombination);
        if (!collection) {
            collection = collections && collections.find((entry) => entry.path === subpathCombination);
        }

        if (collection) {
            const collectionPath = currentFullPath && currentFullPath.length > 0
                ? (currentFullPath + "/" + collection.path)
                : collection.path;
            const collectionUrlPath = currentFullUrlPath && currentFullUrlPath.length > 0
                ? (currentFullUrlPath + "/" + collection.path)
                : collection.path;
            const fullIdPath = currentFullIdPath && currentFullIdPath.length > 0
                ? (currentFullIdPath + "/" + collection.id)
                : collection.id;
            result.push({
                type: "collection",
                id: collection.id,
                path: collectionPath,
                fullPath: collectionUrlPath,
                fullIdPath,
                collection
            });
            const restOfThePath = removeInitialAndTrailingSlashes(removeInitialAndTrailingSlashes(path).replace(subpathCombination, ""));
            const nextSegments = restOfThePath.length > 0 ? restOfThePath.split("/") : [];
            if (nextSegments.length > 0) {
                const encodedEntityId = nextSegments[0];
                const entityId = decodeEntityId(encodedEntityId);
                const fullPath = collectionPath + "/" + entityId;
                const fullUrlPath = collectionUrlPath + "/" + encodedEntityId;
                result.push({
                    type: "entity",
                    entityId,
                    path: collectionPath,
                    fullIdPath,
                    fullPath: fullUrlPath,
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
                        result.push({
                            type: "custom_view",
                            path: collectionPath,
                            entityId: entityId,
                            fullIdPath,
                            fullPath: fullUrlPath + "/" + customView.key,
                            view: customView
                        });
                    } else if (collection.subcollections) {
                        result.push(...getNavigationEntriesFromPath({
                            path: newPath,
                            collections: collection.subcollections,
                            currentFullPath: fullPath,
                            currentFullIdPath: fullIdPath,
                            currentFullUrlPath: fullUrlPath,
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
