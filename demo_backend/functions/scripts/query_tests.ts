import * as admin from "firebase-admin";
import { initServiceAccountFirestore } from "./util";

const fs = require("fs");

initServiceAccountFirestore(true);

const firestore = admin.firestore();

const queryProducts = async () => {
    firestore
        .collection("products")
        .where("category", "==", "cameras")
        .orderBy("available", "desc")
        .get()
        .then((snapshot) => {
                snapshot.docs.forEach((doc) => {
                    console.log(doc.id, "=>", doc.data());
                });
            }
        );
};
queryProducts();
