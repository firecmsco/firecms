import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
dotenv.config();

import { initServiceAccountFirestore } from "./util";

import { createSchemaInTypesense, indexInTypesense } from "../src/indexing/typesense";

initServiceAccountFirestore(true);

const firestore = getFirestore();
createSchemaInTypesense("products");

firestore.collection("products")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInTypesense("products", d.data(), d.id);
        }));
