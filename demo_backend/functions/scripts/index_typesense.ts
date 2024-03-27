import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
dotenv.config();

import { initServiceAccountFirestore } from "./util";

import { createSchemaInTypesense, indexInTypesense } from "../src/indexing/typesense";

initServiceAccountFirestore(true);

const firestore = admin.firestore();
createSchemaInTypesense("products");

firestore.collection("products")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInTypesense("products", d.data(), d.id);
        }));
