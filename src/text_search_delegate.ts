import { SearchClient, SearchIndex } from "algoliasearch";

/**
 * Simple interface for implementing a text search
 */
export interface TextSearchDelegate {
    /**
     * @param query string
     * @return array containing the Firestore ids of the search results
     */
    performTextSearch(query: string): Promise<readonly string[]>;
}

export class AlgoliaTextSearchDelegate implements TextSearchDelegate {

    algoliaClient: SearchClient;
    index: SearchIndex;

    constructor(algoliaClient: SearchClient, indexKey: string) {
        this.algoliaClient = algoliaClient;
        this.index = algoliaClient.initIndex(indexKey);
    }

    performTextSearch(query: string): Promise<readonly string[]> {
        console.log("Performing Algolia query", this.index, query);
        return this.index
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
}
