import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Change } from "firebase-functions/v1";
import { DocumentSnapshot } from "firebase-functions/v1/firestore";

import { deleteInAlgolia, indexInAlgolia } from "./algolia";
import { importDatabaseBackup } from "./backup";
import { addUserToMailchimp } from "./mailchimp";

admin.initializeApp();

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
    .schedule("every 1 hours")
    .onRun((context) => {
        return importDatabaseBackup();
    });

export const sign_up_newsletter = functions
    .region("europe-west3")
    .https
    .onRequest((req, res) => {

        const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        console.log("sign_up_newsletter", data, typeof data);
        res.set('Access-Control-Allow-Origin', '*');

        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type');
            res.set('Access-Control-Max-Age', '3600');
            res.status(204).send('');
            return Promise.resolve();
        } else {

            const emailAddress = data.email_address;
            const source = data.source;

            if (!emailAddress)
                throw Error("empty email_address");
            const result = addUserToMailchimp(emailAddress, source);
            return result
                .then(function (response: any) {
                    console.log("response from mailchimp", response);
                    res.send(response);
                    res.sendStatus(200);
                })
                .catch(function (error: any) {
                    console.error(error);
                    res.sendStatus(500);
                });
        }

    });

export {
    alpacaBchFirestoreImport, alpacaEthFirestoreImport, alpacaBtcFirestoreImport, alpacaLtcFirestoreImport
} from "./alpaca";
