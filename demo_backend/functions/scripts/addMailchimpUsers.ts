import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

import { initServiceAccountFirestore } from "./util";
import { addUserToMailchimp } from "../src/mailchimp";

initServiceAccountFirestore(true);

const firestore = admin.firestore();

const domains = new Set()
// const startDate = new Date(2022, 1, 1);
// list all users with the firebase admin sdk
admin.auth().listUsers().then(async (listUsersResult) => {

    // add user email domain to set
    listUsersResult.users.forEach((userRecord) => {
        if(userRecord?.email)
        domains.add(userRecord?.email.split("@")[1]);
    });
    console.log(domains);
    console.log(domains.size)

    // const result = listUsersResult.users.filter((userRecord) => {
    //     const date = new Date(Date.parse(userRecord.metadata.creationTime));
    //     return date < startDate;
    // }).sort((a, b) => {
    //     return Date.parse(b.metadata.creationTime) - Date.parse(a.metadata.creationTime);
    // });
    // for (const userRecord of result) {
    //     const date = new Date(Date.parse(userRecord.metadata.creationTime));
    //     console.log("user", userRecord.email, date);
    //     try {
    //         if (userRecord.email)
    //             await addUserToMailchimp(userRecord.email, "import");
    //     } catch (e) {
    //         console.error(userRecord.email);
    //     }
    // }
});

//
