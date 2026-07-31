import { getFirestore } from "firebase-admin/firestore";

import { initServiceAccountFirestore } from "./util";

initServiceAccountFirestore(true);

const firestore = getFirestore();
firestore.collection("/blog")
    .where("status", "==", "draft")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            d.ref.delete();
        }));
