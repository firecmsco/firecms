import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import DocumentReference = admin.firestore.DocumentReference;


/**
 * When a locale is updated, we check update the 'available_locales' field in the product
 */
export const setProductAvailableLocales = functions
    .region('europe-west3')
    .firestore
    .document('/products/{productId}/locales/{localeId}')
    .onWrite((change, context) => {
        const productRef: DocumentReference = change.after.ref.firestore
            .collection("products")
            .doc(context.params.productId);
        return availableLocalesForProduct(productRef)
            .then((availableLocales: string[]) => {
                console.debug("Available locales", availableLocales);
                return productRef.update({
                    available_locales: availableLocales
                });
            });
    });


function availableLocalesForProduct(productRef: DocumentReference): Promise<string[]> {
    return productRef
        .collection("locales")
        .get()
        .then((localesSnapshot) =>
            localesSnapshot.docs
                .filter((localeDoc) => localeDoc.get("selectable"))
                .map((localeDoc) => localeDoc.id));
}
