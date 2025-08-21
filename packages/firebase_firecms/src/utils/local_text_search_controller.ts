import { collection, getFirestore, onSnapshot, query } from "@firebase/firestore";
import { FirestoreTextSearchController, FirestoreTextSearchControllerBuilder } from "@firecms/types";
import Fuse from "fuse.js"

import { FirebaseApp } from "@firebase/app";
import { EntityCollection, ResolvedEntityCollection } from "@firecms/core";

const MAX_SEARCH_RESULTS = 80;

export const localSearchControllerBuilder: FirestoreTextSearchControllerBuilder = ({
                                                                                       firebaseApp,
                                                                                   }: {

    firebaseApp: FirebaseApp,
}): FirestoreTextSearchController => {

    let currentPath: string | undefined;
    const indexes: Record<string, Fuse<object & { id: string }>> = {};
    const listeners: Record<string, () => void> = {};

    const destroyListener = (path: string) => {
        if (listeners[path]) {
            listeners[path]();
            delete listeners[path];
            delete indexes[path];
        }
    }

    const init = ({
                      path,
                      collection: collectionProp,
                      databaseId
                  }: {
        path: string,
        collection?: EntityCollection | ResolvedEntityCollection,
        databaseId?: string
    }): Promise<boolean> => {

        if (currentPath && path !== currentPath) {
            destroyListener(currentPath)
        }

        currentPath = path;

        return new Promise(async (resolve, reject) => {
            if (collectionProp) {
                console.debug("Init local search controller", path);
                const firestore = databaseId ? getFirestore(firebaseApp, databaseId) : getFirestore(firebaseApp);
                const col = collection(firestore, path);
                listeners[path] = onSnapshot(query(col),
                    {
                        next: (snapshot) => {
                            if (snapshot.metadata.fromCache && snapshot.metadata.hasPendingWrites) {
                                return;
                            }
                            const docs = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));

                            indexes[path] = buildIndex(docs, collectionProp);
                            console.debug("Added docs to index", path, docs.length);
                            resolve(true);
                        },
                        error: (e) => {
                            console.error("Error initializing local search controller", path);
                            console.error(e);
                            reject(e);
                        }
                    }
                );
            }
        });
    }

    const search = async ({
                              searchString,
                              path
                          }: {
        searchString: string,
        path: string,
        databaseId?: string
    }) => {
        console.debug("Searching local index", path, searchString);
        const index = indexes[path];
        if (!index) {
            throw new Error(`Index not found for path ${path}`);
        }
        let searchResult = index.search(searchString);
        searchResult = searchResult.splice(0, MAX_SEARCH_RESULTS);
        searchResult = searchResult.sort((a, b) => {
            // Check if item A is an exact match
            const aExactMatch = a.item.id === searchString;
            // Check if item B is an exact match
            const bExactMatch = b.item.id === searchString;

            if (aExactMatch && !bExactMatch) {
                return -1;  // Prioritize item A
            } else if (!aExactMatch && bExactMatch) {
                return 1;   // Prioritize item B
            } else {
                // If both are exact matches or both are not, sort by Fuse's original score
                return (a.score ?? 0) - (b.score ?? 0);
            }
        });
        return searchResult.map((e: any) => e.item.id);
    };

    return {
        init,
        search,
    }
}

function buildIndex(list: (object & { id: string })[], collection: EntityCollection | ResolvedEntityCollection) {

    const keys = ["id", ...Object.keys(collection.properties)];

    const fuseOptions = {
        // isCaseSensitive: false,
        // includeScore: false,
        // shouldSort: true,
        // includeMatches: false,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        threshold: 0.6,
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
        // fieldNormWeight: 1,
        includeScore: true,
        keys: [{
            name: "title",
            weight: 1.0
        }, ...keys.map(key => ({
            name: key,
            weight: 0.5
        }))]
    };
    return new Fuse<object & { id: string }>(list, fuseOptions);
}
