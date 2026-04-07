import { EntityCollection } from "@rebasepro/types/cms";
import postsCollection from "./posts";

const tagsCollection: EntityCollection = {
    name: "Tags",
    singularName: "Tag",
    slug: "tags",
    dbPath: "tags",
    icon: "Tag",
    history: true,
    properties: {
        id: {
            name: "ID",
            type: "number",
            validation: {
                required: true
            }
        },
        name: {
            name: "Tag Name!",
            type: "string",
            validation: {
                required: true
            }
        }
    },
    relations: [
        {
            relationName: "posts",
            target: () => postsCollection,
            cardinality: "many",
            direction: "inverse",
            inverseRelationName: "tags",
        }
    ]
};

export default tagsCollection;
