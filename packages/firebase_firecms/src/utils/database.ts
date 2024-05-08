import { FirebaseApp } from "@firebase/app";
import {
    collection,
    getDocs,
    getFirestore,
    limit as limitClause,
    query,
    QueryDocumentSnapshot
} from "@firebase/firestore";

export async function getFirestoreDataInPath(firebaseApp: FirebaseApp, path: string, parentPaths: string[], limit: number): Promise<object[]> {
    console.debug("getFirestoreDataInPath", path, limit)
    const firestore = getFirestore(firebaseApp);
    if (!parentPaths) {
        const q = query(collection(firestore, path), limitClause(limit));
        return getDocs(q).then((querySnapshot) => {
            return querySnapshot.docs.map(doc => doc.data());
        });
    } else {
        let currentDocs: QueryDocumentSnapshot[] | undefined = undefined;
        let index = 0;
        const allPaths = parentPaths;
        allPaths.push(path);
        let parentPath: string | undefined = allPaths[0];
        while (parentPath) {
            if (currentDocs) {
                currentDocs = (await Promise.all(currentDocs.map(async (doc) => {
                    const q = query(collection(firestore, doc.ref.path, parentPath as string), limitClause(5));
                    return (await getDocs(q)).docs;
                }))).flat();
            } else {
                const q = query(collection(firestore, parentPath), limitClause(5));
                currentDocs = (await getDocs(q)).docs;
            }
            index++;
            parentPath = index < allPaths.length ? allPaths[index] : undefined;
        }
        return currentDocs ? currentDocs.map(doc => doc.data()) : [];
    }
}
