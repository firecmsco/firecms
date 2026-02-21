import { EntityCollection } from "@firecms/types";
import profilesCollection from "./profiles";
import postsCollection from "./posts";

const authorsCollection: EntityCollection = {
    name: "Authors",
    singularName: "Author",
    slug: "authors",
    dbPath: "authors",
    icon: "Person",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        name: {
            name: "Name",
            type: "string",
            validation: { required: true }
        },
        email: {
            name: "Email",
            type: "string",
            email: true,
            validation: { required: true }
        },
        picture: {
            name: "Picture",
            type: "string",
            validation: { required: false },
            storage: {
                storagePath: "author_pictures/",
            }
        },
        profile: {
            name: "Profile",
            type: "relation",
            relationName: "profile"
        }
    },
    relations: [
        {
            relationName: "profile",
            target: () => profilesCollection,
            cardinality: "one",
            direction: "inverse",
            inverseRelationName: "author"
        },
        {
            relationName: "posts",
            target: () => postsCollection,
            cardinality: "many",
            direction: "inverse",
            inverseRelationName: "author"
        }
    ]
};

export default authorsCollection;
