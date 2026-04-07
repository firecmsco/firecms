import { EntityCollection } from "@rebasepro/types";
import authorsCollection from "./authors";
import profilesCollection from "./profiles";
import tagsCollection from "./tags";

const postsCollection: EntityCollection = {
    name: "Posts",
    singularName: "Post",
    slug: "posts",
    dbPath: "posts",
    icon: "Article",
    history: true,
    properties: {
        id: {
            name: "IDt",
            type: "number",
            validation: {
                required: true
            }
        },
        title: {
            name: "Title",
            type: "string",
            validation: {
                required: true
            }
        },
        content: {
            name: "Content",
            type: "string",
            multiline: true
        },
        status: {
            name: "Status",
            type: "string",
            enum: [
                {
                    id: "draft",
                    label: "Draft",
                    color: "grayLight"
                },
                {
                    id: "review",
                    label: "In Review",
                    color: "orangeLight"
                },
                {
                    id: "published",
                    label: "Published",
                    color: "greenLight"
                },
                {
                    id: "archived",
                    label: "Archived",
                    color: "redLight"
                }
            ]
        },
        author: {
            name: "Author",
            type: "relation",
            relationName: "author",
            relation: {
                relationName: "author",
                cardinality: "one",
                direction: "owning"
            }
        },
        profile: {
            name: "Profile",
            type: "relation",
            relationName: "author_profile",
            relation: {
                relationName: "author_profile",
                cardinality: "one",
                direction: "inverse",
                joinPath: [
                    {
                        table: "authors",
                        on: {
                            from: "posts.author_id",
                            to: "authors.id"
                        }
                    },
                    {
                        table: "profiles",
                        on: {
                            from: "authors.id",
                            to: "profiles.author_id"
                        }
                    }
                ]
            }
        },
        tags: {
            name: "Tags",
            type: "relation",
            relationName: "tags",
            relation: {
                relationName: "tags",
                cardinality: "many",
                direction: "owning"
            }
        }
    },
    relations: [
        {
            relationName: "author",
            target: () => authorsCollection,
            cardinality: "one",
            direction: "owning",
        },
        {
            relationName: "tags",
            target: () => tagsCollection,
            cardinality: "many",
            direction: "owning",
        },
        {
            relationName: "author_profile",
            target: () => profilesCollection,
            cardinality: "one",
            direction: "inverse",
            joinPath: [
                {
                    table: "authors",
                    on: {
                        from: "posts.author_id",
                        to: "authors.id"
                    }
                },
                {
                    table: "profiles",
                    on: {
                        from: "authors.id",
                        to: "profiles.author_id"
                    }
                }
            ]
        }
    ]
};

export default postsCollection;
