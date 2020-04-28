import algoliasearch, { SearchIndex } from "algoliasearch";

export interface TextSearchDelegate {
    performTextSearch(query: string): Promise<readonly string[]>;
}

export class AlgoliaTextSearchDelegate implements TextSearchDelegate {

    appId: string;
    searchKey: string;
    index: SearchIndex;

    constructor(appId: string, searchKey: string, indexKey: string) {
        this.appId = appId;
        this.searchKey = searchKey;

        const client = algoliasearch(appId, searchKey);
        this.index = client.initIndex(indexKey);
    }

    performTextSearch(query: string): Promise<readonly string[]> {
        console.log("Performing Algolia query", query);
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
        // return [];
    }
}
