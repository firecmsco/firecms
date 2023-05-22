import algoliasearch from "algoliasearch";

const ALGOLIA_ID = process?.env?.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process?.env?.ALGOLIA_API_KEY;

export function indexInAlgolia(indexName: string, data: any, id: string) {
    const client = ALGOLIA_ID && ALGOLIA_ADMIN_KEY ? algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY) : undefined;
    if (!client) return;
    const entry = { ...data };
    entry.objectID = id;
    const index = client.initIndex(indexName);
    return index.saveObject(entry).then((res) => {
        console.debug("Indexed object in", indexName, res);
        return res;
    });
}

export function deleteInAlgolia(indexName: string, id: string) {
    const client = ALGOLIA_ID && ALGOLIA_ADMIN_KEY ? algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY) : undefined;
    if (!client) return;
    const index = client.initIndex(indexName);
    return index.deleteObject(id).then((res) => {
        console.debug("Deleted from index", indexName, res);
        return res;
    });
}
