import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export function initServiceAccountFirestore(prod: boolean = false) {

    console.log("Init script firestore");

    // you may need to create this file from the cloud console
    const serviceAccount = require("../../../../firecms-demo-27150-dbdddbfce101.json");

    initializeApp({
        credential: cert(serviceAccount)
    });

    return getFirestore();
}
