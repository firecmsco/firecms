import { SearchIndex } from "algoliasearch";
import { FirestoreTextSearchController, FirestoreTextSearchControllerBuilder } from "../types";
import { EntityCollection, ResolvedEntityCollection } from "@firecms/core";

/**
 * Utility function to perform a text search in an algolia index,
 * returning the ids of the entities.
 * @param index
 * @param query
 * @group Firebase
 */
export function performAlgoliaTextSearch(index: SearchIndex, query: string): Promise<readonly string[]> {

    console.debug("Performing Algolia query", index, query);
    return index
        .search(query)
        .then(({ hits }: any) => {
            return hits.map((hit: any) => hit.objectID as string);
        })
        .catch((err: any) => {
            console.error(err);
            return [];
        });
}

export function buildAlgoliaSearchController({
                                                 isPathSupported,
                                                 search
                                             }: {
    isPathSupported: (path: string) => boolean,
    search: (props: {
        searchString: string,
        path: string
    }) => Promise<readonly string[]> | undefined,
}): FirestoreTextSearchControllerBuilder {
    return (props): FirestoreTextSearchController => {

        const init = (props: {
            path: string,
            collection?: EntityCollection | ResolvedEntityCollection
        }) => {
            // do nothing
            return Promise.resolve(isPathSupported(props.path));
        }

        return {
            init,
            search
        }
    }

}
