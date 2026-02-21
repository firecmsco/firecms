import { EntityCollection } from "@firecms/types";
import postsCollection from "./posts";

const tagsCollection: EntityCollection = {
    name: "Tags",
    singularName: "Tag",
    slug: "tags",
    dbPath: "tags",
    icon: "Tag",
    properties: {
        id: {
            type: "number",
            validation: { required: true }
        },
        name: {
            name: "Tag Name",
            type: "string",
            validation: { required: true }
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
