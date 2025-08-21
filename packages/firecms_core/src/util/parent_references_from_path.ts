import { EntityCollection, EntityReference } from "@firecms/types";
import { getCollectionPathsCombinations, removeInitialAndTrailingSlashes } from "./navigation_utils";

export function getParentReferencesFromPath(props: {
    path: string,
    collections: EntityCollection[] | undefined,
    currentFullPath?: string,
}): EntityReference [] {

    const {
        path,
        collections = [],
        currentFullPath,
    } = props;

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    const result: EntityReference[] = [];
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];

        const collection: EntityCollection<any> | undefined = collections && collections.find((entry) => entry.slug === subpathCombination);

        // If we find a collection, we add the reference and continue
        if (collection) {
            const collectionPath = currentFullPath && currentFullPath.length > 0
                ? (currentFullPath + "/" + collection.slug) // Use the current full path if provided
                : collection.slug;

            const restOfThePath = removeInitialAndTrailingSlashes(removeInitialAndTrailingSlashes(path).replace(subpathCombination, ""));
            const nextSegments = restOfThePath.length > 0 ? restOfThePath.split("/") : [];
            if (nextSegments.length > 0) {
                const entityId = nextSegments[0];
                const path = collectionPath + "/" + entityId;
                result.push(new EntityReference(entityId, collectionPath));
                if (nextSegments.length > 1) {
                    const newPath = nextSegments.slice(1).join("/");
                    if (!collection) {
                        throw Error("collection not found resolving path: " + collection);
                    }
                    if (collection.subcollections) {
                        result.push(...getParentReferencesFromPath({
                            path: newPath,
                            collections: collection.subcollections,
                            currentFullPath: path
                        }));
                    }
                }
            }
            break;
        }

    }
    return result;
}
