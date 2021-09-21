import algoliasearch, { SearchClient } from "algoliasearch";

import {
    performAlgoliaTextSearch,
    FirestoreTextSearchController
} from "@camberi/firecms";

let client: SearchClient | undefined = undefined;
if (process.env.REACT_APP_ALGOLIA_APP_ID && process.env.REACT_APP_ALGOLIA_SEARCH_KEY) {
    client = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID, process.env.REACT_APP_ALGOLIA_SEARCH_KEY);
} else {
    console.error("REACT_APP_ALGOLIA_APP_ID or REACT_APP_ALGOLIA_SEARCH_KEY env variables not specified");
    console.error("Text search not enabled");
}

const productsIndex = client && client.initIndex("products");
const usersIndex = client && client.initIndex("users");
const blogIndex = client && client.initIndex("blog");

export const textSearchController: FirestoreTextSearchController =
    ({ path, searchString }) => {
        if (path === "products")
            return productsIndex && performAlgoliaTextSearch(productsIndex, searchString);
        if (path === "users")
            return usersIndex && performAlgoliaTextSearch(usersIndex, searchString);
        if (path === "blog")
            return blogIndex && performAlgoliaTextSearch(blogIndex, searchString);
        return undefined;
    };
