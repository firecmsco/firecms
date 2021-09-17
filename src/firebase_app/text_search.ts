import { SearchIndex } from "algoliasearch";

export type TextSearchDelegateResolver = (props: { path: string, searchString: string }) => Promise<readonly string[]> | undefined;

/**
 * Utility function to perform a text search in an algolia index,
 * returning the ids of the entities.
 * @param index
 * @param query
 * @category Firebase
 */
export function performAlgoliaTextSearch(index: SearchIndex, query: string): Promise<readonly string[]> {

    console.log("Performing Algolia query", index, query);
    return index
        .search(query)
        .then(({ hits }: any) => {
            console.log(hits);
            return hits.map((hit: any) => hit.objectID as string);
        })
        .catch((err: any) => {
            console.log(err);
            return [];
        });
}
