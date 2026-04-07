import { EntityCollection } from "@rebasepro/types";
import profilesCollection from "./profiles";
import postsCollection from "./posts";

const authorsCollection: EntityCollection = {
    name: "Authors",
    singularName: "Author",
    slug: "authors",
    dbPath: "authors",
    icon: "Person",
    history: true,
    properties: {
        id: {
            name: "ID",
            type: "number",
            isId: "increment"
        },
        name: {
            name: "Name",
            type: "string",
            validation: {
                required: true
            },
            callbacks: {
                beforeSave: ({ value }) => {
                    return value?.trim();
                }
            }
        },
        email: {
            name: "Email",
            type: "string",
            validation: {
                required: true
            },
            callbacks: {
                beforeSave: ({ value }) => {
                    return value?.trim();
                },
                afterRead: ({ value }) => {
                    // Sample logic to obscure the email for testing
                    if (value && typeof value === "string") {
                        const parts = value.split("@");
                        if (parts.length === 2) {
                            return `${parts[0].slice(0, 2)}***@${parts[1]}`;
                        }
                    }
                    return value;
                }
            }
        },
        picture: {
            name: "Picture",
            type: "string",
            validation: {
                required: false
            },
            storage: {
                storagePath: "author_pictures/"
            }
        },
        profile: {
            name: "Profile",
            type: "relation",
            relationName: "profile",
            description: "Profile of the author",
            relation: {
                relationName: "profile",
                target: () => profilesCollection,
                cardinality: "one",
                direction: "inverse",
                inverseRelationName: "author"
            }
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
    ],
    propertiesOrder: [
        "id",
        "email",
        "picture",
        "profile",
        "name"
    ],
    callbacks: {
        beforeSave: ({ values }) => {
            return values;
        },
        afterSave: ({ values }) => {
        }
    },
    Actions: [],
    filter: undefined,
    sort: [
        "email",
        "asc"
    ]
};

export default authorsCollection;
