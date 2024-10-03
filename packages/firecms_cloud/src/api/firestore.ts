import { DocumentReference, getDoc, QueryDocumentSnapshot } from "@firebase/firestore";
import { Product, ProductPrice, Subscription } from "../types/subscriptions";

export async function convertDocToSubscription(doc: QueryDocumentSnapshot) {
    const [price, product] = await Promise.all([fetchPrice(doc.data().price), fetchProduct(doc.data().product)]);
    if (!price) {
        console.warn("Price not found for subscription", doc.id);
        return undefined;
    }
    return ({
        id: doc.id,
        ...doc.data(),
        price,
        product
    } as Subscription);
}

export function fetchPrice(ref: DocumentReference): Promise<ProductPrice | undefined> {
    return getDoc(ref)
        .then((priceDoc) => {
            if (!priceDoc.exists()) {
                return undefined;
            }
            return {
                id: priceDoc.id,
                ...(priceDoc.data() ?? {})
            } as ProductPrice;
        });
}

export function fetchProduct(ref: DocumentReference): Promise<Product | undefined> {
    return getDoc(ref)
        .then((priceDoc) => {
            if (!priceDoc.exists()) {
                return undefined;
            }
            return {
                id: priceDoc.id,
                ...(priceDoc.data() ?? {})
            } as Product;
        });
}
