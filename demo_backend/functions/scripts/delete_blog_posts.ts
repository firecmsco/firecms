import * as admin from "firebase-admin";

import { initServiceAccountFirestore } from "./util";

initServiceAccountFirestore(true);

const firestore = admin.firestore();
firestore.collection("/blog")
    .where("status", "==", "draft")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            d.ref.delete();
        }));
