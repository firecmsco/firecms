import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

import { initServiceAccountFirestore } from "./util";
import { indexInMeiliSearch } from "../src/meilisearch";

initServiceAccountFirestore(true);

const firestore = admin.firestore();
firestore.collection("/blog")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInMeiliSearch("blog", d.data(), d.id);
        }));

firestore.collection("/users")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInMeiliSearch("users", d.data(), d.id);
        }));

firestore.collection("products")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInMeiliSearch("products", d.data(), d.id);
        }));
