import { collection, getFirestore, onSnapshot, query } from "firebase/firestore";
import { FirestoreTextSearchController, FirestoreTextSearchControllerBuilder } from "../types";
// @ts-ignore
import * as JsSearch from "js-search";
import { FirebaseApp } from "firebase/app";
import { EntityCollection, ResolvedEntityCollection } from "@firecms/core";

const MAX_SEARCH_RESULTS = 100;

export const localSearchControllerBuilder: FirestoreTextSearchControllerBuilder = ({
                                                                                       firebaseApp,
                                                                                   }: {

    firebaseApp: FirebaseApp,
}): FirestoreTextSearchController => {

    let currentPath: string | undefined;
    const indexes: Record<string, JsSearch.Search> = {};
    const listeners: Record<string, () => void> = {};

    const destroyListener = (path: string) => {
        if (listeners[path]) {
            listeners[path]();
            delete listeners[path];
        }
    }

    const init = ({
                      path,
                      collection: collectionProp
                  }: {
        path: string,
        collection?: EntityCollection | ResolvedEntityCollection
    }): Promise<boolean> => {

        console.debug("Init local search controller", path, collectionProp)

        if (currentPath && path !== currentPath) {
            destroyListener(currentPath)
        }

        currentPath = path;

        return new Promise((resolve, reject) => {
            if (!indexes[path] && collectionProp) {
                console.debug("Init local search controller", path);
                indexes[path] = buildIndex(collectionProp);
                const firestore = getFirestore(firebaseApp);
                const col = collection(firestore, path);
                console.log("Listening to collection", path, col);
                listeners[path] = onSnapshot(query(col),
                    {
                        next: (snapshot) => {
                            const docs = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));
                            console.log("Added docs to index", path, docs.length);
                            indexes[path].addDocuments(docs);
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

    const search = async ({ searchString, path }: {
        searchString: string,
        path: string
    }) => {
        const index = indexes[path];
        if (!index) {
            throw new Error(`Index not found for path ${path}`);
        }
        const searchResult = await index.search(searchString);
        return searchResult.splice(0, MAX_SEARCH_RESULTS).map((e: any) => e.id);
    };

    return {
        init,
        search,
    }
}

function buildIndex(collection: EntityCollection | ResolvedEntityCollection) {
    const search = new JsSearch.Search("id");
    Object.entries(collection.properties).forEach(([key, property]) => {
        search.addIndex(key);
    });
    return search;
}
