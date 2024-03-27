import * as admin from "firebase-admin";
import axios from "axios";
import { initServiceAccountFirestore } from "./util";

initServiceAccountFirestore(true);

const firestore = admin.firestore();

const generateUsers = async () => {
    const url = `https://randomuser.me/api/?results=500`;
    const response = await axios.get(url);
    console.log(response);
    response.data.results.forEach((data: any) => firestore
        .collection("users")
        .doc()
        .set({
            email: data.email,
            gender: data.gender,
            first_name: data.name.first,
            last_name: data.name.last,
            picture: data.picture,
            location: data.location,
            phone: data.phone
        }));

};
generateUsers();


