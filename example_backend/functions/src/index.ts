import * as functions from "firebase-functions";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { deleteInAlgolia, indexInAlgolia } from "./algolia";
import {  importDatabaseBackup } from "./backup";


export { setProductAvailableLocales } from "./products";

function updateIndex(snap: functions.Change<DocumentSnapshot>, indexName: string) {
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


/**
 * This function is only used to reset the database daily
 */
export const scheduledFirestoreImport = functions
    .region("europe-west3")
    .pubsub
    .schedule("every 24 hours")
    .onRun((context) => {
        return importDatabaseBackup();
    });


