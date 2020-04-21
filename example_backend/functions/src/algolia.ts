import * as functions from 'firebase-functions';
import algoliasearch from "algoliasearch";

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

export function indexInAlgolia(indexName: string, data: any, id: string) {
    const entry = {...data};
    entry.objectID = id;
    const index = client.initIndex(indexName);
    return index.saveObject(entry).then((res) => {
        console.debug("Indexed object in", indexName, res);
        return res;
    });
}

export function deleteInAlgolia(indexName: string, id: string) {
    const index = client.initIndex(indexName);
    return index.deleteObject(id).then((res) => {
        console.debug("Deleted from index", indexName, res);
        return res;
    });
}
