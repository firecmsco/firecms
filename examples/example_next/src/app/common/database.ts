import { firebaseApp, storage } from "./firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    limit as limitClause,
    query,
    QueryConstraint,
    where
} from "firebase/firestore";
import { getDownloadURL, ref } from "@firebase/storage";
import { BlogEntryWithId, ProductWithId } from "@/app/common/types";


export const getProducts = async ({
                                      limit = 10,
                                      categoryFilter,
                                      minPriceFilter,
                                      maxPriceFilter
                                  }: {
    limit?: number;
    categoryFilter?: string,
    minPriceFilter?: number,
    maxPriceFilter?: number,
}): Promise<ProductWithId[]> => {
    console.log("Getting products", { limit, categoryFilter });
    const colRef = collection(getFirestore(firebaseApp), "products");
    const queryConstraints: QueryConstraint[] = [limitClause(limit)];
    if (categoryFilter) {
        queryConstraints.push(where("category", "==", categoryFilter));
    }
    if (minPriceFilter !== undefined) {
        queryConstraints.push(where("price", ">=", minPriceFilter));
    }
    if (maxPriceFilter !== undefined) {
        queryConstraints.push(where("price", "<=", maxPriceFilter));
    }
    console.log("Products query constraints", queryConstraints);
    const querySnapshot = await getDocs(query(colRef, ...queryConstraints));
    return Promise.all(querySnapshot.docs.map((doc) => convertProduct(doc.data(), doc.id)));
};


export const getProduct = async (id: string): Promise<ProductWithId | null> => {
    console.log("Getting product", id);
    const docRef = doc(getFirestore(firebaseApp), "products", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
    return convertProduct(docSnap.data(), docSnap.id,);
};

export async function convertProduct(data: Record<string, any>, id: string): Promise<ProductWithId> {
    const images = await Promise.all((data.images ?? []).map(async (image: any) => {
        return await getDownloadURL(ref(storage, image));
    }));
    return {
        id,
        name: data.name,
        images: images,
        category: data.category,
        available: data.available,
        price: data.price,
        currency: data.currency,
        public: data.public,
        brand: data.brand,
        description: data.description,
        amazon_link: data.amazon_link,
        publisher: data.publisher,
        tags: data.tags,
        added_on: "added_on" in data && data.added_on instanceof Date ? data.added_on : (data["added_on"] as any)?.toDate(),
    } as ProductWithId;
}

export const getBlogEntries = async ({
                                         limit = 10,
                                     }: {
    limit?: number;
}): Promise<BlogEntryWithId[]> => {
    console.log("Getting blog entries", { limit });
    const colRef = collection(getFirestore(firebaseApp), "blog");
    const queryConstraints: QueryConstraint[] = [limitClause(limit)];
    queryConstraints.push(where("status", "==", "published"));
    console.log("Blog entries query constraints", queryConstraints);
    const querySnapshot = await getDocs(query(colRef, ...queryConstraints));
    return Promise.all(querySnapshot.docs.map((doc) => convertBlogEntry(doc.data(), doc.id)));
}

export const getBlogEntry = async (id: string): Promise<BlogEntryWithId | null> => {
    console.log("Getting blog entry", id);
    const docRef = doc(getFirestore(firebaseApp), "blog", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return null;
    }
    return convertBlogEntry(docSnap.data(), docSnap.id,);
}

export async function convertBlogEntry(data: Record<string, any>, id: string): Promise<BlogEntryWithId> {

    const content = await Promise.all((data.content ?? []).map(async (content: any) => {
        if (content.type === "images") {
            return {
                type: "images",
                value: await Promise.all((content.value ?? []).map((image: string) => {
                    return getDownloadURL(ref(storage, image));
                }))
            }
        } else if (content.type === "text") {
            return {
                type: "text",
                value: content.value
            }
        } else if (content.type === "quote") {
            return {
                type: "quote",
                value: content.value
            }
        } else if (content.type === "products") {
            return {
                type: "products",
                value: await Promise.all((content.value ?? []).map((entry: any) => {
                    try {
                        return getProduct(entry.id);
                    } catch (e) {
                        console.error("Error getting product", entry.id, e);
                        return [];
                    }
                }))
            }
        } else {
            throw new Error("Unexpected content type in blog entry: " + content.type);
        }

    }));

    let headerImage: string | undefined;
    try {
        headerImage = data.header_image ? await getDownloadURL(ref(storage, data.header_image)) : undefined;
    } catch (e) {
        console.error("Error getting header image", data.header_image, e);
        headerImage = "undefined";
    }
    return {
        id,
        name: data.name,
        header_image: headerImage,
        content: content,
        created_on: data.created_on?.toDate(),
        reviewed: data.reviewed,
        status: data.status,
        tags: data.tags,
    } as BlogEntryWithId;
}

