import * as admin from "firebase-admin";
import { initServiceAccountFirestore } from "./util";

initServiceAccountFirestore(true);

const firestore = admin.firestore();

const listProducts = async () => {
    if (process.env.NODE_ENV === "production") return;

    firestore
        .collection("blog")
        .get()
        .then((snapshot) => {
            const ids = snapshot.docs.map((doc) => doc.id);
            // save to file
            const fs = require("fs");
            fs.writeFile("blogds.json", JSON.stringify(ids), function (err: any) {
                if (err) {
                    return console.error(err);
                }
                console.log("The file was saved!");
            });

            console.log(ids);
            }
        );
};
listProducts();
