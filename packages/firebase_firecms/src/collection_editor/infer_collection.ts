import { FirebaseApp } from "firebase/app";
import { getInferredEntityCollection } from "./schema_inference";
import { CollectionInference } from "@firecms/collection_editor";
import { getFirestore } from "firebase/firestore";

export const buildCollectionInference = (dataFirebaseApp?: FirebaseApp): CollectionInference | undefined => {
    if (!dataFirebaseApp) return undefined;
    return (path: string, collectionGroup: boolean, parentPathSegments: string[]) => {
        const firestore = getFirestore(dataFirebaseApp);
        return getInferredEntityCollection(firestore, path, collectionGroup, parentPathSegments)
    };
}
