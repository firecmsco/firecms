import algoliasearch, { SearchClient } from "algoliasearch";

import { AlgoliaTextSearchDelegate } from "@camberi/firecms";


let client: SearchClient | undefined = undefined;
if (process.env.REACT_APP_ALGOLIA_APP_ID && process.env.REACT_APP_ALGOLIA_SEARCH_KEY) {
    client = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID, process.env.REACT_APP_ALGOLIA_SEARCH_KEY);
} else {
    console.error("REACT_APP_ALGOLIA_APP_ID or REACT_APP_ALGOLIA_SEARCH_KEY env variables not specified");
    console.error("Text search not enabled");
}

export const productsSearchDelegate = client && AlgoliaTextSearchDelegate(
    client,
    "products");
export const usersSearchDelegate = client && AlgoliaTextSearchDelegate(
    client,
    "users");
export const blogSearchDelegate = client && AlgoliaTextSearchDelegate(
    client,
    "blog");
