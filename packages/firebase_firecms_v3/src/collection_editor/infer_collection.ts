import { FirebaseApp } from "firebase/app";
import { getInferredEntityCollection } from "./schema_inference";
import { CollectionInference } from "@firecms/collection_editor";

export const buildCollectionInference = (dataFirebaseApp?: FirebaseApp): CollectionInference | undefined => {
    if (!dataFirebaseApp) return undefined;
    return (path: string, collectionGroup: boolean, parentPathSegments: string[]) => {
        return getInferredEntityCollection(dataFirebaseApp, path, collectionGroup, parentPathSegments)
    };
}
