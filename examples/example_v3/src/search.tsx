import { buildPineconeSearchController, performPineconeTextSearch } from "@firecms/firebase";

export const pineconeSearchControllerBuilder = buildPineconeSearchController({
    isPathSupported: (path) => {
        return ["products"].includes(path);
    },
    search: async ({
                       path,
                       searchString,
                       currentUser
                   }) => {
        if (path === "products")
            return performPineconeTextSearch({
                firebaseToken: await currentUser.getIdToken(),
                projectId: "firecms-demo-27150",
                collectionPath: "products",
                query: searchString
            });
        throw new Error("Path not supported");
    }
});
