import { EntityCollection, EntityCustomView } from "@firecms/types";
import { getCollectionPathsCombinations, removeInitialAndTrailingSlashes } from "./navigation_utils";
import { resolveEntityView } from "./resolutions";

export type NavigationViewInternal<M extends Record<string, any> = any> =
    | NavigationViewEntityInternal<M>
    | NavigationViewCollectionInternal<M>
    | NavigationViewEntityCustomInternal<M>;

export interface NavigationViewEntityInternal<M extends Record<string, any>> {
    type: "entity";
    entityId: string | number;
    slug: string;
    path: string;
    parentCollection: EntityCollection<M>;
}

export interface NavigationViewCollectionInternal<M extends Record<string, any>> {
    type: "collection";
    id: string;
    slug: string;
    path: string;
    collection: EntityCollection<M>;
}

export interface NavigationViewEntityCustomInternal<M extends Record<string, any>> {
    type: "custom_view";
    slug: string;
    path: string;
    entityId: string | number;
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
        currentFullPath,
    } = props;

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    const result: NavigationViewInternal[] = [];
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];

        const collection = collections && collections.find((entry) => entry.slug === subpathCombination);

        if (collection) {
            const collectionPath = currentFullPath && currentFullPath.length > 0
                ? (currentFullPath + "/" + collection.slug)
                : collection.slug;
            result.push({
                type: "collection",
                id: collection.slug,
                slug: collectionPath,
                path: collectionPath,
                collection
            });
            const restOfThePath = removeInitialAndTrailingSlashes(removeInitialAndTrailingSlashes(path).replace(subpathCombination, ""));
            const nextSegments = restOfThePath.length > 0 ? restOfThePath.split("/") : [];
            if (nextSegments.length > 0) {
                const entityId = nextSegments[0];
                const path = collectionPath + "/" + entityId;
                result.push({
                    type: "entity",
                    entityId,
                    slug: collectionPath,
                    path,
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
                            slug: collectionPath,
                            entityId: entityId,
                            path: path + "/" + customView.key,
                            view: customView
                        });
                    } else if (collection.subcollections) {
                        result.push(...getNavigationEntriesFromPath({
                            path: newPath,
                            collections: collection.subcollections,
                            currentFullPath: path,
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
