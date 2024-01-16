import { collection, getFirestore, onSnapshot, query } from "firebase/firestore";
import { FirestoreTextSearchController, FirestoreTextSearchControllerBuilder } from "../types";
// @ts-ignore
import * as JsSearch from "js-search";
import { FirebaseApp } from "firebase/app";
import { EntityCollection, ResolvedEntityCollection } from "@firecms/core";

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
    }) => {
        const firestore = getFirestore(firebaseApp);

        const col = collection(firestore, path);
        if (currentPath && path !== currentPath) {
            destroyListener(currentPath)
        }

        currentPath = path;

        if (!indexes[path] && collectionProp)
            indexes[path] = buildIndex(collectionProp);

        listeners[path] = onSnapshot(query(col),
            {
                next: (snapshot) => {
                    const docs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    indexes[path].addDocuments(docs);
                },
                error: console.error
            }
        );
        return true;
    }

    const search = async ({ searchString, path }: {
        searchString: string,
        path: string
    }) => {
        const index = indexes[path];
        const searchResult = await index.search(searchString);
        return searchResult.map((e: any) => e.id);
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
