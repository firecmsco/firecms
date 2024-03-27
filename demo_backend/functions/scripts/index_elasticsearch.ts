import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();
import { initServiceAccountFirestore } from "./util";
import { indexInElasticSearch } from "../src/indexing/elasticsearch";

initServiceAccountFirestore(true);

const firestore = admin.firestore();
// firestore.collection("/blog")
//     .get()
//     .then(async (snapshot) => {
//         for (const d of snapshot.docs) {
//             await indexInElasticSearch("blog", d.data(), d.id);
//         }
//     });

firestore.collection("/users")
    .get()
    .then(async (snapshot) => {
        for (const d of snapshot.docs) {
            await indexInElasticSearch("users", d.data(), d.id);
        }
    });
//
// firestore.collection("products")
//     .get()
//     .then(async (snapshot) => {
//         for (const d of snapshot.docs) {
//             await indexInElasticSearch("products", d.data(), d.id);
//         }
//     });
