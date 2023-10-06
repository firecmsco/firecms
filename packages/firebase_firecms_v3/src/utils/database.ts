import { FirebaseApp } from "firebase/app";
import { collection, getDocs, getFirestore, limit as limitClause, query } from "firebase/firestore";

export function getFirestoreDataInPath(firebaseApp: FirebaseApp, path: string, limit: number): Promise<object[]> {
    const firestore = getFirestore(firebaseApp);
    const q = query(collection(firestore, path), limitClause(limit));
    return getDocs(q).then((querySnapshot) => {
        return querySnapshot.docs.map(doc => doc.data());
    });
}
