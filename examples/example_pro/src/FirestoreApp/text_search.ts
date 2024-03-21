import algoliasearch, { SearchClient } from "algoliasearch";

import {
    buildAlgoliaSearchController,
    buildPineconeSearchController,
    performAlgoliaTextSearch,
    performPineconeTextSearch
} from "@firecms/firebase";

let client: SearchClient | undefined;
// process is defined for react-scripts builds
if (typeof process !== "undefined") {
    if (process.env.REACT_APP_ALGOLIA_APP_ID && process.env.REACT_APP_ALGOLIA_SEARCH_KEY) {
        client = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID, process.env.REACT_APP_ALGOLIA_SEARCH_KEY);
    }
}
// import.meta is defined for vite builds
else if (import.meta.env) {
    if (import.meta.env.VITE_ALGOLIA_APP_ID && import.meta.env.VITE_ALGOLIA_SEARCH_KEY) {
        client = algoliasearch(import.meta.env.VITE_ALGOLIA_APP_ID as string, import.meta.env.VITE_ALGOLIA_SEARCH_KEY as string);
    }
} else {
    console.error("REACT_APP_ALGOLIA_APP_ID or REACT_APP_ALGOLIA_SEARCH_KEY env variables not specified");
    console.error("Text search not enabled");
}

const productsIndex = client && client.initIndex("products");
const usersIndex = client && client.initIndex("users");
const blogIndex = client && client.initIndex("blog");
const booksIndex = client && client.initIndex("books");

export const algoliaSearchControllerBuilder = buildAlgoliaSearchController({
    isPathSupported: (path) => {
        return ["products", "users", "blog", "books"].includes(path);
    },
    search: ({
                 path,
                 searchString
             }) => {
        if (path === "products")
            return productsIndex && performAlgoliaTextSearch(productsIndex, searchString);
        if (path === "users")
            return usersIndex && performAlgoliaTextSearch(usersIndex, searchString);
        if (path === "blog")
            return blogIndex && performAlgoliaTextSearch(blogIndex, searchString);
        if (path === "books")
            return booksIndex && performAlgoliaTextSearch(booksIndex, searchString);
        return undefined;
    }
});

export const pineconeSearchControllerBuilder = buildPineconeSearchController({
    isPathSupported: (path) => {
        return ["products"].includes(path);
    },
    search: async ({
                       path,
                       searchString,
                       currentUser
                   }) => {
        if (path === "products")
            return performPineconeTextSearch({
                firebaseToken: await currentUser.getIdToken(),
                projectId: "firecms-backend",
                collectionPath: "products",
                query: searchString
            });
        throw new Error("Path not supported");
    }
});
