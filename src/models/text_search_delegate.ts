import { SearchClient } from "algoliasearch";

/**
 * Simple interface for implementing a text search
 * @category Collections
 */
export interface TextSearchDelegate {
    /**
     * @param query string
     * @return array containing the Firestore ids of the search results
     */
    performTextSearch(query: string): Promise<readonly string[]>;
}

/**
 * Specific implementation of a TextSearchDelegate that uses Algolia as the
 * search engine
 * @param algoliaClient
 * @param indexKey
 * @constructor
 * @category Collections
 */
export function AlgoliaTextSearchDelegate(algoliaClient: SearchClient, indexKey: string): TextSearchDelegate {

    const index = algoliaClient.initIndex(indexKey);
    return {
        performTextSearch: (query: string): Promise<readonly string[]> => {
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
    };
}
