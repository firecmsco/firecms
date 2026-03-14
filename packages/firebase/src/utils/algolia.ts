import { buildExternalSearchController } from "./text_search_controller";

/**
 * Utility function to perform a text search in an algolia index,
 * returning the ids of the entities.
 * @param client The algolia client
 * @param indexName
 * @param query
 * @group Firebase
 */
export function performAlgoliaTextSearch(client: any, indexName: string, query: string): Promise<readonly string[]> {

    console.debug("Performing Algolia query", client, query);

    return client.searchSingleIndex({
        indexName,
        searchParams: { query },
    }).then(({ hits }: any) => {
        return hits.map((hit: any) => hit.objectID as string);
    })
        .catch((err: any) => {
            console.error(err);
            return [];
        });
}

/**
 * @deprecated Use `buildExternalSearchController` instead
 */
export const buildAlgoliaSearchController = buildExternalSearchController;
