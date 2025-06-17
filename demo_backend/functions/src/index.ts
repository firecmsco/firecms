import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

import { Change } from "firebase-functions/v1";
import { DocumentSnapshot } from "firebase-functions/v1/firestore";

import { importDatabaseBackup } from "./backup";
import { deleteInAlgolia, indexInAlgolia } from "./indexing/algolia";


export { setProductAvailableLocales, onDeleteSubcollections } from "./products";

function updateIndex(snap: Change<DocumentSnapshot>, indexName: string) {
    if (!snap.after.exists) return deleteInAlgolia(indexName, snap.after.id);
    return indexInAlgolia(indexName, snap.after.data(), snap.after.id);
}

export const onBlogUpdateIndexAlgolia = functions
    .region("europe-west3")
    .firestore
    .document("blog/{blogId}")
    .onWrite((snap, context) => {
        const indexName = "blog";
        return updateIndex(snap, indexName);
    });

export const onProductsUpdateIndexAlgolia = functions
    .region("europe-west3")
    .firestore
    .document("products/{productId}")
    .onWrite((snap, context) => {
        const indexName = "products";
        return updateIndex(snap, indexName);
    });

export const onUsersUpdateIndexAlgolia = functions
    .region("europe-west3")
    .firestore
    .document("users/{userId}")
    .onWrite((snap, context) => {
        const indexName = "users";
        return updateIndex(snap, indexName);
    });

export const onBooksUpdateIndexAlgolia = functions
    .region("europe-west3")
    .firestore
    .document("books/{userId}")
    .onWrite((snap, context) => {
        const indexName = "books";
        return updateIndex(snap, indexName);
    });

/**
 * This function is only used to reset the database daily
 */
export const scheduledFirestoreImport = functions
    .region("europe-west3")
    .pubsub
    .schedule("every 30 minutes")
    .onRun((context) => {
        return importDatabaseBackup();
    });


export {
    coingeckoMultipleFirestoreImport,
} from "./crypto";
