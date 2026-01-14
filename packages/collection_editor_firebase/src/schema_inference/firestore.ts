import {
    collection,
    collectionGroup,
    DocumentSnapshot,
    Firestore,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
    where,
    WhereFilterOp
} from "@firebase/firestore";
import { FilterValues } from "@firecms/core";

export async function getDocuments(
    firestore: Firestore,
    collectionPath: string,
    isCollectionGroup: boolean = false,
    parentPathSegments?: string[],
    initialFilter?: FilterValues<string>,
    initialSort?: [string, "asc" | "desc"],
    limitCount = 200
): Promise<DocumentSnapshot[]> {

    if (parentPathSegments && (parentPathSegments ?? [])?.length > 0) {
        const [thisSubPath, ...restSubpaths] = parentPathSegments;
        const childLimit = 5;
        const childDocs = await getDocs(query(collection(firestore, thisSubPath), limit(limitCount)));
        return Promise.all(childDocs.docs
            .map((doc) => getDocuments(
                firestore,
                doc.ref.path + "/" + collectionPath,
                isCollectionGroup,
                restSubpaths,
                initialFilter,
                initialSort,
                Math.max(Math.ceil(limitCount / 5), childLimit)
            )))
            .then((res) => res.flat());
    }

    // Build query constraints
    const constraints: QueryConstraint[] = [];

    // Apply initialFilter if provided
    if (initialFilter) {
        for (const [field, filterValue] of Object.entries(initialFilter)) {
            if (filterValue && Array.isArray(filterValue) && filterValue.length === 2) {
                const [op, value] = filterValue;
                if (value !== undefined && value !== null) {
                    constraints.push(where(field, op as WhereFilterOp, value));
                }
            }
        }
    }

    // Apply initialSort if provided
    if (initialSort && initialSort.length === 2) {
        constraints.push(orderBy(initialSort[0], initialSort[1]));
    }

    // Always apply limit
    constraints.push(limit(limitCount));

    const q = query(
        isCollectionGroup ? collectionGroup(firestore, collectionPath) : collection(firestore, collectionPath),
        ...constraints
    );
    const res = await getDocs(q);
    console.debug("Got documents for inference", {
        isCollectionGroup,
        initialFilter,
        initialSort,
        docCount: res.docs.length
    });
    return res.docs;
}
