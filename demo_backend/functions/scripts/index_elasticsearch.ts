import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config();
import { initServiceAccountFirestore } from "./util";
import { indexInElasticSearch } from "../src/indexing/elasticsearch";

initServiceAccountFirestore(true);

const firestore = getFirestore();
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
