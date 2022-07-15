import * as admin from "firebase-admin";

export async function getDocuments(
    collectionPath: string,
    parentReference: admin.firestore.Firestore | admin.firestore.DocumentReference = admin.firestore(),
    limit = 100
): Promise<admin.firestore.DocumentSnapshot[]> {

    if (collectionPath.includes("/*/")) {
        const thisSubPath = collectionPath.slice(0, collectionPath.indexOf("/*/"));
        const nextSubPath = collectionPath.slice(collectionPath.indexOf("/*/") + 3);
        return parentReference
            .collection(thisSubPath)
            .limit(5)
            .get()
            .then((snapshot) =>
                Promise.all(
                    snapshot.docs.map((doc) =>
                        getDocuments(
                            nextSubPath,
                            doc.ref,
                            Math.max(Math.ceil(limit / 5), 5)
                        )))
            )
            .then((res) => res.flat());
    }


    const snapshot = await parentReference.collection(collectionPath).limit(limit).get();
    return snapshot.docs;
}
