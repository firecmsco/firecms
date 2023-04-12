import { SearchIndex } from "algoliasearch";
import Collection from "typesense/lib/Typesense/Collection";
import { SearchParams } from "typesense/lib/Typesense/Documents";

/**
 * Use this controller to return a list of ids from a search index, given a
 * `path` and a `searchString`.
 * Firestore does not support text search directly so we need to rely on an external
 * index, such as Algolia.
 * Note that you will get text search requests for collections that have the
 * `textSearchEnabled` flag set to `true`.
 * @see performAlgoliaTextSearch
 * @category Firebase
 */
export type FirestoreTextSearchController = (props: {
    path: string;
    searchString: string;
}) => Promise<readonly string[]> | undefined;

/**
 * Utility function to perform a text search in an algolia index,
 * returning the ids of the entities.
 * @param index
 * @param query
 * @category Firebase
 */
export function performAlgoliaTextSearch(
    index: SearchIndex,
    query: string
): Promise<readonly string[]> {
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

/**
 * Utility function to perform a text search in an typesense index,
 * returning the ids of the entities.
 * @param index
 * @param query
 * @category Firebase
 */
export function performTypesenseSearch(
    index: Collection<{}>,
    searchParameters: SearchParams
): Promise<readonly string[]> {
    return index
        .documents()
        .search(searchParameters)
        .then(({ hits }) => {
            if (hits === undefined) return [];
            return hits.map((hit: any) => hit.document.id as string);
        })
        .catch((err: any) => {
            console.log(err);
            return [];
        });
}
