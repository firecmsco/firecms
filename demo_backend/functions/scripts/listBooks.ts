import * as admin from "firebase-admin";
import axios from "axios";
import { initServiceAccountFirestore } from "./util";
const fs = require("fs");

initServiceAccountFirestore(true);

const firestore = admin.firestore();

const categories = new Set<string>();
const catMap: Record<string, any> = {};
const generateBooks = async () => {
    if (process.env.NODE_ENV === "production") return;

    firestore
        .collection("books")
        .get()
        .then((snapshot) => {
                fs.writeFile("bookids.json", JSON.stringify(snapshot.docs.map((doc) => doc.id)), function (err: any) {
                    if (err) {
                        return console.error(err);
                    }
                    console.log("The file was saved!");
                });
            }
        );
};
generateBooks();
