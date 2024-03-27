import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import {initServiceAccountFirestore} from "./util";

dotenv.config();

initServiceAccountFirestore(true);

const domains = new Set()
// const startDate = new Date(2022, 1, 1);
// list all users with the firebase admin sdk
admin.auth().listUsers().then(async (listUsersResult) => {

    // add user email domain to set
    listUsersResult.users.forEach((userRecord) => {
        if (userRecord?.email)
            domains.add(userRecord?.email.split("@")[1]);
    });
    console.log(domains);
    console.log(domains.size)

});
