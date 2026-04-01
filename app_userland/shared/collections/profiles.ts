import { EntityCollection } from "@rebasepro/types";
import authorsCollection from "./authors";

const profilesCollection: EntityCollection = {
    name: "Profiles",
    singularName: "Profile",
    slug: "profiles",
    dbPath: "profiles",
    icon: "AccountCircle",

    properties: {
        id: {
            name: "ID",
            type: "number",
            validation: { required: true }
        },
        bio: {
            name: "Biography",
            type: "string",
            multiline: true
        },
        website: {
            name: "Website",
            type: "string"
        },
        author: {
            name: "Author",
            type: "relation",
            relationName: "author"
        }
    },
    relations: [
        {
            relationName: "author",
            target: () => authorsCollection,
            cardinality: "one",
        }
    ]
};

export default profilesCollection;
