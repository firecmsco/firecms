import * as functions from "firebase-functions";

/**
 * To create a new export:
 * ```
 * gcloud firestore export gs://firecms_firestore_backups --project firecms-demo-27150
 * ```
 */
const bucket = "gs://firecms_firestore_backups/2021-08-27T10:13:57_12516";

export function eraseDatabase() {
    const firebase_tools = require("firebase-tools");
    console.log("Deleting database");
    const deleteConfig = {
        project: process.env.GCLOUD_PROJECT,
        recursive: true,
        yes: true,
        token: functions.config().fb.token
    };
    return firebase_tools.firestore
        .delete("/users", deleteConfig)
        .then(() => firebase_tools.firestore
            .delete("/products", deleteConfig))
        .then(() => firebase_tools.firestore
            .delete("/blog", deleteConfig))
        .then(() => {
            console.log("Database erased");
            return Promise.resolve();
        })
        .catch((err: any) => {
            console.error("error erasing db", err);
        });
}

export function importDatabaseBackup() {
    const firestore = require("@google-cloud/firestore");
    const client = new firestore.v1.FirestoreAdminClient();

    console.log("Restoring backup database");
    const databaseName = client.databasePath(
        process.env.GCLOUD_PROJECT,
        "(default)"
    );

    return client
        .importDocuments({
            name: databaseName,
            inputUriPrefix: bucket,
            collectionIds: []
        })
        .then((responses: any) => {
            const response = responses[0];
            console.log(`Operation Name: ${response["name"]}`);
            return response;
        })
        .catch((err: any) => {
            console.error(err);
        });
}

