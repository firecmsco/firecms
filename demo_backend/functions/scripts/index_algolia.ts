import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();
import {initServiceAccountFirestore} from "./util";
import {indexInAlgolia} from "../src/indexing/algolia";

initServiceAccountFirestore(true);

const firestore = admin.firestore();
firestore.collection("/blog")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInAlgolia("blog", d.data(), d.id);
        }));

firestore.collection("/users")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInAlgolia("users", d.data(), d.id);
        }));

firestore.collection("products")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInAlgolia("products", d.data(), d.id);
        }));
