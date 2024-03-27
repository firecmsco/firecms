import * as admin from "firebase-admin";
import { initServiceAccountFirestore } from "./util";

initServiceAccountFirestore(true);

const firestore = admin.firestore();

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

const addLikes = async () => {
    const productsIds = await firestore
        .collection("products")
        .get().then(snapshot => snapshot.docs.map(d => d.ref));
    firestore
        .collection("users")
        .get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                const count = getRandomInt(4);
                const products = Array.from({ length: count })
                    .fill(0)
                    .map((_) => productsIds[getRandomInt(productsIds.length)]);
                // console.log(products);
                doc.ref.update({ liked_products: products });
            });
        });
};
addLikes();


