import { FirebaseApp } from "@firebase/app";
import { getInferredEntityCollection } from "./schema_inference";
import { CollectionInference } from "@firecms/collection_editor";
import { getFirestore } from "@firebase/firestore";
import { FilterValues } from "@firecms/core";

export const buildCollectionInference = (dataFirebaseApp?: FirebaseApp): CollectionInference | undefined => {
    if (!dataFirebaseApp) return undefined;
    return async (
        path: string,
        collectionGroup: boolean,
        parentPathSegments: string[],
        databaseId?: string,
        initialFilter?: FilterValues<string>,
        initialSort?: [string, "asc" | "desc"]
    ) => {
        const firestore = databaseId
            ? getFirestore(dataFirebaseApp, databaseId)
            : getFirestore(dataFirebaseApp);
        const inferredEntityCollection = await getInferredEntityCollection(firestore, path, collectionGroup, parentPathSegments, initialFilter, initialSort);
        console.debug("Inferred entity collection", inferredEntityCollection);
        return inferredEntityCollection
    };
}
