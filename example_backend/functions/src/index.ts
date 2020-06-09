import * as functions from "firebase-functions";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { deleteInAlgolia, indexInAlgolia } from "./algolia";


function updateIndex(snap: functions.Change<DocumentSnapshot>, indexName: string) {
    if (!snap.after.exists) return deleteInAlgolia(indexName, snap.after.id);
    return indexInAlgolia(indexName, snap.after.data(), snap.after.id);
}

export const onBlogUpdateIndexAlgolia = functions
    .region("europe-west1")
    .firestore
    .document("blog/{blogId}")
    .onWrite((snap, context) => {
        const indexName = "blog";
        return updateIndex(snap, indexName);
    });

export const onProductsUpdateIndexAlgolia = functions
    .region("europe-west1")
    .firestore
    .document("products/{productId}")
    .onWrite((snap, context) => {
        const indexName = "products";
        return updateIndex(snap, indexName);
    });

export const onUsersUpdateIndexAlgolia = functions
    .region("europe-west1")
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
    .region("europe-west1")
    .pubsub
    .schedule('every 24 hours')
    .onRun((context) => {

        const bucket = 'gs://firecms_firestore_backups/2020-06-09T21:01:18_12964'
        const firestore = require('@google-cloud/firestore');
        const client = new firestore.v1.FirestoreAdminClient();

        const databaseName = client.databasePath(
            process.env.GCLOUD_PROJECT,
            '(default)'
        );

        return client
            .importDocuments({
                name: databaseName,
                inputUriPrefix: bucket,
                collectionIds: [],
            })
            .then((responses: any) => {
                const response = responses[0];
                console.log(`Operation Name: ${response['name']}`);
                return response;
            })
            .catch((err: any) => {
                console.error(err);
            });
    });

