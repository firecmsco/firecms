import { collection, collectionGroup, DocumentSnapshot, Firestore, getDocs, limit, query } from "@firebase/firestore";

export async function getDocuments(
    firestore: Firestore,
    collectionPath: string,
    isCollectionGroup: boolean = false,
    parentPathSegments?: string[],
    limitCount = 100
): Promise<DocumentSnapshot[]> {

    console.debug("Getting documents", {
        collectionPath,
        isCollectionGroup,
        parentPathSegments,
        limitCount
    });

    if (parentPathSegments && (parentPathSegments ?? [])?.length > 0) {
        const [thisSubPath, ...restSubpaths] = parentPathSegments;
        const childDocs = await getDocs(query(collection(firestore, thisSubPath), limit(5)));
        console.debug("Got child documents", thisSubPath, childDocs.docs);
        return Promise.all(childDocs.docs
            .map((doc) => getDocuments(
                firestore,
                doc.ref.path + "/" + collectionPath,
                isCollectionGroup,
                restSubpaths,
                Math.max(Math.ceil(limitCount / 5), 5)
            )))
            .then((res) => res.flat());
    }

    const q = query(
        isCollectionGroup ? collectionGroup(firestore, collectionPath) : collection(firestore, collectionPath),
        limit(limitCount));
    const res = await getDocs(q);
    console.debug("Got documents", isCollectionGroup, q, res.docs);
    return res.docs;
}
